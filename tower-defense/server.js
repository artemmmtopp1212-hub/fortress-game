/**
 * Многопользовательская игра «Оборона базы» — сервер
 * -------------------------------------------------
 * Node.js + WebSocket (библиотека `ws`).
 * Реализует:
 *  - комнаты до 6 игроков (создание/присоединение по id)
 *  - свободное перемещение WASD
 *  - ресурсы: дерево, камень, еда
 *  - строительство: стены, башни, генераторы, казармы (+ улучшения)
 *  - волны мобов (пехота, бегун, танк, летающий) с возрастающей сложностью
 *  - боевая система (игроки, башни, нанятые юниты)
 *  - пространственное хеширование для коллизий
 *  - рассылка обновлений 25 раз/с (TICK_RATE_MS = 40 мс)
 *
 * Транспорт: JSON-сообщения (см. wire protocol внизу файла).
 */

const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');
const path = require('path');

// ==================== КОНСТАНТЫ ====================
const PORT = process.env.PORT || 8080;
const MAX_PLAYERS = 6;

const MAP_W = 1200;          // ширина карты (пикс)
const MAP_H = 800;           // высота карты
const BASE_X = MAP_W / 2;    // база в центре
const BASE_Y = MAP_H / 2;
const BASE_RADIUS = 40;      // радиус базы
const BASE_HP = 1000;

const GRID = 40;             // размер клетки для пространственного хеширования
const CELLS_COLS = MAP_W / GRID;
const CELLS_ROWS = MAP_H / GRID;

const TICK_RATE_MS = 40;     // 25 обновлений/с
const MOVE_SPEED = 200;      // пикс/с (3-4 клетки в секунду)

const SPAWN_MARGIN = 90;     // отступ точки спавна от границы
const MIN_DIST_FROM_BASE = 120; // мин. дистанция постройки от базы (2+ клетки)
const SPAWN_PATH_RADIUS = 60;   // «пропускная» зона рядом с базой (нельзя строить)

// Ресурсы
const START_GOLD = { wood: 200, stone: 200, food: 150 };

// ==================== ТИПЫ ПОСТРОЕК ====================
const BUILDINGS = {
  wall: {
    name: 'Стена', color: '#caa472',
    cost: { wood: 30 },
    hp: 300, size: 40, buildTime: 2, level: 1,
    desc: 'Блокирует и танкует урон пехоты'
  },
  tower: {
    name: 'Башня', color: '#e07b39',
    cost: { wood: 40, stone: 60 },
    hp: 200, size: 36, buildTime: 4, level: 1,
    damage: 18, range: 180, fireRate: 1.0, aa: false,
    desc: 'Автоматически атакует мобов. Улучшай для урона/скорости'
  },
  generator: {
    name: 'Генератор', color: '#7fdb6a',
    cost: { stone: 50, food: 20 },
    hp: 150, size: 34, buildTime: 3, level: 1,
    production: { wood: 1.2, stone: 1.2, food: 1.2 },
    desc: 'Пассивно добывает дерево/камень/еду'
  },
  barracks: {
    name: 'Казармы', color: '#c86b8c',
    cost: { wood: 80, food: 60 },
    hp: 250, size: 40, buildTime: 5, level: 1,
    maxUnits: 3, unitCooldown: 8,
    desc: 'Нанимает юнитов-стражей, патрулирующих базу'
  }
};

// Стоимость улучшений (множитель к следующему уровню)
function upgradeCost(type, level) {
  const base = BUILDINGS[type].cost;
  const mult = 1 + (level - 1) * 0.6;
  return {
    wood: Math.round((base.wood || 0) * mult),
    stone: Math.round((base.stone || 0) * mult),
    food: Math.round((base.food || 0) * mult)
  };
}

// ==================== ТИПЫ МОБОВ ====================
const MOBS = {
  infantry:  { name: 'Пехота',   color: '#d9534f', hp: 80,  speed: 70,  r: 14, dmg: 15, score: 10, fly: false, scale: 1.6 },
  runner:    { name: 'Бегун',    color: '#f0ad4e', hp: 45,  speed: 150, r: 11, dmg: 8,  score: 8,  fly: false, scale: 1.1 },
  tank:      { name: 'Танк',     color: '#5a5a5a', hp: 320, speed: 40,  r: 20, dmg: 30, score: 20, fly: false, scale: 2.0 },
  flying:    { name: 'Летающий', color: '#9370db', hp: 60,  speed: 120, r: 12, dmg: 10, score: 12, fly: true,  scale: 1.2 }
};

// ==================== ГЛОБАЛЬНОЕ СОСТОЯНИЕ ====================
const rooms = new Map(); // roomId -> Room

// ==================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ====================
function dist(x1, y1, x2, y2) {
  const dx = x1 - x2, dy = y1 - y2;
  return Math.sqrt(dx * dx + dy * dy);
}

function clamp(v, min, max) { return v < min ? min : (v > max ? max : v); }

function rand(min, max) { return min + Math.random() * (max - min); }

function randInt(min, max) { return Math.floor(rand(min, max + 1)); }

// Точка на границе карты
function randomSpawnPoint() {
  const side = randInt(0, 3);
  let x, y;
  const m = SPAWN_MARGIN;
  if (side === 0) { x = rand(m, MAP_W - m); y = m; }
  else if (side === 1) { x = rand(m, MAP_W - m); y = MAP_H - m; }
  else if (side === 2) { x = m; y = rand(m, MAP_H - m); }
  else { x = MAP_W - m; y = rand(m, MAP_H - m); }
  return { x, y };
}

// ==================== ПРОСТРАНСТВЕННОЕ ХЕШИРОВАНИЕ ====================
// Класс сетки для быстрого поиска «ближайший моб» и «свободная клетка».
class SpatialGrid {
  constructor(cellSize, cols, rows) {
    this.cell = cellSize;
    this.cols = cols;
    this.rows = rows;
    this.grid = new Map();
  }

  key(cx, cy) { return cx + ',' + cy; }

  clear() { this.grid = new Map(); }

  // Вставить объект с радиусом r в ячейки, которые он пересекает
  insert(id, x, y, r) {
    const minCx = Math.max(0, Math.floor((x - r) / this.cell));
    const maxCx = Math.min(this.cols - 1, Math.floor((x + r) / this.cell));
    const minCy = Math.max(0, Math.floor((y - r) / this.cell));
    const maxCy = Math.min(this.rows - 1, Math.floor((y + r) / this.cell));
    for (let cx = minCx; cx <= maxCx; cx++) {
      for (let cy = minCy; cy <= maxCy; cy++) {
        const k = this.key(cx, cy);
        if (!this.grid.has(k)) this.grid.set(k, new Set());
        this.grid.get(k).add(id);
      }
    }
  }

  // Все объекты, попавшие в окрестность точки (радиус r)
  query(x, y, r) {
    const minCx = Math.max(0, Math.floor((x - r) / this.cell));
    const maxCx = Math.min(this.cols - 1, Math.floor((x + r) / this.cell));
    const minCy = Math.max(0, Math.floor((y - r) / this.cell));
    const maxCy = Math.min(this.rows - 1, Math.floor((y + r) / this.cell));
    const out = new Set();
    for (let cx = minCx; cx <= maxCx; cx++) {
      for (let cy = minCy; cy <= maxCy; cy++) {
        const k = this.key(cx, cy);
        if (this.grid.has(k)) {
          for (const id of this.grid.get(k)) out.add(id);
        }
      }
    }
    return out;
  }
}

// ==================== КОМНАТА ====================
class Room {
  constructor(id) {
    this.id = id;
    this.clients = new Map(); // ws -> Player
    this.players = new Map(); // playerId -> Player
    this.buildings = new Map(); // bId -> Building
    this.mobs = new Map();     // mId -> Mob
    this.units = new Map();    // uId -> Unit
    this.projectiles = [];     // снаряды башен/юнитов
    this.mobGrid = new SpatialGrid(GRID, CELLS_COLS, CELLS_ROWS);
    this.buildGrid = new SpatialGrid(GRID, CELLS_COLS, CELLS_ROWS);
    this.nextId = 1;

    // Прогресс игры
    this.phase = 'waiting';        // waiting | build | combat
    this.wave = 0;
    this.buildTimer = 0;
    this.waveTimer = 0;
    this.baseHp = BASE_HP;
    this.baseMax = BASE_HP;
    this.waveTotal = 0;
    this.waveKilled = 0;
    this.score = 0;
    this.readyCount = 0;

    // Таймер
    this.ticker = setInterval(() => this.tick(), TICK_RATE_MS);
  }

  newId() { return 'e' + (this.nextId++); }

  // ---------- ПОДКЛЮЧЕНИЕ / ОТКЛЮЧЕНИЕ ----------
  addClient(ws) {
    this.clients.set(ws, null);
  }

  bindPlayer(ws, name) {
    const player = {
      id: this.newId(),
      name: name || 'Игрок',
      x: BASE_X + rand(-80, 80),
      y: BASE_Y + rand(-80, 80),
      dir: 1,
      res: { ...START_GOLD },
      hp: 100, maxHp: 100,
      speed: MOVE_SPEED,
      damage: 12,
      attackRange: 160,
      fireCooldown: 0,
      kills: 0,
      buildCount: 0,
      level: 1, xp: 0,
      upgrades: { speed: 0, damage: 0, hp: 0 },
      ws: ws
    };
    // если место полное — отказываем
    if (this.players.size >= MAX_PLAYERS) return false;
    this.players.set(player.id, player);
    this.clients.set(ws, player);
    this.sendTo(player.id, { type: 'welcome', id: player.id, map: { w: MAP_W, h: MAP_H }, base: { x: BASE_X, y: BASE_Y, r: BASE_RADIUS, hp: this.baseHp, max: this.baseMax } });
    return true;
  }

  removeClient(ws) {
    const p = this.clients.get(ws);
    if (p) {
      this.players.delete(p.id);
    }
    this.clients.delete(ws);
    // если все ушли — удаляем комнату через stop()
  }

  ready(ws) {
    const p = this.clients.get(ws);
    if (!p) return;
    p.ready = !p.ready;
    // подсчёт готовых
    let ready = 0;
    for (const pl of this.players.values()) if (pl.ready) ready++;
    if (ready === this.players.size && this.players.size >= 1) {
      this.startWave(1); // минимум 1 игрок может начать
    }
  }

  // ---------- ОТПРАВКА ----------
  broadcast(obj, include = null) {
    const msg = JSON.stringify(obj);
    for (const pl of this.players.values()) {
      if (include && !include.has(pl.id)) continue;
      if (pl.ws.readyState === WebSocket.OPEN) pl.ws.send(msg);
    }
  }

  sendTo(id, obj) {
    const p = this.players.get(id);
    if (p && p.ws.readyState === WebSocket.OPEN) p.ws.send(JSON.stringify(obj));
  }

  // ---------- УПРАВЛЕНИЕ ИГРОКОМ ----------
  handleMove(p, dir) {
    if (this.phase === 'waiting') return;
    if (dir && typeof dir.x === 'number' && typeof dir.y === 'number') {
      const len = Math.hypot(dir.x, dir.y) || 1;
      p.dirX = (dir.x / len);
      p.dirY = (dir.y / len);
      p.moving = true;
    } else {
      p.moving = false;
    }
  }

  handleShoot(p, tx, ty) {
    if (this.phase !== 'combat') return;
    if (p.fireCooldown > 0) return;
    if (dist(p.x, p.y, tx, ty) > p.attackRange) return;
    // урон по ближайшему мобу вдоль линии выстрела
    const target = this.nearestMob(tx, ty, 40, p.id);
    if (!target) return;
    p.fireCooldown = 0.6;
    this.damageMob(target, p.damage, p);
    this.projectiles.push({ x: p.x, y: p.y, tx: tx, ty: ty, px: p.x, py: p.y, speed: 600, type: 'player', color: '#ffe08a', ttl: 60 });
  }

  handleBuild(p, type, x, y) {
    if (this.phase === 'waiting' && type !== 'wall') return;
    if (this.phase === 'waiting' && type === 'wall') { /* можно строить стены до старта */ }
    if (!BUILDINGS[type]) return;
    const def = BUILDINGS[type];

    // границы карты
    x = clamp(x, 20, MAP_W - 20);
    y = clamp(y, 20, MAP_H - 20);

    // проверка дистанции до базы (кроме стен — можно ближе, но не впритык)
    if (type !== 'wall' && dist(x, y, BASE_X, BASE_Y) < MIN_DIST_FROM_BASE) {
      this.sendTo(p.id, { type: 'error', msg: 'Слишком близко к базе' });
      return;
    }
    // не строить прямо в зоне спавна вокруг базы
    if (dist(x, y, BASE_X, BASE_Y) < SPAWN_PATH_RADIUS + 10) {
      this.sendTo(p.id, { type: 'error', msg: 'Нельзя строить в проходе к базе' });
      return;
    }
    // стоимость
    const cost = def.cost;
    if (p.res.wood < (cost.wood || 0) || p.res.stone < (cost.stone || 0) || p.res.food < (cost.food || 0)) {
      this.sendTo(p.id, { type: 'error', msg: 'Недостаточно ресурсов' });
      return;
    }
    // занятость места (пространственный хеш постройками и мобами)
    const busy = this.buildGrid.query(x, y, def.size / 2 + 6);
    for (const bid of busy) {
      const b = this.buildings.get(bid);
      if (b && dist(b.x, b.y, x, y) < (b.size / 2 + def.size / 2 + 4)) {
        this.sendTo(p.id, { type: 'error', msg: 'Место занято' });
        return;
      }
    }
    // не строить на мобах
    const mobBusy = this.mobGrid.query(x, y, def.size / 2 + 6);
    for (const mid of mobBusy) {
      const m = this.mobs.get(mid);
      if (m && dist(m.x, m.y, x, y) < (m.r + def.size / 2 + 4)) {
        this.sendTo(p.id, { type: 'error', msg: 'Здесь враг' });
        return;
      }
    }

    // списать ресурсы
    p.res.wood -= (cost.wood || 0);
    p.res.stone -= (cost.stone || 0);
    p.res.food -= (cost.food || 0);

    const bId = this.newId();
    this.buildings.set(bId, {
      id: bId, type: type, owner: p.id,
      x: x, y: y, size: def.size,
      hp: def.hp, maxHp: def.hp,
      level: 1,
      buildTime: def.buildTime, buildLeft: def.buildTime,
      ready: false,
      ...(type === 'tower' ? { damage: def.damage, range: def.range, fireRate: def.fireRate, cooldown: 0, aa: false } : {}),
      ...(type === 'generator' ? { production: { ...def.production } } : {}),
      ...(type === 'barracks' ? { maxUnits: def.maxUnits, unitCooldown: def.unitCooldown, recruitLeft: def.unitCooldown, unitCount: 0 } : {})
    });
    p.buildCount++;
    // перестроить сетку построек
    this.rebuildBuildGrid();
    this.broadcast({ type: 'building', b: this.serializeBuilding(this.buildings.get(bId)) });
  }

  handleUpgrade(p, bId) {
    const b = this.buildings.get(bId);
    if (!b) return;
    if (b.owner !== p.id) { this.sendTo(p.id, { type: 'error', msg: 'Это не твоя постройка' }); return; }
    const nextLvl = b.level + 1;
    if (nextLvl > 5) { this.sendTo(p.id, { type: 'error', msg: 'Максимальный уровень' }); return; }
    const cost = upgradeCost(b.type, nextLvl);
    if (p.res.wood < (cost.wood || 0) || p.res.stone < (cost.stone || 0) || p.res.food < (cost.food || 0)) {
      this.sendTo(p.id, { type: 'error', msg: 'Недостаточно ресурсов' });
      return;
    }
    p.res.wood -= (cost.wood || 0);
    p.res.stone -= (cost.stone || 0);
    p.res.food -= (cost.food || 0);
    // применить эффект уровня
    b.level = nextLvl;
    if (b.type === 'tower') { b.damage += 8; b.fireRate *= 0.85; if (b.level >= 3) b.aa = true; }
    if (b.type === 'generator') { for (const k in b.production) b.production[k] += 0.5; }
    if (b.type === 'wall') { b.maxHp += 150; b.hp = b.maxHp; }
    if (b.type === 'barracks') { b.maxUnits += 1; }
    b.hp = Math.min(b.hp + 50, b.maxHp);
    this.broadcast({ type: 'upgraded', b: this.serializeBuilding(b) });
  }

  handleUpgradePlayer(p, stat) {
    const costs = { speed: 60, damage: 50, hp: 50 };
    if (!costs[stat]) return;
    const cost = costs[stat] * (p.upgrades[stat] + 1);
    if (p.res.food < cost) { this.sendTo(p.id, { type: 'error', msg: 'Недостаточно еды' }); return; }
    p.res.food -= cost;
    p.upgrades[stat]++;
    if (stat === 'speed') p.speed += 25;
    if (stat === 'damage') p.damage += 5;
    if (stat === 'hp') { p.maxHp += 25; p.hp = p.maxHp; }
    p.level++;
    this.sendTo(p.id, { type: 'self', p: this.serializePlayer(p) });
  }

  // ---------- СПАВН / УРОН / ИТЕРАЦИЯ ----------
  serializeBuilding(b) {
    return {
      id: b.id, type: b.type, x: b.x, y: b.y, hp: Math.round(b.hp), maxHp: b.maxHp,
      level: b.level, ready: b.ready, owner: b.owner,
      // доп. поля для клиента
      damage: b.damage, range: b.range, aa: b.aa,
      size: b.size, buildLeft: b.buildLeft
    };
  }

  serializeMob(m) {
    return { id: m.id, type: m.type, x: m.x, y: m.y, hp: Math.round(m.hp), maxHp: m.maxHp, r: m.r, fly: m.fly, color: MOBS[m.type].color };
  }

  serializePlayer(p) {
    return {
      id: p.id, name: p.name, x: p.x, y: p.y, hp: Math.round(p.hp), maxHp: p.maxHp,
      res: p.res, kills: p.kills, buildCount: p.buildCount, level: p.level,
      ready: !!p.ready, upgrades: p.upgrades
    };
  }

  startWave(n) {
    this.phase = 'combat';
    this.wave = n;
    this.waveTotal = this.computeWaveCount(n);
    this.waveKilled = 0;
    this.readyCount = 0;
    // сброс готовности
    for (const p of this.players.values()) p.ready = false;
    // спавн
    this.spawnWave(n);
    this.broadcast({ type: 'phase', phase: 'combat', wave: n });
    this.broadcast({ type: 'message', msg: 'Волна ' + n + ' началась!' });
  }

  computeWaveCount(n) {
    return 6 + n * 4;
  }

  spawnWave(n) {
    const count = this.computeWaveCount(n);
    const pool = [];
    // набор типов с учётом волны
    pool.push('infantry');
    if (n >= 2) pool.push('runner');
    if (n >= 3) pool.push('tank');
    if (n >= 4) pool.push('flying');
    for (let i = 0; i < count; i++) {
      let type;
      if (n === 1) type = 'infantry';
      else type = pool[randInt(0, pool.length - 1)];
      // случайная точка спавна
      const sp = randomSpawnPoint();
      const def = MOBS[type];
      const hpScale = 1 + (n - 1) * 0.18;
      const speedScale = 1 + (n - 1) * 0.03;
      const mId = this.newId();
      this.mobs.set(mId, {
        id: mId, type: type,
        x: sp.x, y: sp.y,
        hp: Math.round(def.hp * hpScale),
        maxHp: Math.round(def.hp * hpScale),
        speed: def.speed * speedScale,
        r: def.r, dmg: def.dmg, score: def.score,
        fly: def.fly, color: def.color,
        spawnDelay: i * 0.15
      });
    }
  }

  nearestMob(x, y, maxR, ignoreId) {
    const candidates = this.mobGrid.query(x, y, maxR);
    let best = null, bestD = maxR;
    for (const id of candidates) {
      if (id === ignoreId) continue;
      const m = this.mobs.get(id);
      if (!m) continue;
      const d = dist(x, y, m.x, m.y);
      if (d < bestD) { bestD = d; best = m; }
    }
    return best;
  }

  damageMob(m, amount, source) {
    m.hp -= amount;
    if (m.hp <= 0) {
      this.mobs.delete(m.id);
      this.score += m.score;
      if (source && source.kills !== undefined) source.kills++;
      if (source && source.xp !== undefined) {
        source.xp += m.score;
        if (source.xp >= 100) { source.xp -= 100; source.level++; }
      }
      this.waveKilled++;
      if (this.waveKilled >= this.waveTotal) {
        // волна завершена -> пауза на стройку
        this.phase = 'build';
        this.buildTimer = 15;
        // награда за волну
        this.rewardBuildPhase();
        this.broadcast({ type: 'phase', phase: 'build', wave: this.wave, buildTime: 15 });
        this.broadcast({ type: 'message', msg: 'Волна ' + this.wave + ' отбита! Стройтесь!' });
      }
    }
  }

  rewardBuildPhase() {
    const bonus = 30 * this.wave;
    const foodB = 20 * this.wave;
    for (const p of this.players.values()) {
      p.res.wood += bonus;
      p.res.stone += Math.round(bonus * 0.8);
      p.res.food += foodB;
      p.sendDirty = true;
    }
  }

  rebuildBuildGrid() {
    this.buildGrid.clear();
    for (const [id, b] of this.buildings) {
      this.buildGrid.insert(id, b.x, b.y, b.size / 2);
    }
  }

  // ---------- ОСНОВНОЙ ТИК (25/с) ----------
  tick() {
    const dt = TICK_RATE_MS / 1000;

    // Фаза стройки: таймер до следующей волны
    if (this.phase === 'build') {
      this.buildTimer -= dt;
      if (this.buildTimer <= 0) {
        this.startWave(this.wave + 1);
      }
      // broadcast таймера раз в ~0.5с
      if (Math.random() < 0.1) {
        this.broadcast({ type: 'buildTimer', time: Math.max(0, Math.round(this.buildTimer)) });
      }
    }

    // Прогресс строительства построек
    for (const b of this.buildings.values()) {
      if (!b.ready) {
        b.buildLeft -= dt;
        if (b.buildLeft <= 0) { b.ready = true; b.buildLeft = 0; }
      }
      // Генераторы производят ресурсы (влад. получает)
      if (b.type === 'generator' && b.ready) {
        const owner = this.players.get(b.owner);
        if (owner) {
          owner.res.wood += b.production.wood * dt * 2;
          owner.res.stone += b.production.stone * dt * 2;
          owner.res.food += b.production.food * dt * 2;
        }
      }
      // Казармы нанимают юнитов
      if (b.type === 'barracks' && b.ready && b.unitCount < b.maxUnits) {
        b.recruitLeft -= dt;
        if (b.recruitLeft <= 0) {
          b.recruitLeft = b.unitCooldown;
          b.unitCount++;
          const uId = this.newId();
          this.units.set(uId, {
            id: uId, barracks: b.id, x: b.x + rand(-20, 20), y: b.y + rand(-20, 20),
            hp: 60, maxHp: 60, damage: 12 + b.level * 3, r: 12, patrol: { x: b.x, y: b.y },
            cooldown: 0
          });
        }
      }
    }

    // Пересобрать сетку постраний, если есть недостроенные/новые схожие — не каждый тик (для производительности)
    if (Math.random() < 0.05) this.rebuildBuildGrid();

    // Пересобрать сетку мобов
    this.mobGrid.clear();
    for (const [id, m] of this.mobs) this.mobGrid.insert(id, m.x, m.y, m.r);

    // Движение игроков
    const movingPlayers = new Set();
    for (const p of this.players.values()) {
      if (p.moving && this.phase !== 'waiting') {
        p.x += p.dirX * p.speed * dt;
        p.y += p.dirY * p.speed * dt;
        p.x = clamp(p.x, 20, MAP_W - 20);
        p.y = clamp(p.y, 20, MAP_H - 20);
        movingPlayers.add(p.id);
      }
      if (p.fireCooldown > 0) p.fireCooldown -= dt;
    }

    // Движение юнитов и их атака
    for (const u of this.units.values()) {
      // патруль вокруг казарм, атакуют ближайшего моба
      const target = this.nearestMob(u.x, u.y, 150, null);
      if (target && this.phase === 'combat') {
        const d = dist(u.x, u.y, target.x, target.y);
        if (d > u.r + 12) {
          const nx = (target.x - u.x) / d, ny = (target.y - u.y) / d;
          u.x += nx * 80 * dt; u.y += ny * 80 * dt;
        } else if (u.cooldown <= 0) {
          u.cooldown = 0.8;
          this.damageMob(target, u.damage, u);
          this.projectiles.push({ x: u.x, y: u.y, tx: target.x, ty: target.y, px: u.x, py: u.y, speed: 500, type: 'unit', color: '#f5f5dc', ttl: 40 });
        }
      } else {
        // возврат в точку патруля
        const d = dist(u.x, u.y, u.patrol.x, u.patrol.y);
        if (d > 10) { const nx = (u.patrol.x - u.x) / d, ny = (u.patrol.y - u.y) / d; u.x += nx * 60 * dt; u.y += ny * 60 * dt; }
      }
      if (u.cooldown > 0) u.cooldown -= dt;
    }

    // Движение мобов к базе
    for (const m of this.mobs.values()) {
      if (m.spawnDelay > 0) { m.spawnDelay -= dt; continue; }
      const d = dist(m.x, m.y, BASE_X, BASE_Y);
      const nx = (BASE_X - m.x) / (d || 1), ny = (BASE_Y - m.y) / (d || 1);
      // летающие идут напрямую; наземные замедляются стенами
      let effSpeed = m.speed;
      if (!m.fly) {
        // проверка стен по пути
        const blockers = this.buildGrid.query(m.x + nx * 10, m.y + ny * 10, m.r + 4);
        for (const bid of blockers) {
          const b = this.buildings.get(bid);
          if (b && b.type === 'wall' && b.ready) {
            const bd = dist(m.x + nx * 10, m.y + ny * 10, b.x, b.y);
            if (bd < (b.size / 2 + m.r)) {
              effSpeed *= 0.35; // замедление у стены
              // заодно урон стене
              b.hp -= m.dmg * dt * 2;
              break;
            }
          }
        }
      }
      m.x += nx * effSpeed * dt;
      m.y += ny * effSpeed * dt;

      // снос разрушенных стен
      if (m.x < 15 || m.x > MAP_W - 15 || m.y < 15 || m.y > MAP_H - 15) { this.mobs.delete(m.id); continue; }

      // достигли базы -> урон
      if (d < BASE_RADIUS + m.r) {
        this.baseHp -= m.dmg;
        this.mobs.delete(m.id);
        this.waveKilled++;
        this.broadcast({ type: 'base', hp: Math.round(this.baseHp), max: this.baseMax });
        if (this.baseHp <= 0) {
          this.gameOver(false);
          return;
        }
      }
    }

    // Атака башен
    for (const b of this.buildings.values()) {
      if (b.type !== 'tower' || !b.ready || this.phase !== 'combat') continue;
      b.cooldown -= dt;
      if (b.cooldown > 0) continue;
      // зенитка бьёт летающих в приоритете; обычная — наземных
      let candidates = this.mobGrid.query(b.x, b.y, b.range);
      let best = null, bestD = b.range;
      for (const id of candidates) {
        const m = this.mobs.get(id);
        if (!m) continue;
        if (b.aa) {
          if (m.fly && dist(b.x, b.y, m.x, m.y) < bestD) { bestD = dist(b.x, b.y, m.x, m.y); best = m; }
        } else {
          if (!m.fly && dist(b.x, b.y, m.x, m.y) < bestD) { bestD = dist(b.x, b.y, m.x, m.y); best = m; }
        }
      }
      if (best) {
        b.cooldown = 1 / b.fireRate;
        this.damageMob(best, b.damage, null);
        this.projectiles.push({ x: b.x, y: b.y, tx: best.x, ty: best.y, px: b.x, py: b.y, speed: 550, type: 'tower', color: b.color, ttl: 40 });
      }
    }

    // Снаряды
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const pr = this.projectiles[i];
      const dx = pr.tx - pr.px, dy = pr.ty - pr.py;
      const d = Math.hypot(dx, dy) || 1;
      const step = pr.speed * dt;
      pr.px += (dx / d) * step;
      pr.py += (dy / d) * step;
      pr.ttl--;
      if (pr.ttl <= 0 || dist(pr.px, pr.py, pr.tx, pr.ty) < step) {
        this.projectiles.splice(i, 1);
      }
    }

    // Убрать разрушенные постройки и их юнитов
    let changed = false;
    for (const [id, b] of this.buildings) {
      if (b.hp <= 0) { this.buildings.delete(id); changed = true; }
    }
    if (changed) {
      this.rebuildBuildGrid();
      // удалить юнитов из разрушенных казарм
      for (const [uid, u] of this.units) {
        if (!this.buildings.has(u.barracks)) this.units.delete(uid);
      }
      // минус кол-во построек владельцу? оставляем счётчик
    }

    // Бродкаст состояния игрокам (каждые ~2 тика = ~12.5/с)
    this.broadcastState();
  }

  broadcastState() {
    const payload = {
      type: 'state',
      t: Date.now(),
      self: null,
      players: [],
      buildings: [],
      mobs: [],
      units: [],
      proj: this.projectiles.length ? this.projectiles : [],
      hp: Math.round(this.baseHp),
      max: this.baseMax,
      wave: this.wave,
      phase: this.phase,
      buildTimer: Math.max(0, Math.floor(this.buildTimer)),
      score: this.score,
      waveKilled: this.waveKilled,
      waveTotal: this.waveTotal
    };
    for (const p of this.players.values()) payload.players.push(this.serializePlayer(p));
    for (const b of this.buildings.values()) payload.buildings.push(this.serializeBuilding(b));
    for (const m of this.mobs.values()) payload.mobs.push(this.serializeMob(m));
    for (const u of this.units.values()) payload.units.push({ id: u.id, x: u.x, y: u.y, hp: Math.round(u.hp), maxHp: u.maxHp, r: u.r });

    const msg = JSON.stringify(payload);
    for (const p of this.players.values()) {
      const personal = { ...payload, self: this.serializePlayer(p) };
      personal.players = payload.players.filter(pl => pl.id !== p.id);
      if (p.ws.readyState === WebSocket.OPEN) p.ws.send(JSON.stringify(personal));
    }
  }

  gameOver(won) {
    this.phase = 'over';
    const ranking = Array.from(this.players.values())
      .sort((a, b) => b.score - a.score || b.kills - a.kills)
      .map(p => ({ name: p.name, kills: p.kills, score: p.score, level: p.level }));
    this.broadcast({ type: 'gameover', won: won, wave: this.wave, score: this.score, results: ranking });
  }

  handleChat(p, text) {
    if (text.length > 200) return;
    this.broadcast({ type: 'chat', text: p.name + ': ' + text });
  }

  stop() {
    clearInterval(this.ticker);
  }
}

// ==================== HTTP-СЕРВЕР + WS ====================
const server = http.createServer((req, res) => {
  // статика public
  let url = req.url.split('?')[0];
  if (url === '/') url = '/index.html';
  const filePath = path.join(__dirname, 'public', url);
  if (!filePath.startsWith(path.join(__dirname, 'public'))) { res.writeHead(403); res.end(); return; }
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    const ext = path.extname(filePath);
    const mime = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.png': 'image/png', '.json': 'application/json' };
    res.writeHead(200, { 'Content-Type': mime[ext] || 'application/octet-stream' });
    res.end(data);
  });
});

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  ws.room = null;

  ws.on('message', (raw) => {
    let msg;
    try { msg = JSON.parse(raw); } catch (e) { return; }
    if (!msg || !msg.type) return;

    const room = ws.room;

    switch (msg.type) {
      case 'join': {
        const roomId = (msg.room || 'default').toString().slice(0, 20);
        if (room) { // уже в комнате — игнор
          return;
        }
        if (!rooms.has(roomId)) rooms.set(roomId, new Room(roomId));
        const r = rooms.get(roomId);
        r.addClient(ws);
        if (r.bindPlayer(ws, msg.name)) {
          ws.room = r;
          ws.send(JSON.stringify({ type: 'joined', room: roomId }));
          // отправить текущее состояние
          r.sendTo(playerOf(r, ws).id, { type: 'roominfo', players: Array.from(r.players.values()).map(p => r.serializePlayer(p)) });
        } else {
          ws.send(JSON.stringify({ type: 'error', msg: 'Комната заполнена' }));
          r.removeClient(ws);
          ws.close();
        }
        break;
      }
      case 'move': {
        const p = playerOf(room, ws);
        if (p) room.handleMove(p, msg.dir);
        break;
      }
      case 'shoot': {
        const p = playerOf(room, ws);
        if (p) room.handleShoot(p, msg.tx, msg.ty);
        break;
      }
      case 'build': {
        const p = playerOf(room, ws);
        if (p) room.handleBuild(p, msg.type, msg.x, msg.y);
        break;
      }
      case 'upgrade': {
        const p = playerOf(room, ws);
        if (p) room.handleUpgrade(p, msg.id);
        break;
      }
      case 'upgradePlayer': {
        const p = playerOf(room, ws);
        if (p) room.handleUpgradePlayer(p, msg.stat);
        break;
      }
      case 'ready': {
        const p = playerOf(room, ws);
        if (p) room.ready(ws);
        break;
      }
      case 'chat': {
        const p = playerOf(room, ws);
        if (p) room.handleChat(p, msg.text);
        break;
      }
      default: break;
    }
  });

  ws.on('close', () => {
    const room = ws.room;
    if (room) {
      room.removeClient(ws);
      if (room.players.size === 0) { room.stop(); rooms.delete(room.id); }
    }
  });
});

function playerOf(room, ws) {
  if (!room) return null;
  return room.clients.get(ws) || null;
}

// Периодическая чистка пустых комнат
setInterval(() => {
  for (const [id, r] of rooms) {
    if (r.players.size === 0) { r.stop(); rooms.delete(id); }
  }
}, 30000);

server.listen(PORT, () => {
  console.log('🏰 Tower Defense сервер запущен на порту ' + PORT);
  console.log('Открой в браузере: http://localhost:' + PORT);
});

/**
 * ==================== WIRE PROTOCOL ====================
 * Клиент -> Сервер:
 *  {type:'join', room, name}
 *  {type:'ready'}
 *  {type:'move', dir:{x,y}}   / {type:'move', dir:null}
 *  {type:'shoot', tx, ty}
 *  {type:'build', type:'wall'|'tower'|'generator'|'barracks', x, y}
 *  {type:'upgrade', id}        (улучшить постройку)
 *  {type:'upgradePlayer', stat:'speed'|'damage'|'hp'}
 *  {type:'chat', text}
 *
 * Сервер -> Клиент ('allowed' = учитено):
 *  {type:'welcome', id, map, base}
 *  {type:'joined', room}
 *  {type:'roominfo', players}   (список в лобби)
 *  {type:'welcome' ...}
 *  {type:'state', ...}          (полный снапшот игры, ~12/с)
 *  {type:'building', b}         (новая постройка)
 *  {type:'upgraded', b}
 *  {type:'phase', phase, wave, buildTime}
 *  {type:'buildTimer', time}
 *  {type:'base', hp, max}
 *  {type:'message', msg}
 *  {type:'chat', text}
 *  {type:'error', msg}
 *  {type:'gameover', won, wave, score, results}
 *  {type:'self', p}             (обновление себя при прокачке)
 */
