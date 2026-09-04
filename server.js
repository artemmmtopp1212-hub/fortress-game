const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: '*' },
    pingTimeout: 60000,
    pingInterval: 25000
});

app.use(express.static(path.join(__dirname, 'public')));
app.get('/health', (req, res) => res.send('OK'));
app.get('/stats', (req, res) => res.json({
    rooms: rooms.size,
    players: totalPlayers(),
    uptime: process.uptime()
}));

// ==================== КОНСТАНТЫ ====================
const MAP_WIDTH = 1200;
const MAP_HEIGHT = 800;
const CENTER_X = MAP_WIDTH / 2;
const CENTER_Y = MAP_HEIGHT / 2;
const FORTRESS_RADIUS = 50;
const MAX_PLAYERS_PER_ROOM = 6;
const BUILD_PHASE_DURATION = 90;
const MAX_WAVES = 15;
const TICK_RATE = 500;

// ==================== РОЛИ ====================
const ROLES = {
    BUILDER: {
        name: 'Строитель',
        icon: '🔨',
        color: '#f39c12',
        hp: 120,
        ammo: 30,
        coins: 150,
        abilities: ['build_wall', 'build_tower', 'repair', 'build_trap'],
        description: 'Строит стены, башни и ловушки. Может чинить стены.',
        passive: 'Строит стены на 50% дешевле',
        specialCooldown: 10
    },
    ARCHER: {
        name: 'Стрелок',
        icon: '🏹',
        color: '#e74c3c',
        hp: 80,
        ammo: 80,
        coins: 80,
        abilities: ['double_shot', 'snipe', 'rain_arrows', 'poison_arrow'],
        description: 'Дальний бой, наносит двойной урон по мобам.',
        passive: 'Дальность стрельбы x1.5',
        specialCooldown: 15
    },
    ENGINEER: {
        name: 'Инженер',
        icon: '⚙️',
        color: '#3498db',
        hp: 100,
        ammo: 40,
        coins: 120,
        abilities: ['upgrade_turret', 'deploy_shield', 'repair_all', 'emp'],
        description: 'Улучшает башни, ставит щиты, чинит всё вокруг.',
        passive: 'Башни стреляют на 30% быстрее',
        specialCooldown: 20
    },
    MEDIC: {
        name: 'Медик',
        icon: '💊',
        color: '#2ecc71',
        hp: 90,
        ammo: 50,
        coins: 100,
        abilities: ['heal', 'heal_aoe', 'revive', 'shield'],
        description: 'Лечит союзников, может оживлять павших.',
        passive: 'Лечение на 50% эффективнее',
        specialCooldown: 8
    },
    MAGE: {
        name: 'Маг',
        icon: '✨',
        color: '#9b59b6',
        hp: 70,
        ammo: 60,
        coins: 90,
        abilities: ['fireball', 'ice_wall', 'lightning', 'meteor'],
        description: 'Магические атаки, замораживает мобов.',
        passive: 'Заклинания имеют шанс крита 25%',
        specialCooldown: 12
    },
    SCOUT: {
        name: 'Разведчик',
        icon: '👁️',
        color: '#1abc9c',
        hp: 75,
        ammo: 45,
        coins: 110,
        abilities: ['speed_boost', 'trap_detect', 'mark_enemy', 'stealth'],
        description: 'Быстрый, видит ловушки, помечает врагов.',
        passive: 'Скорость передвижения x1.5',
        specialCooldown: 10
    }
};

// ==================== ТИПЫ МОБОВ ====================
const MOB_TYPES = {
    goblin: {
        name: 'Гоблин',
        icon: '👺',
        hp: 30,
        speed: 1.5,
        damage: 5,
        reward: 10,
        color: '#8B4513',
        size: 10,
        behavior: 'swarm'
    },
    orc: {
        name: 'Орк',
        icon: '👹',
        hp: 80,
        speed: 0.8,
        damage: 15,
        reward: 25,
        color: '#556B2F',
        size: 14,
        behavior: 'tank'
    },
    skeleton: {
        name: 'Скелет',
        icon: '💀',
        hp: 40,
        speed: 1.2,
        damage: 10,
        reward: 15,
        color: '#D3D3D3',
        size: 11,
        behavior: 'ranged'
    },
    troll: {
        name: 'Тролль',
        icon: '🧌',
        hp: 150,
        speed: 0.5,
        damage: 25,
        reward: 50,
        color: '#228B22',
        size: 18,
        behavior: 'tank'
    },
    dark_mage: {
        name: 'Тёмный маг',
        icon: '🧙',
        hp: 60,
        speed: 1.0,
        damage: 20,
        reward: 35,
        color: '#4B0082',
        size: 12,
        behavior: 'ranged'
    },
    wyvern: {
        name: 'Виверна',
        icon: '🐉',
        hp: 100,
        speed: 1.3,
        damage: 18,
        reward: 40,
        color: '#DC143C',
        size: 15,
        behavior: 'swarm'
    },
    demon: {
        name: 'Демон',
        icon: '😈',
        hp: 200,
        speed: 0.7,
        damage: 35,
        reward: 75,
        color: '#8B0000',
        size: 20,
        behavior: 'tank'
    },
    dragon: {
        name: 'Дракон',
        icon: '🐲',
        hp: 500,
        speed: 0.4,
        damage: 60,
        reward: 200,
        color: '#FF4500',
        size: 30,
        behavior: 'boss',
        isBoss: true,
        abilities: ['fire_breath', 'fly_over']
    },
    lich: {
        name: 'Лич',
        icon: '☠️',
        hp: 350,
        speed: 0.6,
        damage: 40,
        reward: 175,
        color: '#2F4F4F',
        size: 25,
        behavior: 'boss',
        isBoss: true,
        abilities: ['summon_skeletons', 'death_coil']
    },
    arch_demon: {
        name: 'Архидемон',
        icon: '👿',
        hp: 800,
        speed: 0.3,
        damage: 80,
        reward: 500,
        color: '#40E0D0',
        size: 35,
        behavior: 'boss',
        isBoss: true,
        abilities: ['meteor_rain', 'dark_shield', 'summon_demons']
    }
};

// ==================== ТИПЫ БАШЕН ====================
const TOWER_TYPES = {
    arrow: {
        name: 'Стрелковая',
        icon: '🏹',
        cost: 25,
        hp: 100,
        damage: 10,
        range: 120,
        fireRate: 1000,
        color: '#8B4513',
        size: 20
    },
    magic: {
        name: 'Магическая',
        icon: '🔮',
        cost: 40,
        hp: 80,
        damage: 20,
        range: 100,
        fireRate: 1500,
        color: '#9b59b6',
        size: 20,
        splash: 30
    },
    frost: {
        name: 'Ледяная',
        icon: '❄️',
        cost: 35,
        hp: 90,
        damage: 8,
        range: 90,
        fireRate: 1200,
        color: '#00CED1',
        size: 20,
        slow: 0.5
    },
    fire: {
        name: 'Огненная',
        icon: '🔥',
        cost: 50,
        hp: 70,
        damage: 30,
        range: 80,
        fireRate: 2000,
        color: '#FF4500',
        size: 20,
        burn: true
    },
    sniper: {
        name: 'Снайперская',
        icon: '🎯',
        cost: 60,
        hp: 60,
        damage: 50,
        range: 200,
        fireRate: 3000,
        color: '#2F4F4F',
        size: 20
    },
    healer: {
        name: 'Лечебная',
        icon: '💚',
        cost: 45,
        hp: 100,
        damage: 0,
        range: 100,
        fireRate: 2000,
        color: '#2ecc71',
        size: 20,
        healRate: 5
    }
};

// ==================== ТИПЫ СТЕН ====================
const WALL_TYPES = {
    wood: {
        name: 'Деревянная',
        icon: '🪵',
        cost: 10,
        hp: 100,
        color: '#8B4513',
        size: 30
    },
    stone: {
        name: 'Каменная',
        icon: '🧱',
        cost: 20,
        hp: 200,
        color: '#808080',
        size: 30
    },
    iron: {
        name: 'Железная',
        icon: '⛓️',
        cost: 35,
        hp: 350,
        color: '#4682B4',
        size: 30
    },
    magic_wall: {
        name: 'Магическая',
        icon: '🌟',
        cost: 50,
        hp: 250,
        color: '#9b59b6',
        size: 30,
        reflectDamage: 5
    },
    thorns: {
        name: 'Шипы',
        icon: '🌵',
        cost: 30,
        hp: 80,
        color: '#006400',
        size: 30,
        damageBack: 10
    }
};

// ==================== ТИПЫ ЛОВУШЕК ====================
const TRAP_TYPES = {
    spike: {
        name: 'Шипы',
        icon: '📍',
        cost: 15,
        damage: 20,
        uses: 3,
        color: '#808080'
    },
    slow: {
        name: 'Болото',
        icon: '🟤',
        cost: 20,
        slow: 0.3,
        duration: 3000,
        uses: 5,
        color: '#8B4513'
    },
    explosive: {
        name: 'Взрывная',
        icon: '💣',
        cost: 30,
        damage: 60,
        radius: 50,
        uses: 1,
        color: '#FF4500'
    },
    poison: {
        name: 'Ядовитая',
        icon: '🟢',
        cost: 25,
        damage: 5,
        duration: 5000,
        uses: 4,
        color: '#00FF00'
    },
    teleport: {
        name: 'Телепорт',
        icon: '🌀',
        cost: 40,
        uses: 2,
        color: '#9b59b6',
        teleportRadius: 200
    }
};

// ==================== СТРУКТУРЫ ДАННЫХ ====================
const rooms = new Map();
const playerStats = new Map();

function totalPlayers() {
    let count = 0;
    for (const room of rooms.values()) count += room.players.size;
    return count;
}

// ==================== КЛАСС ИГРОВОЙ КОМНАТЫ ====================
class GameRoom {
    constructor(id) {
        this.id = id;
        this.players = new Map();
        this.phase = 'waiting';
        this.walls = [];
        this.towers = [];
        this.traps = [];
        this.mobs = [];
        this.projectiles = [];
        this.particles = [];
        this.wave = 0;
        this.score = 0;
        this.gameLoop = null;
        this.waveTimer = null;
        this.buildTimer = null;
        this.fortressHP = 500;
        this.fortressMaxHP = 500;
        this.chat = [];
        this.waveMobsTotal = 0;
        this.waveMobsKilled = 0;
        this.totalKills = 0;
        this.totalDamageDealt = 0;
        this.createdAt = Date.now();
        this.towerIdCounter = 0;
        this.wallIdCounter = 0;
        this.trapIdCounter = 0;
        this.mobIdCounter = 0;
        this.projectileIdCounter = 0;
        this.towerCooldowns = new Map();
        this.mobSpawnQueue = [];
        this.bossActive = false;
        this.difficulty = 1;
        this.comboMultiplier = 1;
        this.comboTimer = null;
    }

    addPlayer(socket, name, characterClass) {
        if (this.players.size >= MAX_PLAYERS_PER_ROOM) {
            socket.emit('error_msg', 'Комната полна (макс. 6)');
            return false;
        }

        const roleKey = characterClass || Object.keys(ROLES)[this.players.size];
        const role = ROLES[roleKey] || ROLES[Object.keys(ROLES)[this.players.size]];

        const angle = (this.players.size / MAX_PLAYERS_PER_ROOM) * Math.PI * 2;
        const spawnDist = 150;

        const player = {
            id: socket.id,
            name: name,
            roleKey: roleKey,
            role: role,
            x: CENTER_X + Math.cos(angle) * spawnDist,
            y: CENTER_Y + Math.sin(angle) * spawnDist,
            hp: role.hp,
            maxHp: role.hp,
            ammo: role.ammo,
            maxAmmo: role.ammo,
            coins: role.coins,
            ready: false,
            kills: 0,
            damageDealt: 0,
            score: 0,
            level: 1,
            xp: 0,
            xpToNext: 100,
            speed: 4,
            abilities: {},
            abilityCooldowns: {},
            statusEffects: [],
            isDead: false,
            deathTime: 0,
            respawnTimer: 0,
            lastShot: 0,
            lastAbility: 0,
            shield: 0,
            direction: { x: 0, y: 1 }
        };

        for (const ability of role.abilities) {
            player.abilities[ability] = true;
            player.abilityCooldowns[ability] = 0;
        }

        this.players.set(socket.id, player);
        this.broadcastChat(`${role.icon} ${name} присоединился как ${role.name}`);
        this.broadcastRoomState();
        return true;
    }

    removePlayer(playerId) {
        const player = this.players.get(playerId);
        if (player) {
            this.broadcastChat(`${player.role.icon} ${player.name} вышел`);
        }
        this.players.delete(playerId);
        if (this.players.size === 0) {
            this.stopGame();
        } else {
            this.reassignRoles();
            this.broadcastRoomState();
        }
    }

    reassignRoles() {
        const roleKeys = Object.keys(ROLES);
        let i = 0;
        for (const [, player] of this.players) {
            if (i < roleKeys.length) {
                player.roleKey = roleKeys[i];
                player.role = ROLES[roleKeys[i]];
                i++;
            }
        }
    }

    broadcastChat(message) {
        const entry = { text: message, time: Date.now() };
        this.chat.push(entry);
        if (this.chat.length > 50) this.chat.shift();
        io.to(this.id).emit('chat', entry);
    }

    broadcastRoomState() {
        const state = {
            phase: this.phase,
            players: Array.from(this.players.values()).map(p => ({
                id: p.id, name: p.name, roleKey: p.roleKey, role: p.role.name,
                roleIcon: p.role.icon, roleColor: p.role.color,
                hp: p.hp, maxHp: p.maxHp, ammo: p.ammo, maxAmmo: p.maxAmmo,
                coins: p.coins, ready: p.ready, x: p.x, y: p.y,
                kills: p.kills, score: p.score, level: p.level,
                shield: p.shield, isDead: p.isDead,
                statusEffects: p.statusEffects.map(e => e.type),
                direction: p.direction
            })),
            walls: this.walls.map(w => ({
                id: w.id, x: w.x, y: w.y, hp: w.hp, maxHp: w.maxHp,
                type: w.type, icon: w.icon, color: w.color, size: w.size
            })),
            towers: this.towers.map(t => ({
                id: t.id, x: t.x, y: t.y, hp: t.hp, maxHp: t.maxHp,
                type: t.type, icon: t.icon, color: t.color, size: t.size,
                level: t.level, reloading: t.reloading
            })),
            traps: this.traps.map(t => ({
                id: t.id, x: t.x, y: t.y, type: t.type, icon: t.icon,
                color: t.color, visible: false
            })),
            mobs: this.mobs.map(m => ({
                id: m.id, x: m.x, y: m.y, hp: m.hp, maxHp: m.maxHp,
                icon: m.icon, color: m.color, size: m.size,
                name: m.name, isBoss: m.isBoss || false,
                statusEffects: m.statusEffects.map(e => e.type)
            })),
            projectiles: this.projectiles.map(p => ({
                id: p.id, x: p.x, y: p.y, color: p.color, size: p.size,
                targetX: p.targetX, targetY: p.targetY
            })),
            wave: this.wave,
            maxWaves: MAX_WAVES,
            score: this.score,
            fortressHP: this.fortressHP,
            fortressMaxHP: this.fortressMaxHP,
            mobCount: this.mobs.length,
            waveMobsTotal: this.waveMobsTotal,
            waveMobsKilled: this.waveMobsKilled,
            totalKills: this.totalKills,
            difficulty: this.difficulty,
            comboMultiplier: this.comboMultiplier,
            mapWidth: MAP_WIDTH,
            mapHeight: MAP_HEIGHT,
            chat: this.chat.slice(-20)
        };
        io.to(this.id).emit('roomState', state);
    }

    handleAction(playerId, action) {
        const player = this.players.get(playerId);
        if (!player || player.isDead) return;

        const now = Date.now();

        switch (action.type) {
            case 'ready':
                player.ready = action.ready;
                if (Array.from(this.players.values()).every(p => p.ready) && this.players.size >= 1) {
                    this.startBuildPhase();
                }
                this.broadcastRoomState();
                break;

            case 'chat':
                if (action.message && action.message.length <= 200) {
                    this.broadcastChat(`${player.role.icon} ${player.name}: ${action.message}`);
                }
                break;

            case 'move':
                if (this.phase === 'defense' || this.phase === 'build') {
                    let speedMod = 1;
                    if (player.roleKey === 'SCOUT') speedMod = 1.5;
                    for (const effect of player.statusEffects) {
                        if (effect.type === 'slow') speedMod *= 0.5;
                        if (effect.type === 'speed') speedMod *= 1.5;
                    }

                    const speed = player.speed * speedMod;
                    let dx = action.dx || 0;
                    let dy = action.dy || 0;

                    if (dx !== 0 || dy !== 0) {
                        const len = Math.sqrt(dx * dx + dy * dy);
                        dx = (dx / len) * speed;
                        dy = (dy / len) * speed;
                    }

                    const newX = Math.max(20, Math.min(MAP_WIDTH - 20, player.x + dx));
                    const newY = Math.max(20, Math.min(MAP_HEIGHT - 20, player.y + dy));

                    let blocked = false;
                    for (const wall of this.walls) {
                        if (Math.hypot(newX - wall.x, newY - wall.y) < wall.size / 2 + 10) {
                            blocked = true;
                            break;
                        }
                    }

                    if (!blocked) {
                        player.x = newX;
                        player.y = newY;
                    }

                    if (action.lookingAt) {
                        player.direction = {
                            x: action.lookingAt.x - player.x,
                            y: action.lookingAt.y - player.y
                        };
                        const dirLen = Math.sqrt(player.direction.x ** 2 + player.direction.y ** 2);
                        if (dirLen > 0) {
                            player.direction.x /= dirLen;
                            player.direction.y /= dirLen;
                        }
                    }

                    io.to(this.id).emit('playerMove', {
                        id: playerId,
                        x: player.x,
                        y: player.y,
                        direction: player.direction
                    });
                }
                break;

            case 'shoot':
                if (this.phase !== 'defense') break;
                if (player.ammo <= 0) break;
                if (now - player.lastShot < 200) break;

                player.ammo--;
                player.lastShot = now;

                let shootDamage = 15;
                let shootRange = 300;
                if (player.roleKey === 'ARCHER') {
                    shootDamage = 25;
                    shootRange = 450;
                }
                if (player.roleKey === 'MAGE') {
                    shootDamage = 20;
                    this.createProjectile(player, action.targetX, action.targetY, '#9b59b6', shootDamage, true, 30);
                    break;
                }

                this.createProjectile(player, action.targetX, action.targetY, player.role.color, shootDamage, false, 0);
                break;

            case 'placeWall':
                if (this.phase !== 'build') break;
                const wallType = action.wallType || 'wood';
                const wallDef = WALL_TYPES[wallType];
                const wallCost = player.roleKey === 'BUILDER' ? Math.floor(wallDef.cost * 0.5) : wallDef.cost;

                if (player.coins < wallCost) break;
                if (Math.hypot(action.x - CENTER_X, action.y - CENTER_Y) < FORTRESS_RADIUS) break;

                player.coins -= wallCost;
                this.walls.push({
                    id: ++this.wallIdCounter,
                    x: action.x,
                    y: action.y,
                    type: wallType,
                    hp: wallDef.hp,
                    maxHp: wallDef.hp,
                    icon: wallDef.icon,
                    color: wallDef.color,
                    size: wallDef.size,
                    reflectDamage: wallDef.reflectDamage || 0,
                    damageBack: wallDef.damageBack || 0
                });
                this.broadcastRoomState();
                break;

            case 'placeTower':
                if (this.phase !== 'build') break;
                const towerType = action.towerType || 'arrow';
                const towerDef = TOWER_TYPES[towerType];

                if (player.coins < towerDef.cost) break;
                if (Math.hypot(action.x - CENTER_X, action.y - CENTER_Y) < FORTRESS_RADIUS + 20) break;

                player.coins -= towerDef.cost;
                this.towers.push({
                    id: ++this.towerIdCounter,
                    x: action.x,
                    y: action.y,
                    type: towerType,
                    hp: towerDef.hp,
                    maxHp: towerDef.hp,
                    damage: towerDef.damage,
                    range: towerDef.range,
                    fireRate: towerDef.fireRate,
                    icon: towerDef.icon,
                    color: towerDef.color,
                    size: towerDef.size,
                    level: 1,
                    splash: towerDef.splash || 0,
                    slow: towerDef.slow || 0,
                    burn: towerDef.burn || false,
                    healRate: towerDef.healRate || 0,
                    lastFired: 0,
                    reloading: false
                });
                this.broadcastRoomState();
                break;

            case 'placeTrap':
                if (this.phase !== 'build') break;
                const trapType = action.trapType || 'spike';
                const trapDef = TRAP_TYPES[trapType];

                if (player.coins < trapDef.cost) break;

                player.coins -= trapDef.cost;
                this.traps.push({
                    id: ++this.trapIdCounter,
                    x: action.x,
                    y: action.y,
                    type: trapType,
                    damage: trapDef.damage || 0,
                    slow: trapDef.slow || 0,
                    duration: trapDef.duration || 0,
                    radius: trapDef.radius || 30,
                    uses: trapDef.uses || 1,
                    maxUses: trapDef.uses || 1,
                    icon: trapDef.icon,
                    color: trapDef.color,
                    teleportRadius: trapDef.teleportRadius || 0
                });
                this.broadcastRoomState();
                break;

            case 'upgradeTower':
                if (this.phase !== 'build') break;
                const tower = this.towers.find(t => t.id === action.towerId);
                if (!tower) break;
                const upgradeCost = Math.floor(TOWER_TYPES[tower.type].cost * tower.level * 0.75);
                if (player.coins < upgradeCost) break;

                player.coins -= upgradeCost;
                tower.level++;
                tower.hp = Math.min(tower.maxHp + tower.level * 20, tower.hp + 30);
                tower.maxHp += 20;
                tower.damage = Math.floor(tower.damage * 1.3);
                tower.range += 10;
                this.broadcastRoomState();
                break;

            case 'repairWall':
                if (this.phase !== 'build' && this.phase !== 'defense') break;
                if (player.roleKey !== 'BUILDER' && player.roleKey !== 'ENGINEER') break;
                const wall = this.walls.find(w => w.id === action.wallId);
                if (!wall) break;
                const distToWall = Math.hypot(player.x - wall.x, player.y - wall.y);
                if (distToWall > 60) break;
                const repairCost = Math.floor((wall.maxHp - wall.hp) * 0.1);
                if (player.coins < repairCost) break;

                player.coins -= repairCost;
                wall.hp = Math.min(wall.maxHp, wall.hp + 30);
                this.broadcastRoomState();
                break;

            case 'sellWall':
                if (this.phase !== 'build') break;
                const sellWall = this.walls.find(w => w.id === action.wallId);
                if (!sellWall) break;
                const sellValue = Math.floor(WALL_TYPES[sellWall.type].cost * 0.5);
                player.coins += sellValue;
                this.walls = this.walls.filter(w => w.id !== action.wallId);
                this.broadcastRoomState();
                break;

            case 'sellTower':
                if (this.phase !== 'build') break;
                const sellTower = this.towers.find(t => t.id === action.towerId);
                if (!sellTower) break;
                const towerSellValue = Math.floor(TOWER_TYPES[sellTower.type].cost * 0.5 * sellTower.level);
                player.coins += towerSellValue;
                this.towers = this.towers.filter(t => t.id !== action.towerId);
                this.broadcastRoomState();
                break;

            case 'useAbility':
                if (this.phase !== 'defense') break;
                const abilityName = action.ability;
                if (!player.abilities[abilityName]) break;
                if (player.abilityCooldowns[abilityName] > now) break;

                player.abilityCooldowns[abilityName] = now + player.role.specialCooldown * 1000;
                this.executeAbility(player, abilityName, action.targetX, action.targetY, action.targetId);
                break;

            case 'endBuild':
                if (this.phase !== 'build') break;
                this.startDefensePhase();
                break;

            case 'buyAmmo':
                if (this.phase !== 'defense') break;
                if (player.coins < 10) break;
                player.coins -= 10;
                player.ammo = Math.min(player.maxAmmo, player.ammo + 10);
                this.broadcastRoomState();
                break;

            case 'revive':
                if (player.roleKey !== 'MEDIC') break;
                const deadPlayer = this.players.get(action.targetId);
                if (!deadPlayer || !deadPlayer.isDead) break;
                if (Math.hypot(player.x - deadPlayer.x, player.y - deadPlayer.y) > 80) break;
                if (player.coins < 30) break;

                player.coins -= 30;
                deadPlayer.isDead = false;
                deadPlayer.hp = Math.floor(deadPlayer.maxHp * 0.5);
                deadPlayer.x = player.x;
                deadPlayer.y = player.y;
                this.broadcastChat(`${player.role.icon} ${player.name} возродил ${deadPlayer.name}!`);
                this.broadcastRoomState();
                break;

            case 'rearrange':
                if (this.phase !== 'defense') break;
                const rTarget = this.players.get(action.targetId);
                if (!rTarget || rTarget.isDead) break;
                if (Math.hypot(player.x - rTarget.x, player.y - rTarget.y) > 50) break;
                const tempX = player.x;
                const tempY = player.y;
                player.x = rTarget.x;
                player.y = rTarget.y;
                rTarget.x = tempX;
                rTarget.y = tempY;
                io.to(this.id).emit('swapPosition', {
                    p1: { id: player.id, x: player.x, y: player.y },
                    p2: { id: rTarget.id, x: rTarget.x, y: rTarget.y }
                });
                break;
        }
    }

    executeAbility(player, ability, tx, ty, targetId) {
        const now = Date.now();

        switch (ability) {
            case 'build_wall':
                if (this.phase !== 'defense') break;
                if (player.coins < 5) break;
                player.coins -= 5;
                this.walls.push({
                    id: ++this.wallIdCounter,
                    x: player.x + player.direction.x * 40,
                    y: player.y + player.direction.y * 40,
                    type: 'wood', hp: 50, maxHp: 50,
                    icon: '🪵', color: '#8B4513', size: 25,
                    reflectDamage: 0, damageBack: 0
                });
                this.broadcastRoomState();
                break;

            case 'build_tower':
                if (player.coins < 15) break;
                player.coins -= 15;
                this.towers.push({
                    id: ++this.towerIdCounter,
                    x: player.x + player.direction.x * 50,
                    y: player.y + player.direction.y * 50,
                    type: 'arrow', hp: 60, maxHp: 60,
                    damage: 8, range: 100, fireRate: 1200,
                    icon: '🏹', color: '#8B4513', size: 18,
                    level: 1, splash: 0, slow: 0, burn: false,
                    healRate: 0, lastFired: 0, reloading: false
                });
                this.broadcastRoomState();
                break;

            case 'repair':
                for (const w of this.walls) {
                    if (Math.hypot(player.x - w.x, player.y - w.y) < 80) {
                        w.hp = Math.min(w.maxHp, w.hp + 20);
                    }
                }
                this.broadcastRoomState();
                break;

            case 'build_trap':
                if (player.coins < 10) break;
                player.coins -= 10;
                this.traps.push({
                    id: ++this.trapIdCounter,
                    x: player.x + player.direction.x * 30,
                    y: player.y + player.direction.y * 30,
                    type: 'spike', damage: 15, slow: 0, duration: 0,
                    radius: 25, uses: 3, maxUses: 3,
                    icon: '📍', color: '#808080', teleportRadius: 0
                });
                this.broadcastRoomState();
                break;

            case 'double_shot':
                if (player.ammo < 2) break;
                player.ammo -= 2;
                this.createProjectile(player, tx, ty, '#ff6600', 20, false, 0);
                this.createProjectile(player,
                    tx + (Math.random() - 0.5) * 30,
                    ty + (Math.random() - 0.5) * 30,
                    '#ff6600', 20, false, 0);
                break;

            case 'snipe':
                if (player.ammo < 5) break;
                player.ammo -= 5;
                this.createProjectile(player, tx, ty, '#ff0000', 80, false, 0);
                break;

            case 'rain_arrows':
                if (player.ammo < 10) break;
                player.ammo -= 10;
                for (let i = 0; i < 8; i++) {
                    setTimeout(() => {
                        const rx = tx + (Math.random() - 0.5) * 100;
                        const ry = ty + (Math.random() - 0.5) * 100;
                        this.createProjectile(player, rx, ry, '#cc6600', 12, false, 0);
                    }, i * 100);
                }
                break;

            case 'poison_arrow':
                if (player.ammo < 3) break;
                player.ammo -= 3;
                this.createProjectile(player, tx, ty, '#00ff00', 10, false, 0);
                break;

            case 'upgrade_turret':
                for (const t of this.towers) {
                    if (Math.hypot(player.x - t.x, player.y - t.y) < 100) {
                        t.damage = Math.floor(t.damage * 1.2);
                        t.range += 15;
                    }
                }
                this.broadcastRoomState();
                break;

            case 'deploy_shield':
                for (const p of this.players.values()) {
                    if (Math.hypot(player.x - p.x, p.y - player.y) < 120) {
                        p.shield = 50;
                    }
                }
                this.broadcastRoomState();
                break;

            case 'repair_all':
                if (player.coins < 20) break;
                player.coins -= 20;
                for (const w of this.walls) w.hp = w.maxHp;
                for (const t of this.towers) t.hp = t.maxHp;
                this.broadcastRoomState();
                break;

            case 'emp':
                for (const m of this.mobs) {
                    if (Math.hypot(player.x - m.x, player.y - m.y) < 150) {
                        m.statusEffects.push({ type: 'slow', duration: 3000, startTime: now });
                        m.statusEffects.push({ type: 'stun', duration: 2000, startTime: now });
                    }
                }
                break;

            case 'heal':
                if (player.coins < 5) break;
                player.coins -= 5;
                let healAmount = 25;
                for (const p of this.players.values()) {
                    if (Math.hypot(player.x - p.x, player.y - p.y) < 100 && !p.isDead) {
                        p.hp = Math.min(p.maxHp, p.hp + healAmount);
                    }
                }
                this.broadcastRoomState();
                break;

            case 'heal_aoe':
                if (player.coins < 15) break;
                player.coins -= 15;
                for (const p of this.players.values()) {
                    if (Math.hypot(player.x - p.x, player.y - p.y) < 200 && !p.isDead) {
                        p.hp = Math.min(p.maxHp, p.hp + 40);
                    }
                }
                this.broadcastRoomState();
                break;

            case 'revive':
                break;

            case 'shield':
                if (player.coins < 10) break;
                player.coins -= 10;
                for (const p of this.players.values()) {
                    if (Math.hypot(player.x - p.x, player.y - p.y) < 150) {
                        p.shield = 80;
                    }
                }
                this.broadcastRoomState();
                break;

            case 'fireball':
                if (player.ammo < 8) break;
                player.ammo -= 8;
                this.createProjectile(player, tx, ty, '#ff4500', 50, true, 50);
                break;

            case 'ice_wall':
                if (player.coins < 10) break;
                player.coins -= 10;
                for (let i = 0; i < 5; i++) {
                    this.walls.push({
                        id: ++this.wallIdCounter,
                        x: player.x + player.direction.x * (30 + i * 30),
                        y: player.y + player.direction.y * (30 + i * 30),
                        type: 'magic_wall', hp: 120, maxHp: 120,
                        icon: '🧊', color: '#00CED1', size: 25,
                        reflectDamage: 0, damageBack: 0
                    });
                }
                this.broadcastRoomState();
                break;

            case 'lightning':
                if (player.ammo < 6) break;
                player.ammo -= 6;
                for (const m of this.mobs) {
                    if (Math.hypot(tx - m.x, ty - m.y) < 60) {
                        m.hp -= 35;
                        m.statusEffects.push({ type: 'stun', duration: 1000, startTime: now });
                    }
                }
                this.cleanMobs();
                this.broadcastRoomState();
                break;

            case 'meteor':
                if (player.ammo < 15) break;
                player.ammo -= 15;
                setTimeout(() => {
                    for (const m of this.mobs) {
                        if (Math.hypot(tx - m.x, ty - m.y) < 80) {
                            m.hp -= 100;
                        }
                    }
                    io.to(this.id).emit('explosion', { x: tx, y: ty, radius: 80, color: '#ff4500' });
                    this.cleanMobs();
                    this.broadcastRoomState();
                }, 1000);
                break;

            case 'speed_boost':
                player.statusEffects.push({ type: 'speed', duration: 5000, startTime: now });
                for (const p of this.players.values()) {
                    if (Math.hypot(player.x - p.x, player.y - p.y) < 120) {
                        p.statusEffects.push({ type: 'speed', duration: 5000, startTime: now });
                    }
                }
                break;

            case 'trap_detect':
                for (const t of this.traps) {
                    t.visible = true;
                }
                setTimeout(() => {
                    for (const t of this.traps) {
                        t.visible = false;
                    }
                    this.broadcastRoomState();
                }, 5000);
                break;

            case 'mark_enemy':
                for (const m of this.mobs) {
                    if (Math.hypot(tx - m.x, ty - m.y) < 200) {
                        m.statusEffects.push({ type: 'marked', duration: 5000, startTime: now });
                        m.marked = true;
                    }
                }
                break;

            case 'stealth':
                player.statusEffects.push({ type: 'stealth', duration: 3000, startTime: now });
                break;
        }
    }

    createProjectile(player, tx, ty, color, damage, isMagic, splashRadius) {
        const speed = isMagic ? 6 : 10;
        const angle = Math.atan2(ty - player.y, tx - player.x);

        this.projectiles.push({
            id: ++this.projectileIdCounter,
            x: player.x,
            y: player.y,
            targetX: tx,
            targetY: ty,
            speed: speed,
            angle: angle,
            damage: damage,
            color: color,
            size: isMagic ? 6 : 4,
            ownerId: player.id,
            isMagic: isMagic,
            splash: splashRadius,
            traveled: 0
        });
    }

    cleanMobs() {
        for (let i = this.mobs.length - 1; i >= 0; i--) {
            if (this.mobs[i].hp <= 0) {
                const mob = this.mobs[i];
                this.score += mob.reward;
                this.waveMobsKilled++;
                this.totalKills++;

                for (const [, player] of this.players) {
                    player.kills++;
                    player.score += mob.reward;
                    player.xp += mob.reward;
                    player.coins += Math.floor(mob.reward / 2);

                    if (player.xp >= player.xpToNext) {
                        player.level++;
                        player.xp -= player.xpToNext;
                        player.xpToNext = Math.floor(player.xpToNext * 1.5);
                        player.maxHp += 10;
                        player.hp = Math.min(player.maxHp, player.hp + 10);
                        player.maxAmmo += 5;
                    }
                }

                this.comboMultiplier = Math.min(5, this.comboMultiplier + 0.1);
                clearTimeout(this.comboTimer);
                this.comboTimer = setTimeout(() => {
                    this.comboMultiplier = 1;
                }, 3000);

                this.mobs.splice(i, 1);
            }
        }
    }

    updateProjectiles() {
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const proj = this.projectiles[i];
            proj.x += Math.cos(proj.angle) * proj.speed;
            proj.y += Math.sin(proj.angle) * proj.speed;
            proj.traveled += proj.speed;

            if (proj.traveled > 500 || proj.x < -50 || proj.x > MAP_WIDTH + 50 ||
                proj.y < -50 || proj.y > MAP_HEIGHT + 50) {
                this.projectiles.splice(i, 1);
                continue;
            }

            for (let j = this.mobs.length - 1; j >= 0; j--) {
                const mob = this.mobs[j];
                if (Math.hypot(proj.x - mob.x, proj.y - mob.y) < mob.size + proj.size) {
                    let finalDamage = proj.damage;

                    if (mob.marked) finalDamage = Math.floor(finalDamage * 1.5);

                    if (proj.splash > 0) {
                        for (const m of this.mobs) {
                            if (Math.hypot(proj.x - m.x, proj.y - m.y) < proj.splash) {
                                m.hp -= finalDamage;
                            }
                        }
                        io.to(this.id).emit('explosion', {
                            x: proj.x, y: proj.y,
                            radius: proj.splash, color: proj.color
                        });
                    } else {
                        mob.hp -= finalDamage;
                    }

                    const shooter = this.players.get(proj.ownerId);
                    if (shooter) shooter.damageDealt += finalDamage;

                    if (proj.color === '#00ff00') {
                        mob.statusEffects.push({ type: 'poison', duration: 3000, startTime: Date.now(), damage: 3 });
                    }
                    if (proj.color === '#00CED1') {
                        mob.statusEffects.push({ type: 'slow', duration: 2000, startTime: Date.now() });
                    }

                    this.projectiles.splice(i, 1);
                    break;
                }
            }
        }
    }

    updateTowers() {
        const now = Date.now();
        const engineerBoost = Array.from(this.players.values()).some(p => p.roleKey === 'ENGINEER') ? 0.7 : 1;

        for (const tower of this.towers) {
            if (tower.healRate > 0) {
                if (now - tower.lastFired >= tower.fireRate * engineerBoost) {
                    tower.lastFired = now;
                    for (const p of this.players.values()) {
                        if (Math.hypot(tower.x - p.x, tower.y - p.y) < tower.range && !p.isDead) {
                            p.hp = Math.min(p.maxHp, p.hp + tower.healRate);
                        }
                    }
                    for (const w of this.walls) {
                        if (Math.hypot(tower.x - w.x, tower.y - w.y) < tower.range) {
                            w.hp = Math.min(w.maxHp, w.hp + 2);
                        }
                    }
                }
                continue;
            }

            if (now - tower.lastFired < tower.fireRate * engineerBoost) continue;

            let closestMob = null;
            let closestDist = tower.range;
            for (const mob of this.mobs) {
                const dist = Math.hypot(tower.x - mob.x, tower.y - mob.y);
                if (dist < closestDist) {
                    closestDist = dist;
                    closestMob = mob;
                }
            }

            if (closestMob) {
                tower.lastFired = now;
                tower.reloading = true;
                setTimeout(() => tower.reloading = false, tower.fireRate * engineerBoost);

                const damage = tower.damage * tower.level;

                if (tower.splash > 0) {
                    for (const mob of this.mobs) {
                        if (Math.hypot(closestMob.x - mob.x, closestMob.y - mob.y) < tower.splash) {
                            mob.hp -= damage;
                        }
                    }
                    io.to(this.id).emit('explosion', {
                        x: closestMob.x, y: closestMob.y,
                        radius: tower.splash, color: tower.color
                    });
                } else {
                    closestMob.hp -= damage;
                }

                if (tower.slow > 0) {
                    closestMob.statusEffects.push({
                        type: 'slow', duration: 2000, startTime: now,
                        slowFactor: tower.slow
                    });
                }

                if (tower.burn) {
                    closestMob.statusEffects.push({
                        type: 'burn', duration: 3000, startTime: now,
                        damage: 5
                    });
                }

                io.to(this.id).emit('towerShot', {
                    towerId: tower.id,
                    targetX: closestMob.x,
                    targetY: closestMob.y,
                    color: tower.color
                });
            }
        }
    }

    updateMobs() {
        const now = Date.now();

        for (let i = this.mobs.length - 1; i >= 0; i--) {
            const mob = this.mobs[i];

            let isStunned = false;
            let speedMod = 1;
            mob.statusEffects = mob.statusEffects.filter(e => {
                if (now - e.startTime > e.duration) return false;
                if (e.type === 'stun') isStunned = true;
                if (e.type === 'slow') speedMod *= (e.slowFactor || 0.5);
                return true;
            });

            if (isStunned) continue;

            if (mob.statusEffects.find(e => e.type === 'poison')) {
                const poison = mob.statusEffects.find(e => e.type === 'poison');
                if (now % 1000 < TICK_RATE) mob.hp -= poison.damage;
            }

            if (mob.statusEffects.find(e => e.type === 'burn')) {
                const burn = mob.statusEffects.find(e => e.type === 'burn');
                if (now % 1000 < TICK_RATE) mob.hp -= burn.damage;
            }

            let targetX = CENTER_X;
            let targetY = CENTER_Y;

            if (mob.behavior === 'ranged') {
                let closestPlayer = null;
                let closestDist = Infinity;
                for (const [, player] of this.players) {
                    if (player.isDead) continue;
                    const dist = Math.hypot(mob.x - player.x, mob.y - player.y);
                    if (dist < closestDist) {
                        closestDist = dist;
                        closestPlayer = player;
                    }
                }
                if (closestPlayer && closestDist < 150) {
                    targetX = mob.x - (closestPlayer.x - mob.x);
                    targetY = mob.y - (closestPlayer.y - mob.y);
                }
            }

            const angle = Math.atan2(targetY - mob.y, targetX - mob.x);
            mob.x += Math.cos(angle) * mob.speed * speedMod * (this.difficulty * 0.2 + 0.8);
            mob.y += Math.sin(angle) * mob.speed * speedMod * (this.difficulty * 0.2 + 0.8);

            for (let j = this.walls.length - 1; j >= 0; j--) {
                const wall = this.walls[j];
                if (Math.hypot(mob.x - wall.x, mob.y - wall.y) < (mob.size + wall.size) / 2) {
                    wall.hp -= mob.damage;
                    mob.hp -= 3;

                    if (wall.reflectDamage > 0) mob.hp -= wall.reflectDamage;
                    if (wall.damageBack > 0) mob.hp -= wall.damageBack;

                    if (wall.hp <= 0) {
                        this.walls.splice(j, 1);
                        io.to(this.id).emit('wallDestroyed', { x: wall.x, y: wall.y });
                    }
                    break;
                }
            }

            for (let j = this.traps.length - 1; j >= 0; j--) {
                const trap = this.traps[j];
                if (Math.hypot(mob.x - trap.x, trap.y - trap.y) < trap.radius) {
                    if (trap.damage > 0) mob.hp -= trap.damage;
                    if (trap.slow > 0) {
                        mob.statusEffects.push({
                            type: 'slow', duration: trap.duration, startTime: now,
                            slowFactor: trap.slow
                        });
                    }
                    if (trap.teleportRadius > 0) {
                        const rAngle = Math.random() * Math.PI * 2;
                        const rDist = Math.random() * trap.teleportRadius;
                        mob.x = trap.x + Math.cos(rAngle) * rDist;
                        mob.y = trap.y + Math.sin(rAngle) * rDist;
                    }
                    trap.uses--;
                    if (trap.uses <= 0) this.traps.splice(j, 1);
                    io.to(this.id).emit('trapTriggered', { x: trap.x, y: trap.y, type: trap.type });
                    break;
                }
            }

            if (Math.hypot(mob.x - CENTER_X, mob.y - CENTER_Y) < FORTRESS_RADIUS + mob.size) {
                this.fortressHP -= mob.damage;
                this.mobs.splice(i, 1);
                io.to(this.id).emit('fortressHit', {
                    hp: this.fortressHP,
                    maxHp: this.fortressMaxHP
                });
                continue;
            }

            for (const [, player] of this.players) {
                if (player.isDead) continue;
                if (Math.hypot(mob.x - player.x, mob.y - player.y) < mob.size + 10) {
                    let playerDamage = mob.damage;
                    if (player.shield > 0) {
                        const absorbed = Math.min(player.shield, playerDamage);
                        player.shield -= absorbed;
                        playerDamage -= absorbed;
                    }
                    player.hp -= playerDamage;

                    if (player.hp <= 0) {
                        player.isDead = true;
                        player.deathTime = now;
                        this.broadcastChat(`${player.role.icon} ${player.name} погиб!`);
                    }
                }
            }

            if (mob.hp <= 0) {
                this.mobs.splice(i, 1);
            }
        }
    }

    updateStatusEffects() {
        const now = Date.now();
        for (const [, player] of this.players) {
            player.statusEffects = player.statusEffects.filter(e => now - e.startTime < e.duration);
        }
    }

    startBuildPhase() {
        this.phase = 'build';
        this.wave = 0;
        this.fortressHP = this.fortressMaxHP;
        this.difficulty = 1;
        this.comboMultiplier = 1;

        for (const [, player] of this.players) {
            player.coins = player.role.coins;
            player.hp = player.role.hp;
            player.maxHp = player.role.hp;
            player.ammo = player.role.ammo;
            player.maxAmmo = player.role.ammo;
            player.ready = false;
            player.isDead = false;
            player.shield = 0;
            player.xp = 0;
            player.level = 1;
            player.xpToNext = 100;
            player.kills = 0;
            player.damageDealt = 0;
            player.score = 0;
        }

        this.walls = [];
        this.towers = [];
        this.traps = [];
        this.mobs = [];
        this.projectiles = [];

        this.broadcastRoomState();
        io.to(this.id).emit('phaseChange', {
            phase: 'build',
            message: `Стройте крепость! ${BUILD_PHASE_DURATION} секунд.`
        });
        this.broadcastChat(`🏗️ Фаза строительства! ${BUILD_PHASE_DURATION} секунд.`);

        let timeLeft = BUILD_PHASE_DURATION;
        this.buildTimer = setInterval(() => {
            timeLeft--;
            io.to(this.id).emit('buildTimer', { timeLeft });
            if (timeLeft <= 0) {
                clearInterval(this.buildTimer);
                this.startDefensePhase();
            }
        }, 1000);
    }

    startDefensePhase() {
        clearInterval(this.buildTimer);
        this.phase = 'defense';
        this.wave = 1;
        this.spawnWave();
        this.startGameLoop();
        io.to(this.id).emit('phaseChange', {
            phase: 'defense',
            message: `⚔️ Волна 1/${MAX_WAVES}! Защищайте крепость!`
        });
        this.broadcastChat(`⚔️ Начинается волна 1/${MAX_WAVES}!`);
    }

    spawnWave() {
        this.mobs = [];
        this.mobSpawnQueue = [];
        this.waveMobsKilled = 0;

        const baseCount = 3 + this.wave * 2;
        this.waveMobsTotal = baseCount;

        const availableTypes = [];
        if (this.wave >= 1) availableTypes.push('goblin');
        if (this.wave >= 2) availableTypes.push('skeleton');
        if (this.wave >= 3) availableTypes.push('orc');
        if (this.wave >= 5) availableTypes.push('wyvern');
        if (this.wave >= 6) availableTypes.push('dark_mage');
        if (this.wave >= 8) availableTypes.push('troll');
        if (this.wave >= 10) availableTypes.push('demon');

        for (let i = 0; i < baseCount; i++) {
            const typeKey = availableTypes[Math.floor(Math.random() * availableTypes.length)];
            const type = MOB_TYPES[typeKey];
            const side = Math.floor(Math.random() * 4);
            let x, y;
            switch (side) {
                case 0: x = Math.random() * MAP_WIDTH; y = -30; break;
                case 1: x = MAP_WIDTH + 30; y = Math.random() * MAP_HEIGHT; break;
                case 2: x = Math.random() * MAP_WIDTH; y = MAP_HEIGHT + 30; break;
                case 3: x = -30; y = Math.random() * MAP_HEIGHT; break;
            }

            const hpMod = 1 + (this.wave - 1) * 0.15;
            const dmgMod = 1 + (this.wave - 1) * 0.1;

            this.mobs.push({
                id: ++this.mobIdCounter,
                x, y,
                hp: Math.floor(type.hp * hpMod),
                maxHp: Math.floor(type.hp * hpMod),
                speed: type.speed,
                damage: Math.floor(type.damage * dmgMod),
                reward: type.reward,
                icon: type.icon,
                color: type.color,
                size: type.size,
                name: type.name,
                behavior: type.behavior,
                isBoss: type.isBoss || false,
                statusEffects: [],
                marked: false
            });
        }

        if (this.wave % 5 === 0) {
            const bossKey = this.wave === 5 ? 'dragon' : this.wave === 10 ? 'lich' : 'arch_demon';
            const boss = MOB_TYPES[bossKey];
            if (boss) {
                const hpMod = 1 + (this.wave - 1) * 0.15;
                this.mobs.push({
                    id: ++this.mobIdCounter,
                    x: MAP_WIDTH / 2,
                    y: -50,
                    hp: Math.floor(boss.hp * hpMod),
                    maxHp: Math.floor(boss.hp * hpMod),
                    speed: boss.speed,
                    damage: Math.floor(boss.damage * (1 + (this.wave - 1) * 0.1)),
                    reward: boss.reward,
                    icon: boss.icon,
                    color: boss.color,
                    size: boss.size,
                    name: boss.name,
                    behavior: boss.behavior,
                    isBoss: true,
                    statusEffects: [],
                    marked: false
                });
                this.waveMobsTotal++;
                this.bossActive = true;
                io.to(this.id).emit('bossSpawn', { name: boss.name, icon: boss.icon });
                this.broadcastChat(`⚠️ ${boss.icon} ${boss.name} появился!`);
            }
        }
    }

    startGameLoop() {
        this.gameLoop = setInterval(() => {
            this.updateProjectiles();
            this.updateTowers();
            this.updateMobs();
            this.updateStatusEffects();

            if (this.mobs.length === 0 && this.waveMobsKilled >= this.waveMobsTotal) {
                this.bossActive = false;
                this.wave++;

                if (this.wave > MAX_WAVES) {
                    this.endGame(true);
                    return;
                }

                const bonusCoins = 20 + this.wave * 5;
                for (const [, player] of this.players) {
                    player.coins += bonusCoins;
                    player.ammo = Math.min(player.maxAmmo, player.ammo + 30);
                    player.hp = Math.min(player.maxHp, player.hp + 20);
                }

                this.difficulty += 0.1;
                this.spawnWave();
                io.to(this.id).emit('phaseChange', {
                    phase: 'defense',
                    message: `Волна ${this.wave}/${MAX_WAVES}! +${bonusCoins}💰 каждому!`
                });
                this.broadcastChat(`🎉 Волна ${this.wave - 1} пройдена! Начинается волна ${this.wave}!`);
            }

            if (this.fortressHP <= 0) {
                this.endGame(false);
                return;
            }

            this.cleanMobs();
            this.broadcastRoomState();
        }, TICK_RATE);
    }

    endGame(won) {
        clearInterval(this.gameLoop);
        this.phase = 'ended';

        const results = [];
        for (const [, player] of this.players) {
            results.push({
                name: player.name,
                role: player.role.name,
                kills: player.kills,
                damage: player.damageDealt,
                score: player.score,
                level: player.level
            });
            const stats = playerStats.get(player.id) || { gamesPlayed: 0, totalKills: 0, totalScore: 0, wins: 0 };
            stats.gamesPlayed++;
            stats.totalKills += player.kills;
            stats.totalScore += player.score;
            if (won) stats.wins++;
            playerStats.set(player.id, stats);
        }

        results.sort((a, b) => b.score - a.score);

        io.to(this.id).emit('gameEnd', {
            won,
            score: this.score,
            wave: this.wave,
            message: won
                ? `🏆 ПОБЕДА! Все ${MAX_WAVES} волн пройдены! Счёт: ${this.score}`
                : `💀 ПОРАЖЕНИЕ! Дошли до волны ${this.wave}. Счёт: ${this.score}`,
            results,
            totalKills: this.totalKills
        });

        this.broadcastChat(won
            ? `🏆 ПОБЕДА! Общий счёт: ${this.score}`
            : `💀 ПОРАЖЕНИЕ! Общий счёт: ${this.score}`
        );
    }

    stopGame() {
        clearInterval(this.gameLoop);
        clearInterval(this.buildTimer);
        clearTimeout(this.waveTimer);
        clearTimeout(this.comboTimer);
        rooms.delete(this.id);
    }
}

// ==================== ПОДКЛЮЧЕНИЯ ====================
io.on('connection', (socket) => {
    console.log('Подключён:', socket.id);
    let currentRoom = null;

    socket.on('join', (data) => {
        const roomId = data.room || 'default';
        socket.join(roomId);

        if (!rooms.has(roomId)) rooms.set(roomId, new GameRoom(roomId));
        const room = rooms.get(roomId);

        if (room.addPlayer(socket, data.name, data.characterClass)) {
            currentRoom = room;
        }
    });

    socket.on('action', (action) => {
        if (currentRoom) currentRoom.handleAction(socket.id, action);
    });

    socket.on('disconnect', () => {
        console.log('Отключён:', socket.id);
        if (currentRoom) currentRoom.removePlayer(socket.id);
    });
});

// ==================== ОЧИСТКА ====================
setInterval(() => {
    for (const [id, room] of rooms) {
        if (room.players.size === 0 && Date.now() - room.createdAt > 300000) {
            room.stopGame();
        }
    }
}, 60000);

// ==================== ЗАПУСК ====================
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🏰 Сервер крепости запущен на порту ${PORT}`);
});