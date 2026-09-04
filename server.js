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
    uptime: process.uptime(),
    totalGames: serverStats.totalGames,
    totalKills: serverStats.totalKills
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
const PROJECTILE_SPEED = 10;
const MAGIC_PROJECTILE_SPEED = 6;
const MAX_PROJECTILE_RANGE = 500;
const PLAYER_BASE_SPEED = 4;
const COMBO_TIMEOUT = 3000;
const COMBO_MAX = 5;
const COMBO_INCREMENT = 0.1;
const COMBO_DECAY = 1;
const CHAT_MAX_LENGTH = 200;
const CHAT_HISTORY_LIMIT = 50;
const AMMO_BUY_COST = 10;
const AMMO_BUY_AMOUNT = 10;
const AMMO_BONUS_PER_WAVE = 30;
const HP_BONUS_PER_WAVE = 20;
const COIN_BONUS_BASE = 20;
const COIN_BONUS_PER_WAVE = 5;
const REPAIR_RANGE = 60;
const REPAIR_HP = 30;
const REPAIR_COST_FACTOR = 0.1;
const SELL_VALUE_FACTOR = 0.5;
const REVIVE_COST = 30;
const REVIVE_HP_FACTOR = 0.5;
const REARRANGE_RANGE = 50;
const HEAL_RANGE = 100;
const HEAL_AMOUNT = 25;
const HEAL_COST = 5;
const HEAL_AOE_RANGE = 200;
const HEAL_AOE_AMOUNT = 40;
const HEAL_AOE_COST = 15;
const SHIELD_COST = 10;
const SHIELD_AMOUNT = 80;
const DEPLOY_SHIELD_RANGE = 120;
const DEPLOY_SHIELD_AMOUNT = 50;
const REPAIR_ALL_COST = 20;
const EMP_RANGE = 150;
const EMP_SLOW_DURATION = 3000;
const EMP_STUN_DURATION = 2000;
const FIREBALL_AMMO = 8;
const FIREBALL_DAMAGE = 50;
const FIREBALL_SPLASH = 50;
const ICE_WALL_COST = 10;
const ICE_WALL_COUNT = 5;
const ICE_WALL_HP = 120;
const LIGHTNING_AMMO = 6;
const LIGHTNING_DAMAGE = 35;
const LIGHTNING_STUN = 1000;
const LIGHTNING_RADIUS = 60;
const METEOR_AMMO = 15;
const METEOR_DAMAGE = 100;
const METEOR_RADIUS = 80;
const METEOR_DELAY = 1000;
const SPEED_BOOST_DURATION = 5000;
const SPEED_BOOST_RANGE = 120;
const TRAP_DETECT_DURATION = 5000;
const MARK_RANGE = 200;
const MARK_DURATION = 5000;
const MARK_DAMAGE_MULT = 1.5;
const STEALTH_DURATION = 3000;
const DOUBLE_SHOT_AMMO = 2;
const DOUBLE_SHOT_DAMAGE = 20;
const DOUBLE_SHOT_SPREAD = 30;
const SNIPE_AMMO = 5;
const SNIPE_DAMAGE = 80;
const RAIN_ARROWS_AMMO = 10;
const RAIN_ARROWS_COUNT = 8;
const RAIN_ARROWS_DAMAGE = 12;
const RAIN_ARROWS_RADIUS = 100;
const RAIN_ARROWS_DELAY = 100;
const POISON_ARROW_AMMO = 3;
const POISON_ARROW_DAMAGE = 10;
const POISON_DURATION = 3000;
const POISON_TICK_DAMAGE = 3;
const UPGRADE_TURRET_RANGE = 100;
const UPGRADE_TURRET_DAMAGE_MULT = 1.2;
const UPGRADE_TURRET_RANGE_BONUS = 15;
const BUILD_WALL_ABILITY_COST = 5;
const BUILD_WALL_ABILITY_HP = 50;
const BUILD_WALL_ABILITY_SIZE = 25;
const BUILD_TOWER_ABILITY_COST = 15;
const BUILD_TOWER_ABILITY_HP = 60;
const BUILD_TOWER_ABILITY_DAMAGE = 8;
const BUILD_TOWER_ABILITY_RANGE = 100;
const BUILD_TOWER_ABILITY_FIRE_RATE = 1200;
const BUILD_TOWER_ABILITY_SIZE = 18;
const BUILD_TRAP_ABILITY_COST = 10;
const BUILD_TRAP_ABILITY_DAMAGE = 15;
const BUILD_TRAP_ABILITY_RADIUS = 25;
const BUILD_TRAP_ABILITY_USES = 3;
const REPAIR_ABILITY_RANGE = 80;
const REPAIR_ABILITY_HP = 20;
const MIN_PLAYERS_TO_START = 1;
const PLAYER_SPAWN_DISTANCE = 150;
const MOB_DESPAWN_MARGIN = 100;
const WALL_COLLISION_SIZE = 10;
const FORTRESS_COLLISION_BONUS = 20;
const PLAYER_COLLISION_SIZE = 10;
const MOB_PLAYER_COLLISION_SIZE = 10;
const MOB_FORTRESS_COLLISION_BONUS = 0;
const SHOOT_COOLDOWN = 200;
const TOWER_LEVEL_HP_BONUS = 20;
const TOWER_LEVEL_DAMAGE_MULT = 1.3;
const TOWER_LEVEL_RANGE_BONUS = 10;
const TOWER_LEVEL_UPGRADE_HP = 30;
const ROOM_CLEANUP_INTERVAL = 60000;
const ROOM_IDLE_TIMEOUT = 300000;
const STAT_TRACKING_ENABLED = true;
const MAX_CHAT_HISTORY = 50;
const FORTRESS_BASE_HP = 500;
const WAVE_BASE_MOBS = 3;
const WAVE_MOBS_PER_LEVEL = 2;
const MOB_HP_SCALE_PER_WAVE = 0.15;
const MOB_DAMAGE_SCALE_PER_WAVE = 0.1;
const DIFFICULTY_SCALE_PER_WAVE = 0.1;
const BOSS_WAVE_INTERVAL = 5;
const PROJECTILE_CLEANUP_DISTANCE = 500;
const PROJECTILE_CLEANUP_MARGIN = 50;

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
        specialCooldown: 10,
        speedMod: 1.0,
        damageMod: 1.0,
        rangeMod: 1.0,
        critChance: 0,
        critMult: 1.0
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
        specialCooldown: 15,
        speedMod: 1.0,
        damageMod: 1.65,
        rangeMod: 1.5,
        critChance: 0.1,
        critMult: 2.0
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
        specialCooldown: 20,
        speedMod: 0.9,
        damageMod: 1.0,
        rangeMod: 1.0,
        critChance: 0,
        critMult: 1.0
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
        specialCooldown: 8,
        speedMod: 1.0,
        damageMod: 0.8,
        rangeMod: 1.0,
        critChance: 0,
        critMult: 1.0
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
        specialCooldown: 12,
        speedMod: 0.95,
        damageMod: 1.2,
        rangeMod: 1.1,
        critChance: 0.25,
        critMult: 2.5
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
        specialCooldown: 10,
        speedMod: 1.5,
        damageMod: 0.9,
        rangeMod: 1.2,
        critChance: 0.05,
        critMult: 1.5
    }
};

const ROLE_KEYS = Object.keys(ROLES);

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
        behavior: 'swarm',
        aggroRange: 200,
        attackRange: 15,
        attackCooldown: 1000,
        xp: 5,
        isRanged: false,
        isFlying: false,
        abilities: [],
        spawnWeight: 10,
        minWave: 1,
        armor: 0,
        magicResist: 0,
        evasion: 0,
        lifesteal: 0,
        deathEffect: null,
        specialAbility: null
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
        behavior: 'tank',
        aggroRange: 180,
        attackRange: 18,
        attackCooldown: 1500,
        xp: 12,
        isRanged: false,
        isFlying: false,
        abilities: ['charge'],
        spawnWeight: 7,
        minWave: 2,
        armor: 2,
        magicResist: 0,
        evasion: 0,
        lifesteal: 0,
        deathEffect: null,
        specialAbility: 'charge'
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
        behavior: 'ranged',
        aggroRange: 250,
        attackRange: 150,
        attackCooldown: 2000,
        xp: 8,
        isRanged: true,
        isFlying: false,
        abilities: [],
        spawnWeight: 8,
        minWave: 1,
        armor: 0,
        magicResist: 1,
        evasion: 0.05,
        lifesteal: 0,
        deathEffect: null,
        specialAbility: null
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
        behavior: 'tank',
        aggroRange: 150,
        attackRange: 22,
        attackCooldown: 2000,
        xp: 25,
        isRanged: false,
        isFlying: false,
        abilities: ['regenerate'],
        spawnWeight: 4,
        minWave: 6,
        armor: 5,
        magicResist: 2,
        evasion: 0,
        lifesteal: 0,
        deathEffect: null,
        specialAbility: 'regenerate'
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
        behavior: 'ranged',
        aggroRange: 300,
        attackRange: 200,
        attackCooldown: 2500,
        xp: 18,
        isRanged: true,
        isFlying: false,
        abilities: ['dark_bolt', 'summon'],
        spawnWeight: 5,
        minWave: 4,
        armor: 0,
        magicResist: 5,
        evasion: 0.1,
        lifesteal: 0.05,
        deathEffect: null,
        specialAbility: 'dark_bolt'
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
        behavior: 'swarm',
        aggroRange: 250,
        attackRange: 16,
        attackCooldown: 1200,
        xp: 20,
        isRanged: false,
        isFlying: true,
        abilities: ['fly_over'],
        spawnWeight: 5,
        minWave: 5,
        armor: 1,
        magicResist: 3,
        evasion: 0.15,
        lifesteal: 0,
        deathEffect: null,
        specialAbility: 'fly_over'
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
        behavior: 'tank',
        aggroRange: 200,
        attackRange: 20,
        attackCooldown: 1800,
        xp: 40,
        isRanged: false,
        isFlying: false,
        abilities: ['fire_aura', 'rage'],
        spawnWeight: 3,
        minWave: 8,
        armor: 4,
        magicResist: 4,
        evasion: 0,
        lifesteal: 0.1,
        deathEffect: 'fire_explosion',
        specialAbility: 'fire_aura'
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
        aggroRange: 400,
        attackRange: 200,
        attackCooldown: 3000,
        xp: 100,
        isRanged: true,
        isFlying: true,
        abilities: ['fire_breath', 'fly_over', 'dragon_fear'],
        spawnWeight: 0,
        minWave: 5,
        armor: 8,
        magicResist: 8,
        evasion: 0.1,
        lifesteal: 0.05,
        deathEffect: 'massive_explosion',
        specialAbility: 'fire_breath',
        isBoss: true,
        bossPhase: 1,
        phaseThresholds: [0.75, 0.5, 0.25]
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
        aggroRange: 350,
        attackRange: 250,
        attackCooldown: 2500,
        xp: 80,
        isRanged: true,
        isFlying: false,
        abilities: ['summon_skeletons', 'death_coil', 'frost_aura'],
        spawnWeight: 0,
        minWave: 10,
        armor: 5,
        magicResist: 12,
        evasion: 0.05,
        lifesteal: 0.1,
        deathEffect: 'soul_explosion',
        specialAbility: 'summon_skeletons',
        isBoss: true,
        bossPhase: 1,
        phaseThresholds: [0.7, 0.4, 0.15]
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
        aggroRange: 500,
        attackRange: 300,
        attackCooldown: 3500,
        xp: 200,
        isRanged: true,
        isFlying: true,
        abilities: ['meteor_rain', 'dark_shield', 'summon_demons', 'void_blast'],
        spawnWeight: 0,
        minWave: 15,
        armor: 10,
        magicResist: 15,
        evasion: 0.08,
        lifesteal: 0.15,
        deathEffect: 'apocalypse',
        specialAbility: 'meteor_rain',
        isBoss: true,
        bossPhase: 1,
        phaseThresholds: [0.8, 0.6, 0.4, 0.2]
    }
};

const MOB_TYPE_KEYS = Object.keys(MOB_TYPES);

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
        size: 20,
        splash: 0,
        slow: 0,
        burn: false,
        healRate: 0,
        projectileColor: '#8B4513',
        projectileSize: 3,
        isMagic: false,
        upgradeCostFactor: 0.75,
        maxLevel: 5,
        targetPriority: 'closest',
        canTargetFlying: true,
        description: 'Стандартная башня, стреляет стрелами.'
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
        splash: 30,
        slow: 0,
        burn: false,
        healRate: 0,
        projectileColor: '#9b59b6',
        projectileSize: 6,
        isMagic: true,
        upgradeCostFactor: 0.75,
        maxLevel: 5,
        targetPriority: 'strongest',
        canTargetFlying: true,
        description: 'Магический урон по площади.'
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
        splash: 0,
        slow: 0.5,
        burn: false,
        healRate: 0,
        projectileColor: '#00CED1',
        projectileSize: 4,
        isMagic: true,
        upgradeCostFactor: 0.75,
        maxLevel: 5,
        targetPriority: 'fastest',
        canTargetFlying: true,
        description: 'Замораживает врагов, замедляя их.'
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
        splash: 0,
        slow: 0,
        burn: true,
        healRate: 0,
        projectileColor: '#FF4500',
        projectileSize: 5,
        isMagic: true,
        upgradeCostFactor: 0.75,
        maxLevel: 5,
        targetPriority: 'closest',
        canTargetFlying: true,
        description: 'Поджигает врагов, нанося урон со временем.'
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
        size: 20,
        splash: 0,
        slow: 0,
        burn: false,
        healRate: 0,
        projectileColor: '#2F4F4F',
        projectileSize: 2,
        isMagic: false,
        upgradeCostFactor: 0.75,
        maxLevel: 5,
        targetPriority: 'strongest',
        canTargetFlying: true,
        description: 'Дальнобойная, сильный урон по одной цели.'
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
        splash: 0,
        slow: 0,
        burn: false,
        healRate: 5,
        projectileColor: '#2ecc71',
        projectileSize: 0,
        isMagic: false,
        upgradeCostFactor: 0.75,
        maxLevel: 5,
        targetPriority: 'none',
        canTargetFlying: false,
        description: 'Лечит ближайших союзников и стены.'
    }
};

const TOWER_TYPE_KEYS = Object.keys(TOWER_TYPES);

// ==================== ТИПЫ СТЕН ====================
const WALL_TYPES = {
    wood: {
        name: 'Деревянная',
        icon: '🪵',
        cost: 10,
        hp: 100,
        color: '#8B4513',
        size: 30,
        reflectDamage: 0,
        damageBack: 0,
        armor: 0,
        description: 'Простая деревянная стена.'
    },
    stone: {
        name: 'Каменная',
        icon: '🧱',
        cost: 20,
        hp: 200,
        color: '#808080',
        size: 30,
        reflectDamage: 0,
        damageBack: 0,
        armor: 3,
        description: 'Прочная каменная стена.'
    },
    iron: {
        name: 'Железная',
        icon: '⛓️',
        cost: 35,
        hp: 350,
        color: '#4682B4',
        size: 30,
        reflectDamage: 0,
        damageBack: 0,
        armor: 6,
        description: 'Очень прочная железная стена.'
    },
    magic_wall: {
        name: 'Магическая',
        icon: '🌟',
        cost: 50,
        hp: 250,
        color: '#9b59b6',
        size: 30,
        reflectDamage: 5,
        damageBack: 0,
        armor: 2,
        description: 'Отражает урон атакующим.'
    },
    thorns: {
        name: 'Шипы',
        icon: '🌵',
        cost: 30,
        hp: 80,
        color: '#006400',
        size: 30,
        reflectDamage: 0,
        damageBack: 10,
        armor: 0,
        description: 'Наносит урон врагам при контакте.'
    }
};

const WALL_TYPE_KEYS = Object.keys(WALL_TYPES);

// ==================== ТИПЫ ЛОВУШЕК ====================
const TRAP_TYPES = {
    spike: {
        name: 'Шипы',
        icon: '📍',
        cost: 15,
        damage: 20,
        slow: 0,
        duration: 0,
        uses: 3,
        color: '#808080',
        radius: 30,
        teleportRadius: 0,
        description: 'Наносит урон при наступлении.'
    },
    slow: {
        name: 'Болото',
        icon: '🟤',
        cost: 20,
        damage: 0,
        slow: 0.3,
        duration: 3000,
        uses: 5,
        color: '#8B4513',
        radius: 30,
        teleportRadius: 0,
        description: 'Замедляет врагов.'
    },
    explosive: {
        name: 'Взрывная',
        icon: '💣',
        cost: 30,
        damage: 60,
        slow: 0,
        duration: 0,
        uses: 1,
        color: '#FF4500',
        radius: 50,
        teleportRadius: 0,
        description: 'Взрывается при контакте, нанося урон по площади.'
    },
    poison: {
        name: 'Ядовитая',
        icon: '🟢',
        cost: 25,
        damage: 5,
        slow: 0,
        duration: 5000,
        uses: 4,
        color: '#00FF00',
        radius: 30,
        teleportRadius: 0,
        description: 'Отравляет врагов, нанося урон со временем.'
    },
    teleport: {
        name: 'Телепорт',
        icon: '🌀',
        cost: 40,
        damage: 0,
        slow: 0,
        duration: 0,
        uses: 2,
        color: '#9b59b6',
        radius: 30,
        teleportRadius: 200,
        description: 'Телепортирует врага в случайное место.'
    }
};

const TRAP_TYPE_KEYS = Object.keys(TRAP_TYPES);

// ==================== СЕРВЕРНАЯ СТАТИСТИКА ====================
const serverStats = {
    totalGames: 0,
    totalKills: 0,
    totalDamage: 0,
    totalWavesCompleted: 0,
    highestWave: 0,
    bossesKilled: 0,
    playersServed: 0,
    startTime: Date.now()
};

// ==================== СТРУКТУРЫ ДАННЫХ ====================
const rooms = new Map();
const playerStats = new Map();
const playerGlobalStats = new Map();

function totalPlayers() {
    let count = 0;
    for (const room of rooms.values()) count += room.players.size;
    return count;
}

function generateRoomId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// ==================== УТИЛИТЫ ====================
function distance(x1, y1, x2, y2) {
    return Math.hypot(x2 - x1, y2 - y1);
}

function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
}

function normalize(x, y) {
    const len = Math.hypot(x, y);
    if (len === 0) return { x: 0, y: 0 };
    return { x: x / len, y: y / len };
}

function angleBetween(x1, y1, x2, y2) {
    return Math.atan2(y2 - y1, x2 - x1);
}

function randomInRange(min, max) {
    return min + Math.random() * (max - min);
}

function randomInt(min, max) {
    return Math.floor(randomInRange(min, max + 1));
}

function randomChoice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function weightedRandom(items, weights) {
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;
    for (let i = 0; i < items.length; i++) {
        random -= weights[i];
        if (random <= 0) return items[i];
    }
    return items[items.length - 1];
}

function lerp(a, b, t) {
    return a + (b - a) * t;
}

function smoothstep(a, b, t) {
    t = clamp((t - a) / (b - a), 0, 1);
    return t * t * (3 - 2 * t);
}

function pointInCircle(px, py, cx, cy, r) {
    return distance(px, py, cx, cy) <= r;
}

function lineIntersectsRect(x1, y1, x2, y2, rx, ry, rw, rh) {
    const left = rx;
    const right = rx + rw;
    const top = ry;
    const bottom = ry + rh;
    if ((x1 >= left && x1 <= right && y1 >= top && y1 <= bottom) ||
        (x2 >= left && x2 <= right && y2 >= top && y2 <= bottom)) return true;
    if (lineIntersectsLine(x1, y1, x2, y2, left, top, right, top)) return true;
    if (lineIntersectsLine(x1, y1, x2, y2, right, top, right, bottom)) return true;
    if (lineIntersectsLine(x1, y1, x2, y2, left, bottom, right, bottom)) return true;
    if (lineIntersectsLine(x1, y1, x2, y2, left, top, left, bottom)) return true;
    return false;
}

function lineIntersectsLine(x1, y1, x2, y2, x3, y3, x4, y4) {
    const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (den === 0) return false;
    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / den;
    return t >= 0 && t <= 1 && u >= 0 && u <= 1;
}

function isPointInPolygon(px, py, polygon) {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i].x, yi = polygon[i].y;
        const xj = polygon[j].x, yj = polygon[j].y;
        if (((yi > py) !== (yj > py)) && (px < (xj - xi) * (py - yi) / (yj - yi) + xi)) {
            inside = !inside;
        }
    }
    return inside;
}

function generateSpawnPosition(mapW, mapH, fortressX, fortressY, fortressR) {
    const side = Math.floor(Math.random() * 4);
    let x, y;
    switch (side) {
        case 0: x = Math.random() * mapW; y = -30; break;
        case 1: x = mapW + 30; y = Math.random() * mapH; break;
        case 2: x = Math.random() * mapW; y = mapH + 30; break;
        case 3: x = -30; y = Math.random() * mapH; break;
    }
    return { x, y };
}

function angleFromTo(x1, y1, x2, y2) {
    return Math.atan2(y2 - y1, x2 - x1);
}

function moveTowards(x, y, targetX, targetY, speed) {
    const angle = angleFromTo(x, y, targetX, targetY);
    return {
        x: x + Math.cos(angle) * speed,
        y: y + Math.sin(angle) * speed
    };
}

function moveAwayFrom(x, y, sourceX, sourceY, speed) {
    const angle = angleFromTo(sourceX, sourceY, x, y);
    return {
        x: x + Math.cos(angle) * speed,
        y: y + Math.sin(angle) * speed
    };
}

function findClosestTarget(x, y, targets, maxRange) {
    let closest = null;
    let closestDist = maxRange || Infinity;
    for (const target of targets) {
        const dist = distance(x, y, target.x, target.y);
        if (dist < closestDist) {
            closestDist = dist;
            closest = target;
        }
    }
    return closest;
}

function findStrongestTarget(x, y, targets, maxRange) {
    let strongest = null;
    let strongestHp = 0;
    for (const target of targets) {
        const dist = distance(x, y, target.x, target.y);
        if (dist <= (maxRange || Infinity) && target.hp > strongestHp) {
            strongestHp = target.hp;
            strongest = target;
        }
    }
    return strongest;
}

function findFastestTarget(x, y, targets, maxRange) {
    let fastest = null;
    let fastestSpeed = 0;
    for (const target of targets) {
        const dist = distance(x, y, target.x, target.y);
        if (dist <= (maxRange || Infinity) && target.speed > fastestSpeed) {
            fastestSpeed = target.speed;
            fastest = target;
        }
    }
    return fastest;
}

function findWeakestTarget(x, y, targets, maxRange) {
    let weakest = null;
    let weakestHp = Infinity;
    for (const target of targets) {
        const dist = distance(x, y, target.x, target.y);
        if (dist <= (maxRange || Infinity) && target.hp < weakestHp) {
            weakestHp = target.hp;
            weakest = target;
        }
    }
    return weakest;
}

function findLowestHpTarget(x, y, targets, maxRange) {
    let lowest = null;
    let lowestRatio = Infinity;
    for (const target of targets) {
        const dist = distance(x, y, target.x, target.y);
        if (dist <= (maxRange || Infinity)) {
            const ratio = target.hp / target.maxHp;
            if (ratio < lowestRatio) {
                lowestRatio = ratio;
                lowest = target;
            }
        }
    }
    return lowest;
}

function checkLineOfSight(x1, y1, x2, y2, walls) {
    for (const wall of walls) {
        const halfSize = wall.size / 2;
        if (lineIntersectsRect(x1, y1, x2, y2,
            wall.x - halfSize, wall.y - halfSize, wall.size, wall.size)) {
            return false;
        }
    }
    return true;
}

function predictPosition(x, y, targetX, targetY, targetSpeed, projectileSpeed) {
    const dist = distance(x, y, targetX, targetY);
    const timeToHit = dist / projectileSpeed;
    const angle = angleFromTo(x, y, targetX, targetY);
    const predictedX = targetX + Math.cos(angle) * targetSpeed * timeToHit * 0.3;
    const predictedY = targetY + Math.sin(angle) * targetSpeed * timeToHit * 0.3;
    return { x: predictedX, y: predictedY };
}

function calculateDamage(baseDamage, attacker, defender, isMagic) {
    let damage = baseDamage;
    let armor = defender.armor || 0;
    let magicResist = defender.magicResist || 0;
    if (isMagic) {
        damage = Math.max(1, damage - magicResist);
    } else {
        damage = Math.max(1, damage - armor);
    }
    if (attacker && attacker.critChance > 0) {
        if (Math.random() < attacker.critChance) {
            damage = Math.floor(damage * attacker.critMult);
        }
    }
    return Math.floor(damage);
}

function calculateSplashDamage(x, y, radius, damage, targets) {
    const affected = [];
    for (const target of targets) {
        const dist = distance(x, y, target.x, target.y);
        if (dist <= radius) {
            const falloff = 1 - (dist / radius) * 0.5;
            const splashDamage = Math.floor(damage * falloff);
            affected.push({ target, damage: splashDamage });
        }
    }
    return affected;
}

function applyStatusEffect(target, type, duration, extra) {
    if (!target.statusEffects) target.statusEffects = [];
    const existing = target.statusEffects.find(e => e.type === type);
    if (existing) {
        existing.duration = Math.max(existing.duration, duration);
        existing.startTime = Date.now();
        if (extra) Object.assign(existing, extra);
    } else {
        target.statusEffects.push({
            type,
            duration,
            startTime: Date.now(),
            ...(extra || {})
        });
    }
}

function removeStatusEffect(target, type) {
    if (!target.statusEffects) return;
    target.statusEffects = target.statusEffects.filter(e => e.type !== type);
}

function hasStatusEffect(target, type) {
    return target.statusEffects && target.statusEffects.some(e => e.type === type);
}

function getStatusEffect(target, type) {
    if (!target.statusEffects) return null;
    return target.statusEffects.find(e => e.type === type);
}

function cleanStatusEffects(target) {
    if (!target.statusEffects) return;
    const now = Date.now();
    target.statusEffects = target.statusEffects.filter(e => now - e.startTime < e.duration);
}

function calculateSpeedWithEffects(baseSpeed, statusEffects) {
    let speed = baseSpeed;
    if (!statusEffects) return speed;
    for (const effect of statusEffects) {
        if (effect.type === 'slow') speed *= (effect.slowFactor || 0.5);
        if (effect.type === 'speed') speed *= 1.5;
        if (effect.type === 'stun') speed = 0;
    }
    return speed;
}

function isStunned(statusEffects) {
    return statusEffects && statusEffects.some(e => e.type === 'stun');
}

function calculatePathToFortress(mob, walls, players, fortressX, fortressY) {
    const targetX = fortressX;
    const targetY = fortressY;
    let closestWall = null;
    let closestWallDist = Infinity;
    for (const wall of walls) {
        const dist = distance(mob.x, mob.y, wall.x, wall.y);
        if (dist < closestWallDist) {
            closestWallDist = dist;
            closestWall = wall;
        }
    }
    if (closestWall && closestWallDist < 100) {
        const angle = angleFromTo(mob.x, mob.y, closestWall.x, closestWall.y);
        const perpAngle = angle + Math.PI / 2;
        const side = Math.random() < 0.5 ? 1 : -1;
        return {
            x: mob.x + Math.cos(perpAngle) * side * 30,
            y: mob.y + Math.sin(perpAngle) * side * 30
        };
    }
    if (mob.behavior === 'ranged') {
        let closestPlayer = null;
        let closestPlayerDist = Infinity;
        for (const [, player] of players) {
            if (player.isDead) continue;
            const dist = distance(mob.x, mob.y, player.x, player.y);
            if (dist < closestPlayerDist) {
                closestPlayerDist = dist;
                closestPlayer = player;
            }
        }
        if (closestPlayer && closestPlayerDist < mob.aggroRange) {
            if (closestPlayerDist < mob.attackRange * 0.7) {
                return moveAwayFrom(mob.x, mob.y, closestPlayer.x, closestPlayer.y, mob.speed);
            }
            return { x: mob.x, y: mob.y };
        }
    }
    return { x: targetX, y: targetY };
}

function findSwarmTarget(mob, allMobs, players, fortressX, fortressY) {
    if (mob.behavior === 'swarm') {
        let closestPlayer = null;
        let closestDist = mob.aggroRange;
        for (const [, player] of players) {
            if (player.isDead) continue;
            const dist = distance(mob.x, mob.y, player.x, player.y);
            if (dist < closestDist) {
                closestDist = dist;
                closestPlayer = player;
            }
        }
        if (closestPlayer) return { x: closestPlayer.x, y: closestPlayer.y };
        const nearbyAllies = allMobs.filter(m => m.id !== mob.id && distance(mob.x, mob.y, m.x, m.y) < 100);
        if (nearbyAllies.length > 0) {
            const leader = nearbyAllies[0];
            const angle = angleFromTo(leader.x, leader.y, mob.x, mob.y);
            return {
                x: fortressX + Math.cos(angle) * 50,
                y: fortressY + Math.sin(angle) * 50
            };
        }
    }
    return { x: fortressX, y: fortressY };
}

function findTankTarget(mob, players, fortressX, fortressY) {
    let closestPlayer = null;
    let closestDist = mob.aggroRange;
    for (const [, player] of players) {
        if (player.isDead) continue;
        const dist = distance(mob.x, mob.y, player.x, player.y);
        if (dist < closestDist) {
            closestDist = dist;
            closestPlayer = player;
        }
    }
    if (closestPlayer) return { x: closestPlayer.x, y: closestPlayer.y };
    return { x: fortressX, y: fortressY };
}

function findBossTarget(mob, players, towers, fortressX, fortressY) {
    if (mob.bossPhase === 1) {
        let weakestPlayer = null;
        let lowestHp = Infinity;
        for (const [, player] of players) {
            if (player.isDead) continue;
            if (player.hp < lowestHp) {
                lowestHp = player.hp;
                weakestPlayer = player;
            }
        }
        if (weakestPlayer) return { x: weakestPlayer.x, y: weakestPlayer.y };
    }
    if (mob.bossPhase === 2) {
        let closestTower = null;
        let closestDist = mob.aggroRange;
        for (const tower of towers) {
            const dist = distance(mob.x, mob.y, tower.x, tower.y);
            if (dist < closestDist) {
                closestDist = dist;
                closestTower = tower;
            }
        }
        if (closestTower) return { x: closestTower.x, y: closestTower.y };
    }
    return { x: fortressX, y: fortressY };
}

function executeBossAbility(mob, room, now) {
    if (!mob.abilities || mob.abilities.length === 0) return;
    const ability = randomChoice(mob.abilities);
    switch (ability) {
        case 'fire_breath': {
            const target = findClosestTarget(mob.x, mob.y, Array.from(room.players.values()).filter(p => !p.isDead), mob.attackRange);
            if (target) {
                for (const [, player] of room.players) {
                    if (player.isDead) continue;
                    if (distance(mob.x, mob.y, player.x, player.y) < 80) {
                        player.hp -= Math.floor(mob.damage * 0.5);
                        if (player.hp <= 0) {
                            player.isDead = true;
                            player.deathTime = now;
                            room.broadcastChat(`${player.role.icon} ${player.name} сожжён драконом!`);
                        }
                    }
                }
                io.to(room.id).emit('explosion', { x: target.x, y: target.y, radius: 80, color: '#FF4500' });
            }
            break;
        }
        case 'summon_skeletons': {
            for (let i = 0; i < 5; i++) {
                const angle = Math.random() * Math.PI * 2;
                const dist = 50 + Math.random() * 50;
                room.mobs.push({
                    id: ++room.mobIdCounter,
                    x: mob.x + Math.cos(angle) * dist,
                    y: mob.y + Math.sin(angle) * dist,
                    hp: 30, maxHp: 30,
                    speed: 1.2, damage: 8,
                    reward: 5, xp: 3,
                    icon: '💀', color: '#D3D3D3',
                    size: 8, name: 'Призрак',
                    behavior: 'swarm',
                    isBoss: false,
                    statusEffects: [],
                    marked: false,
                    lastAttack: 0,
                    attackCooldown: 1500,
                    aggroRange: 150,
                    attackRange: 15,
                    armor: 0, magicResist: 0,
                    evasion: 0
                });
            }
            room.broadcastChat('☠️ Лич призвал духов!');
            break;
        }
        case 'death_coil': {
            const target = findClosestTarget(mob.x, mob.y, Array.from(room.players.values()).filter(p => !p.isDead), mob.attackRange);
            if (target) {
                target.hp -= Math.floor(mob.damage * 1.5);
                mob.hp = Math.min(mob.maxHp, mob.hp + Math.floor(mob.damage * 0.5));
                room.broadcastChat('☠️ Лич выпустил Кocêль смерти!');
                if (target.hp <= 0) {
                    target.isDead = true;
                    target.deathTime = now;
                    room.broadcastChat(`${target.role.icon} ${target.name} поражён Костью смерти!`);
                }
            }
            break;
        }
        case 'meteor_rain': {
            for (let i = 0; i < 8; i++) {
                setTimeout(() => {
                    const mx = CENTER_X + (Math.random() - 0.5) * MAP_WIDTH * 0.6;
                    const my = CENTER_Y + (Math.random() - 0.5) * MAP_HEIGHT * 0.6;
                    for (const [, player] of room.players) {
                        if (player.isDead) continue;
                        if (distance(mx, my, player.x, player.y) < 60) {
                            player.hp -= 40;
                            if (player.hp <= 0) {
                                player.isDead = true;
                                player.deathTime = Date.now();
                            }
                        }
                    }
                    io.to(room.id).emit('explosion', { x: mx, y: my, radius: 60, color: '#ff4500' });
                }, i * 300);
            }
            room.broadcastChat('☄️ Архидемон обрушивает метеоритный дождь!');
            break;
        }
        case 'dark_shield': {
            mob.hp = Math.min(mob.maxHp, mob.hp + Math.floor(mob.maxHp * 0.2));
            applyStatusEffect(mob, 'shield', 5000, { shieldAmount: 100 });
            room.broadcastChat('🛡️ Архидемон поднял тёмный щит!');
            break;
        }
        case 'summon_demons': {
            for (let i = 0; i < 3; i++) {
                const angle = Math.random() * Math.PI * 2;
                const dist = 80 + Math.random() * 80;
                const demonType = MOB_TYPES.demon;
                room.mobs.push({
                    id: ++room.mobIdCounter,
                    x: mob.x + Math.cos(angle) * dist,
                    y: mob.y + Math.sin(angle) * dist,
                    hp: Math.floor(demonType.hp * room.difficulty),
                    maxHp: Math.floor(demonType.hp * room.difficulty),
                    speed: demonType.speed,
                    damage: Math.floor(demonType.damage * room.difficulty),
                    reward: demonType.reward,
                    xp: demonType.xp,
                    icon: demonType.icon,
                    color: demonType.color,
                    size: demonType.size,
                    name: demonType.name,
                    behavior: demonType.behavior,
                    isBoss: false,
                    statusEffects: [],
                    marked: false,
                    lastAttack: 0,
                    attackCooldown: demonType.attackCooldown,
                    aggroRange: demonType.aggroRange,
                    attackRange: demonType.attackRange,
                    armor: demonType.armor,
                    magicResist: demonType.magicResist,
                    evasion: demonType.evasion
                });
            }
            room.broadcastChat('😈 Архидемон призвал демонов!');
            break;
        }
        case 'void_blast': {
            for (const [, player] of room.players) {
                if (player.isDead) continue;
                if (distance(mob.x, mob.y, player.x, player.y) < 200) {
                    player.hp -= Math.floor(mob.damage * 0.8);
                    applyStatusEffect(player, 'slow', 3000, { slowFactor: 0.3 });
                    if (player.hp <= 0) {
                        player.isDead = true;
                        player.deathTime = now;
                    }
                }
            }
            io.to(room.id).emit('explosion', { x: mob.x, y: mob.y, radius: 200, color: '#40E0D0' });
            room.broadcastChat('🌀 Архидемон выпустил Пустотной взрыв!');
            break;
        }
        case 'dragon_fear': {
            for (const [, player] of room.players) {
                if (player.isDead) continue;
                if (distance(mob.x, mob.y, player.x, player.y) < 250) {
                    applyStatusEffect(player, 'slow', 2000, { slowFactor: 0.5 });
                }
            }
            room.broadcastChat('😨 Дракон устрашил героев!');
            break;
        }
        case 'frost_aura': {
            for (const [, player] of room.players) {
                if (player.isDead) continue;
                if (distance(mob.x, mob.y, player.x, player.y) < 150) {
                    applyStatusEffect(player, 'slow', 1500, { slowFactor: 0.7 });
                }
            }
            break;
        }
    }
}

function executeMobSpecialAbility(mob, room, now) {
    switch (mob.specialAbility) {
        case 'charge': {
            const target = findClosestTarget(mob.x, mob.y, Array.from(room.players.values()).filter(p => !p.isDead), 100);
            if (target) {
                const angle = angleFromTo(mob.x, mob.y, target.x, target.y);
                mob.x += Math.cos(angle) * 60;
                mob.y += Math.sin(angle) * 60;
                if (distance(mob.x, mob.y, target.x, target.y) < 30) {
                    target.hp -= Math.floor(mob.damage * 1.5);
                    if (target.hp <= 0) {
                        target.isDead = true;
                        target.deathTime = now;
                    }
                }
            }
            break;
        }
        case 'regenerate': {
            mob.hp = Math.min(mob.maxHp, mob.hp + 2);
            break;
        }
        case 'fire_aura': {
            for (const [, player] of room.players) {
                if (player.isDead) continue;
                if (distance(mob.x, mob.y, player.x, player.y) < 40) {
                    player.hp -= 2;
                    if (player.hp <= 0) {
                        player.isDead = true;
                        player.deathTime = now;
                    }
                }
            }
            break;
        }
        case 'rage': {
            if (mob.hp < mob.maxHp * 0.3) {
                mob.damage = Math.floor(mob.damage * 1.1);
                mob.speed *= 1.05;
                mob.specialAbility = null;
            }
            break;
        }
        case 'dark_bolt': {
            const target = findClosestTarget(mob.x, mob.y, Array.from(room.players.values()).filter(p => !p.isDead), mob.attackRange);
            if (target) {
                target.hp -= Math.floor(mob.damage * 0.7);
                mob.hp = Math.min(mob.maxHp, mob.hp + 5);
                if (target.hp <= 0) {
                    target.isDead = true;
                    target.deathTime = now;
                }
            }
            break;
        }
        case 'fly_over': {
            mob.isFlying = true;
            break;
        }
        case 'fire_breath':
        case 'summon_skeletons':
        case 'death_coil':
        case 'meteor_rain':
        case 'dark_shield':
        case 'summon_demons':
        case 'void_blast':
        case 'dragon_fear':
        case 'frost_aura':
            break;
    }
}

function executeTowerSpecialEffect(tower, target, room, now) {
    if (tower.slow > 0) {
        applyStatusEffect(target, 'slow', 2000, { slowFactor: tower.slow });
    }
    if (tower.burn) {
        applyStatusEffect(target, 'burn', 3000, { damage: 5 });
    }
}

function executeTrapEffect(trap, mob, room, now) {
    if (trap.damage > 0) {
        mob.hp -= trap.damage;
    }
    if (trap.slow > 0) {
        applyStatusEffect(mob, 'slow', trap.duration, { slowFactor: trap.slow });
    }
    if (trap.teleportRadius > 0) {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * trap.teleportRadius;
        mob.x = trap.x + Math.cos(angle) * dist;
        mob.y = trap.y + Math.sin(angle) * dist;
    }
    trap.uses--;
    io.to(room.id).emit('trapTriggered', { x: trap.x, y: trap.y, type: trap.type });
}

function processPlayerDeath(player, room, now) {
    player.isDead = true;
    player.deathTime = now;
    room.broadcastChat(`${player.role.icon} ${player.name} погиб!`);
}

function processMobDeath(mob, room, now) {
    room.score += mob.reward;
    room.waveMobsKilled++;
    room.totalKills++;
    serverStats.totalKills++;

    for (const [, player] of room.players) {
        player.kills++;
        player.score += mob.reward;
        player.xp += mob.xp || mob.reward;
        player.coins += Math.floor(mob.reward / 2);
        player.totalDamageDealt += mob.reward;

        if (player.xp >= player.xpToNext) {
            player.level++;
            player.xp -= player.xpToNext;
            player.xpToNext = Math.floor(player.xpToNext * 1.5);
            player.maxHp += 10;
            player.hp = Math.min(player.maxHp, player.hp + 10);
            player.maxAmmo += 5;
            room.broadcastChat(`${player.role.icon} ${player.name} достиг уровня ${player.level}!`);
        }
    }

    room.comboMultiplier = Math.min(COMBO_MAX, room.comboMultiplier + COMBO_INCREMENT);
    clearTimeout(room.comboTimer);
    room.comboTimer = setTimeout(() => {
        room.comboMultiplier = COMBO_DECAY;
    }, COMBO_TIMEOUT);

    if (mob.deathEffect) {
        executeDeathEffect(mob, room);
    }
}

function executeDeathEffect(mob, room) {
    switch (mob.deathEffect) {
        case 'fire_explosion': {
            for (const [, player] of room.players) {
                if (player.isDead) continue;
                if (distance(mob.x, mob.y, player.x, player.y) < 50) {
                    player.hp -= 15;
                    if (player.hp <= 0) {
                        player.isDead = true;
                        player.deathTime = Date.now();
                    }
                }
            }
            io.to(room.id).emit('explosion', { x: mob.x, y: mob.y, radius: 50, color: '#FF4500' });
            break;
        }
        case 'massive_explosion': {
            for (const [, player] of room.players) {
                if (player.isDead) continue;
                if (distance(mob.x, mob.y, player.x, player.y) < 100) {
                    player.hp -= 30;
                    if (player.hp <= 0) {
                        player.isDead = true;
                        player.deathTime = Date.now();
                    }
                }
            }
            io.to(room.id).emit('explosion', { x: mob.x, y: mob.y, radius: 100, color: '#FF0000' });
            break;
        }
        case 'soul_explosion': {
            for (const [, player] of room.players) {
                if (player.isDead) continue;
                if (distance(mob.x, mob.y, player.x, player.y) < 80) {
                    player.hp -= 20;
                    applyStatusEffect(player, 'slow', 2000, { slowFactor: 0.5 });
                    if (player.hp <= 0) {
                        player.isDead = true;
                        player.deathTime = Date.now();
                    }
                }
            }
            io.to(room.id).emit('explosion', { x: mob.x, y: mob.y, radius: 80, color: '#4B0082' });
            break;
        }
        case 'apocalypse': {
            for (const [, player] of room.players) {
                if (player.isDead) continue;
                if (distance(mob.x, mob.y, player.x, player.y) < 150) {
                    player.hp -= 40;
                    applyStatusEffect(player, 'stun', 2000);
                    if (player.hp <= 0) {
                        player.isDead = true;
                        player.deathTime = Date.now();
                    }
                }
            }
            io.to(room.id).emit('explosion', { x: mob.x, y: mob.y, radius: 150, color: '#40E0D0' });
            room.broadcastChat('💀 Апокалипсис!');
            break;
        }
    }
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
        this.fortressHP = FORTRESS_BASE_HP;
        this.fortressMaxHP = FORTRESS_BASE_HP;
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
        this.buildPhaseTimer = null;
        this.defenseTimer = null;
        this.waveTransitionTimer = null;
        this.totalMobsSpawned = 0;
        this.totalDamageToMobs = 0;
        this.totalDamageToFortress = 0;
        this.totalHealingDone = 0;
        this.totalWallsBuilt = 0;
        this.totalTowersBuilt = 0;
        this.totalTrapsBuilt = 0;
        this.totalAbilitiesUsed = 0;
        this.totalAmmoBought = 0;
        this.totalRevives = 0;
        this.gameStartTime = null;
        this.lastTickTime = Date.now();
        this.tickCount = 0;
        this.averageTickTime = 0;
        this.maxMobsReached = 0;
        this.wavesCompleted = 0;
        this.bossesKilled = 0;
        this.peakScore = 0;
        this.longestWave = 0;
        this.shortestWave = Infinity;
        this.averageWaveTime = 0;
        this.totalWaveTime = 0;
    }

    addPlayer(socket, name, characterClass) {
        if (this.players.size >= MAX_PLAYERS_PER_ROOM) {
            socket.emit('error_msg', 'Комната полна (макс. 6)');
            return false;
        }

        const roleKey = characterClass || ROLE_KEYS[this.players.size];
        const role = ROLES[roleKey] || ROLES[ROLE_KEYS[this.players.size]];

        const angle = (this.players.size / MAX_PLAYERS_PER_ROOM) * Math.PI * 2;
        const spawnDist = PLAYER_SPAWN_DISTANCE;

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
            totalDamageDealt: 0,
            score: 0,
            level: 1,
            xp: 0,
            xpToNext: 100,
            speed: PLAYER_BASE_SPEED * role.speedMod,
            abilities: {},
            abilityCooldowns: {},
            statusEffects: [],
            isDead: false,
            deathTime: 0,
            respawnTimer: 0,
            lastShot: 0,
            lastAbility: 0,
            shield: 0,
            direction: { x: 0, y: 1 },
            damageMod: role.damageMod,
            rangeMod: role.rangeMod,
            critChance: role.critChance,
            critMult: role.critMult,
            totalKills: 0,
            totalDeaths: 0,
            totalDamageTaken: 0,
            totalHealingReceived: 0,
            totalAbilitiesUsed: 0,
            totalShotsFired: 0,
            totalAmmoUsed: 0,
            longestKillStreak: 0,
            currentKillStreak: 0,
            joinTime: Date.now()
        };

        for (const ability of role.abilities) {
            player.abilities[ability] = true;
            player.abilityCooldowns[ability] = 0;
        }

        this.players.set(socket.id, player);
        serverStats.playersServed++;
        this.broadcastChat(`${role.icon} ${name} присоединился как ${role.name}`);
        this.broadcastRoomState();
        return true;
    }

    removePlayer(playerId) {
        const player = this.players.get(playerId);
        if (player) {
            this.broadcastChat(`${player.role.icon} ${player.name} вышел`);
            const globalStats = playerGlobalStats.get(playerId) || {
                gamesPlayed: 0, totalKills: 0, totalScore: 0,
                totalDeaths: 0, totalDamage: 0, wins: 0,
                highestLevel: 1, longestGame: 0
            };
            globalStats.gamesPlayed++;
            globalStats.totalKills += player.totalKills;
            globalStats.totalScore += player.score;
            globalStats.totalDeaths += player.totalDeaths;
            globalStats.totalDamage += player.totalDamageDealt;
            globalStats.highestLevel = Math.max(globalStats.highestLevel, player.level);
            globalStats.longestGame = Math.max(globalStats.longestGame, Date.now() - player.joinTime);
            playerGlobalStats.set(playerId, globalStats);
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
        let i = 0;
        for (const [, player] of this.players) {
            if (i < ROLE_KEYS.length) {
                player.roleKey = ROLE_KEYS[i];
                player.role = ROLES[ROLE_KEYS[i]];
                player.speed = PLAYER_BASE_SPEED * player.role.speedMod;
                player.damageMod = player.role.damageMod;
                player.rangeMod = player.role.rangeMod;
                player.critChance = player.role.critChance;
                player.critMult = player.role.critMult;
                for (const ability of player.role.abilities) {
                    player.abilities[ability] = true;
                    if (!player.abilityCooldowns[ability]) player.abilityCooldowns[ability] = 0;
                }
                i++;
            }
        }
    }

    broadcastChat(message) {
        const entry = { text: message, time: Date.now() };
        this.chat.push(entry);
        if (this.chat.length > CHAT_HISTORY_LIMIT) this.chat.shift();
        io.to(this.id).emit('chat', entry);
    }

    broadcastRoomState() {
        const state = this.getRoomState();
        io.to(this.id).emit('roomState', state);
    }

    getRoomState() {
        return {
            phase: this.phase,
            players: Array.from(this.players.values()).map(p => ({
                id: p.id, name: p.name, roleKey: p.roleKey, role: p.role.name,
                roleIcon: p.role.icon, roleColor: p.role.color,
                hp: p.hp, maxHp: p.maxHp, ammo: p.ammo, maxAmmo: p.maxAmmo,
                coins: p.coins, ready: p.ready, x: p.x, y: p.y,
                kills: p.kills, score: p.score, level: p.level,
                shield: p.shield, isDead: p.isDead,
                statusEffects: p.statusEffects.map(e => e.type),
                direction: p.direction,
                abilityCooldowns: Object.fromEntries(
                    Object.entries(p.abilityCooldowns).map(([k, v]) => [k, Math.max(0, v - Date.now())])
                )
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
    }

    handleAction(playerId, action) {
        const player = this.players.get(playerId);
        if (!player || player.isDead) return;

        const now = Date.now();

        switch (action.type) {
            case 'ready':
                player.ready = action.ready;
                if (Array.from(this.players.values()).every(p => p.ready) && this.players.size >= MIN_PLAYERS_TO_START) {
                    this.startBuildPhase();
                }
                this.broadcastRoomState();
                break;

            case 'chat':
                if (action.message && action.message.length <= CHAT_MAX_LENGTH) {
                    this.broadcastChat(`${player.role.icon} ${player.name}: ${action.message}`);
                }
                break;

            case 'move':
                if (this.phase === 'defense' || this.phase === 'build') {
                    let speedMod = 1;
                    for (const effect of player.statusEffects) {
                        if (effect.type === 'slow') speedMod *= (effect.slowFactor || 0.5);
                        if (effect.type === 'speed') speedMod *= 1.5;
                    }
                    if (isStunned(player.statusEffects)) speedMod = 0;

                    const speed = player.speed * speedMod;
                    let dx = action.dx || 0;
                    let dy = action.dy || 0;

                    if (dx !== 0 || dy !== 0) {
                        const len = Math.sqrt(dx * dx + dy * dy);
                        dx = (dx / len) * speed;
                        dy = (dy / len) * speed;
                    }

                    const newX = clamp(player.x + dx, 20, MAP_WIDTH - 20);
                    const newY = clamp(player.y + dy, 20, MAP_HEIGHT - 20);

                    let blocked = false;
                    for (const wall of this.walls) {
                        if (distance(newX, newY, wall.x, wall.y) < wall.size / 2 + WALL_COLLISION_SIZE) {
                            blocked = true;
                            break;
                        }
                    }

                    if (!blocked) {
                        player.x = newX;
                        player.y = newY;
                    }

                    if (action.lookingAt) {
                        player.direction = normalize(
                            action.lookingAt.x - player.x,
                            action.lookingAt.y - player.y
                        );
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
                if (now - player.lastShot < SHOOT_COOLDOWN) break;

                player.ammo--;
                player.lastShot = now;
                player.totalShotsFired++;
                player.totalAmmoUsed++;

                let shootDamage = 15 * player.damageMod;
                let shootRange = 300 * player.rangeMod;

                if (player.critChance > 0 && Math.random() < player.critChance) {
                    shootDamage = Math.floor(shootDamage * player.critMult);
                }

                if (player.roleKey === 'ARCHER') {
                    shootDamage = 25 * player.damageMod;
                    shootRange = 450 * player.rangeMod;
                }

                if (player.roleKey === 'MAGE') {
                    shootDamage = 20 * player.damageMod;
                    this.createProjectile(player, action.targetX, action.targetY, '#9b59b6', shootDamage, true, 30);
                    break;
                }

                this.createProjectile(player, action.targetX, action.targetY, player.role.color, shootDamage, false, 0);
                break;

            case 'placeWall':
                if (this.phase !== 'build') break;
                const wallType = action.wallType || 'wood';
                const wallDef = WALL_TYPES[wallType];
                if (!wallDef) break;
                const wallCost = player.roleKey === 'BUILDER' ? Math.floor(wallDef.cost * 0.5) : wallDef.cost;

                if (player.coins < wallCost) break;
                if (distance(action.x, action.y, CENTER_X, CENTER_Y) < FORTRESS_RADIUS) break;

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
                    damageBack: wallDef.damageBack || 0,
                    armor: wallDef.armor || 0,
                    lastRepair: 0
                });
                this.totalWallsBuilt++;
                this.broadcastRoomState();
                break;

            case 'placeTower':
                if (this.phase !== 'build') break;
                const towerType = action.towerType || 'arrow';
                const towerDef = TOWER_TYPES[towerType];
                if (!towerDef) break;

                if (player.coins < towerDef.cost) break;
                if (distance(action.x, action.y, CENTER_X, CENTER_Y) < FORTRESS_RADIUS + FORTRESS_COLLISION_BONUS) break;

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
                    projectileColor: towerDef.projectileColor,
                    projectileSize: towerDef.projectileSize,
                    isMagic: towerDef.isMagic,
                    targetPriority: towerDef.targetPriority,
                    canTargetFlying: towerDef.canTargetFlying,
                    lastFired: 0,
                    reloading: false,
                    totalShotsFired: 0,
                    totalDamageDealt: 0,
                    totalHealingDone: 0,
                    kills: 0
                });
                this.totalTowersBuilt++;
                this.broadcastRoomState();
                break;

            case 'placeTrap':
                if (this.phase !== 'build') break;
                const trapType = action.trapType || 'spike';
                const trapDef = TRAP_TYPES[trapType];
                if (!trapDef) break;

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
                    teleportRadius: trapDef.teleportRadius || 0,
                    placedBy: player.id,
                    totalTriggers: 0,
                    totalDamageDealt: 0
                });
                this.totalTrapsBuilt++;
                this.broadcastRoomState();
                break;

            case 'upgradeTower':
                if (this.phase !== 'build') break;
                const tower = this.towers.find(t => t.id === action.towerId);
                if (!tower) break;
                const towerType2 = TOWER_TYPES[tower.type];
                if (!towerType2) break;
                const upgradeCost = Math.floor(towerType2.cost * tower.level * towerType2.upgradeCostFactor);
                if (player.coins < upgradeCost) break;
                if (tower.level >= towerType2.maxLevel) break;

                player.coins -= upgradeCost;
                tower.level++;
                tower.hp = Math.min(tower.maxHp + tower.level * TOWER_LEVEL_HP_BONUS, tower.hp + TOWER_LEVEL_UPGRADE_HP);
                tower.maxHp += TOWER_LEVEL_HP_BONUS;
                tower.damage = Math.floor(tower.damage * TOWER_LEVEL_DAMAGE_MULT);
                tower.range += TOWER_LEVEL_RANGE_BONUS;
                this.broadcastRoomState();
                break;

            case 'repairWall':
                if (this.phase !== 'build' && this.phase !== 'defense') break;
                if (player.roleKey !== 'BUILDER' && player.roleKey !== 'ENGINEER') break;
                const wall = this.walls.find(w => w.id === action.wallId);
                if (!wall) break;
                const distToWall = distance(player.x, player.y, wall.x, wall.y);
                if (distToWall > REPAIR_RANGE) break;
                const repairCost = Math.floor((wall.maxHp - wall.hp) * REPAIR_COST_FACTOR);
                if (player.coins < repairCost) break;

                player.coins -= repairCost;
                wall.hp = Math.min(wall.maxHp, wall.hp + REPAIR_HP);
                this.broadcastRoomState();
                break;

            case 'sellWall':
                if (this.phase !== 'build') break;
                const sellWall = this.walls.find(w => w.id === action.wallId);
                if (!sellWall) break;
                const sellValue = Math.floor(WALL_TYPES[sellWall.type].cost * SELL_VALUE_FACTOR);
                player.coins += sellValue;
                this.walls = this.walls.filter(w => w.id !== action.wallId);
                this.broadcastRoomState();
                break;

            case 'sellTower':
                if (this.phase !== 'build') break;
                const sellTower = this.towers.find(t => t.id === action.towerId);
                if (!sellTower) break;
                const towerSellValue = Math.floor(TOWER_TYPES[sellTower.type].cost * SELL_VALUE_FACTOR * sellTower.level);
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
                player.totalAbilitiesUsed++;
                this.totalAbilitiesUsed++;
                this.executeAbility(player, abilityName, action.targetX, action.targetY, action.targetId);
                break;

            case 'endBuild':
                if (this.phase !== 'build') break;
                this.startDefensePhase();
                break;

            case 'buyAmmo':
                if (this.phase !== 'defense') break;
                if (player.coins < AMMO_BUY_COST) break;
                player.coins -= AMMO_BUY_COST;
                player.ammo = Math.min(player.maxAmmo, player.ammo + AMMO_BUY_AMOUNT);
                this.totalAmmoBought++;
                this.broadcastRoomState();
                break;

            case 'revive':
                if (player.roleKey !== 'MEDIC') break;
                const deadPlayer = this.players.get(action.targetId);
                if (!deadPlayer || !deadPlayer.isDead) break;
                if (distance(player.x, player.y, deadPlayer.x, deadPlayer.y) > HEAL_RANGE) break;
                if (player.coins < REVIVE_COST) break;

                player.coins -= REVIVE_COST;
                deadPlayer.isDead = false;
                deadPlayer.hp = Math.floor(deadPlayer.maxHp * REVIVE_HP_FACTOR);
                deadPlayer.x = player.x;
                deadPlayer.y = player.y;
                deadPlayer.totalDeaths = Math.max(0, (deadPlayer.totalDeaths || 0) - 1);
                this.totalRevives++;
                this.broadcastChat(`${player.role.icon} ${player.name} возродил ${deadPlayer.name}!`);
                this.broadcastRoomState();
                break;

            case 'rearrange':
                if (this.phase !== 'defense') break;
                const rTarget = this.players.get(action.targetId);
                if (!rTarget || rTarget.isDead) break;
                if (distance(player.x, player.y, rTarget.x, rTarget.y) > REARRANGE_RANGE) break;
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
                if (player.coins < BUILD_WALL_ABILITY_COST) break;
                player.coins -= BUILD_WALL_ABILITY_COST;
                this.walls.push({
                    id: ++this.wallIdCounter,
                    x: player.x + player.direction.x * 40,
                    y: player.y + player.direction.y * 40,
                    type: 'wood', hp: BUILD_WALL_ABILITY_HP, maxHp: BUILD_WALL_ABILITY_HP,
                    icon: '🪵', color: '#8B4513', size: BUILD_WALL_ABILITY_SIZE,
                    reflectDamage: 0, damageBack: 0, armor: 0, lastRepair: 0
                });
                this.totalWallsBuilt++;
                this.broadcastRoomState();
                break;

            case 'build_tower':
                if (player.coins < BUILD_TOWER_ABILITY_COST) break;
                player.coins -= BUILD_TOWER_ABILITY_COST;
                this.towers.push({
                    id: ++this.towerIdCounter,
                    x: player.x + player.direction.x * 50,
                    y: player.y + player.direction.y * 50,
                    type: 'arrow', hp: BUILD_TOWER_ABILITY_HP, maxHp: BUILD_TOWER_ABILITY_HP,
                    damage: BUILD_TOWER_ABILITY_DAMAGE, range: BUILD_TOWER_ABILITY_RANGE,
                    fireRate: BUILD_TOWER_ABILITY_FIRE_RATE,
                    icon: '🏹', color: '#8B4513', size: BUILD_TOWER_ABILITY_SIZE,
                    level: 1, splash: 0, slow: 0, burn: false,
                    healRate: 0, projectileColor: '#8B4513', projectileSize: 3,
                    isMagic: false, targetPriority: 'closest', canTargetFlying: true,
                    lastFired: 0, reloading: false,
                    totalShotsFired: 0, totalDamageDealt: 0, totalHealingDone: 0, kills: 0
                });
                this.totalTowersBuilt++;
                this.broadcastRoomState();
                break;

            case 'repair':
                for (const w of this.walls) {
                    if (distance(player.x, player.y, w.x, w.y) < REPAIR_ABILITY_RANGE) {
                        w.hp = Math.min(w.maxHp, w.hp + REPAIR_ABILITY_HP);
                    }
                }
                this.broadcastRoomState();
                break;

            case 'build_trap':
                if (player.coins < BUILD_TRAP_ABILITY_COST) break;
                player.coins -= BUILD_TRAP_ABILITY_COST;
                this.traps.push({
                    id: ++this.trapIdCounter,
                    x: player.x + player.direction.x * 30,
                    y: player.y + player.direction.y * 30,
                    type: 'spike', damage: BUILD_TRAP_ABILITY_DAMAGE, slow: 0, duration: 0,
                    radius: BUILD_TRAP_ABILITY_RADIUS, uses: BUILD_TRAP_ABILITY_USES,
                    maxUses: BUILD_TRAP_ABILITY_USES,
                    icon: '📍', color: '#808080', teleportRadius: 0,
                    placedBy: player.id, totalTriggers: 0, totalDamageDealt: 0
                });
                this.totalTrapsBuilt++;
                this.broadcastRoomState();
                break;

            case 'double_shot':
                if (player.ammo < DOUBLE_SHOT_AMMO) break;
                player.ammo -= DOUBLE_SHOT_AMMO;
                player.totalAmmoUsed += DOUBLE_SHOT_AMMO;
                this.createProjectile(player, tx, ty, '#ff6600', DOUBLE_SHOT_DAMAGE * player.damageMod, false, 0);
                this.createProjectile(player,
                    tx + (Math.random() - 0.5) * DOUBLE_SHOT_SPREAD,
                    ty + (Math.random() - 0.5) * DOUBLE_SHOT_SPREAD,
                    '#ff6600', DOUBLE_SHOT_DAMAGE * player.damageMod, false, 0);
                break;

            case 'snipe':
                if (player.ammo < SNIPE_AMMO) break;
                player.ammo -= SNIPE_AMMO;
                player.totalAmmoUsed += SNIPE_AMMO;
                this.createProjectile(player, tx, ty, '#ff0000', SNIPE_DAMAGE * player.damageMod, false, 0);
                break;

            case 'rain_arrows':
                if (player.ammo < RAIN_ARROWS_AMMO) break;
                player.ammo -= RAIN_ARROWS_AMMO;
                player.totalAmmoUsed += RAIN_ARROWS_AMMO;
                for (let i = 0; i < RAIN_ARROWS_COUNT; i++) {
                    setTimeout(() => {
                        const rx = tx + (Math.random() - 0.5) * RAIN_ARROWS_RADIUS;
                        const ry = ty + (Math.random() - 0.5) * RAIN_ARROWS_RADIUS;
                        this.createProjectile(player, rx, ry, '#cc6600', RAIN_ARROWS_DAMAGE * player.damageMod, false, 0);
                    }, i * RAIN_ARROWS_DELAY);
                }
                break;

            case 'poison_arrow':
                if (player.ammo < POISON_ARROW_AMMO) break;
                player.ammo -= POISON_ARROW_AMMO;
                player.totalAmmoUsed += POISON_ARROW_AMMO;
                const poisonProj = this.createProjectile(player, tx, ty, '#00ff00', POISON_ARROW_DAMAGE * player.damageMod, false, 0);
                if (poisonProj) poisonProj.applyPoison = true;
                break;

            case 'upgrade_turret':
                for (const t of this.towers) {
                    if (distance(player.x, player.y, t.x, t.y) < UPGRADE_TURRET_RANGE) {
                        t.damage = Math.floor(t.damage * UPGRADE_TURRET_DAMAGE_MULT);
                        t.range += UPGRADE_TURRET_RANGE_BONUS;
                    }
                }
                this.broadcastRoomState();
                break;

            case 'deploy_shield':
                for (const p of this.players.values()) {
                    if (distance(player.x, player.y, p.x, p.y) < DEPLOY_SHIELD_RANGE) {
                        p.shield = DEPLOY_SHIELD_AMOUNT;
                    }
                }
                this.broadcastRoomState();
                break;

            case 'repair_all':
                if (player.coins < REPAIR_ALL_COST) break;
                player.coins -= REPAIR_ALL_COST;
                for (const w of this.walls) w.hp = w.maxHp;
                for (const t of this.towers) t.hp = t.maxHp;
                this.broadcastRoomState();
                break;

            case 'emp':
                for (const m of this.mobs) {
                    if (distance(player.x, player.y, m.x, m.y) < EMP_RANGE) {
                        applyStatusEffect(m, 'slow', EMP_SLOW_DURATION, { slowFactor: 0.5 });
                        applyStatusEffect(m, 'stun', EMP_STUN_DURATION);
                    }
                }
                break;

            case 'heal':
                if (player.coins < HEAL_COST) break;
                player.coins -= HEAL_COST;
                let healAmount = HEAL_AMOUNT;
                for (const p of this.players.values()) {
                    if (distance(player.x, player.y, p.x, p.y) < HEAL_RANGE && !p.isDead) {
                        const heal = Math.floor(healAmount * (player.roleKey === 'MEDIC' ? 1.5 : 1));
                        p.hp = Math.min(p.maxHp, p.hp + heal);
                        this.totalHealingDone += heal;
                        p.totalHealingReceived += heal;
                    }
                }
                this.broadcastRoomState();
                break;

            case 'heal_aoe':
                if (player.coins < HEAL_AOE_COST) break;
                player.coins -= HEAL_AOE_COST;
                for (const p of this.players.values()) {
                    if (distance(player.x, player.y, p.x, p.y) < HEAL_AOE_RANGE && !p.isDead) {
                        const heal = Math.floor(HEAL_AOE_AMOUNT * (player.roleKey === 'MEDIC' ? 1.5 : 1));
                        p.hp = Math.min(p.maxHp, p.hp + heal);
                        this.totalHealingDone += heal;
                        p.totalHealingReceived += heal;
                    }
                }
                this.broadcastRoomState();
                break;

            case 'revive':
                break;

            case 'shield':
                if (player.coins < SHIELD_COST) break;
                player.coins -= SHIELD_COST;
                for (const p of this.players.values()) {
                    if (distance(player.x, player.y, p.x, p.y) < DEPLOY_SHIELD_RANGE) {
                        p.shield = SHIELD_AMOUNT;
                    }
                }
                this.broadcastRoomState();
                break;

            case 'fireball':
                if (player.ammo < FIREBALL_AMMO) break;
                player.ammo -= FIREBALL_AMMO;
                player.totalAmmoUsed += FIREBALL_AMMO;
                this.createProjectile(player, tx, ty, '#ff4500', FIREBALL_DAMAGE * player.damageMod, true, FIREBALL_SPLASH);
                break;

            case 'ice_wall':
                if (player.coins < ICE_WALL_COST) break;
                player.coins -= ICE_WALL_COST;
                for (let i = 0; i < ICE_WALL_COUNT; i++) {
                    this.walls.push({
                        id: ++this.wallIdCounter,
                        x: player.x + player.direction.x * (30 + i * 30),
                        y: player.y + player.direction.y * (30 + i * 30),
                        type: 'magic_wall', hp: ICE_WALL_HP, maxHp: ICE_WALL_HP,
                        icon: '🧊', color: '#00CED1', size: 25,
                        reflectDamage: 0, damageBack: 0, armor: 2, lastRepair: 0
                    });
                }
                this.totalWallsBuilt += ICE_WALL_COUNT;
                this.broadcastRoomState();
                break;

            case 'lightning':
                if (player.ammo < LIGHTNING_AMMO) break;
                player.ammo -= LIGHTNING_AMMO;
                player.totalAmmoUsed += LIGHTNING_AMMO;
                for (const m of this.mobs) {
                    if (distance(tx, ty, m.x, m.y) < LIGHTNING_RADIUS) {
                        m.hp -= LIGHTNING_DAMAGE;
                        applyStatusEffect(m, 'stun', LIGHTNING_STUN);
                    }
                }
                this.cleanMobs();
                this.broadcastRoomState();
                break;

            case 'meteor':
                if (player.ammo < METEOR_AMMO) break;
                player.ammo -= METEOR_AMMO;
                player.totalAmmoUsed += METEOR_AMMO;
                setTimeout(() => {
                    for (const m of this.mobs) {
                        if (distance(tx, ty, m.x, m.y) < METEOR_RADIUS) {
                            m.hp -= METEOR_DAMAGE;
                        }
                    }
                    io.to(this.id).emit('explosion', { x: tx, y: ty, radius: METEOR_RADIUS, color: '#ff4500' });
                    this.cleanMobs();
                    this.broadcastRoomState();
                }, METEOR_DELAY);
                break;

            case 'speed_boost':
                applyStatusEffect(player, 'speed', SPEED_BOOST_DURATION);
                for (const p of this.players.values()) {
                    if (distance(player.x, player.y, p.x, p.y) < SPEED_BOOST_RANGE) {
                        applyStatusEffect(p, 'speed', SPEED_BOOST_DURATION);
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
                }, TRAP_DETECT_DURATION);
                break;

            case 'mark_enemy':
                for (const m of this.mobs) {
                    if (distance(tx, ty, m.x, m.y) < MARK_RANGE) {
                        applyStatusEffect(m, 'marked', MARK_DURATION);
                        m.marked = true;
                    }
                }
                break;

            case 'stealth':
                applyStatusEffect(player, 'stealth', STEALTH_DURATION);
                break;
        }
    }

    createProjectile(player, tx, ty, color, damage, isMagic, splashRadius) {
        const speed = isMagic ? MAGIC_PROJECTILE_SPEED : PROJECTILE_SPEED;
        const angle = Math.atan2(ty - player.y, tx - player.x);

        const proj = {
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
            traveled: 0,
            applyPoison: false
        };

        this.projectiles.push(proj);
        return proj;
    }

    cleanMobs() {
        for (let i = this.mobs.length - 1; i >= 0; i--) {
            if (this.mobs[i].hp <= 0) {
                const mob = this.mobs[i];
                processMobDeath(mob, this, Date.now());
                this.mobs.splice(i, 1);
            }
        }
    }

    updateProjectiles() {
        const now = Date.now();
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const proj = this.projectiles[i];
            proj.x += Math.cos(proj.angle) * proj.speed;
            proj.y += Math.sin(proj.angle) * proj.speed;
            proj.traveled += proj.speed;

            if (proj.traveled > MAX_PROJECTILE_RANGE ||
                proj.x < -PROJECTILE_CLEANUP_MARGIN || proj.x > MAP_WIDTH + PROJECTILE_CLEANUP_MARGIN ||
                proj.y < -PROJECTILE_CLEANUP_MARGIN || proj.y > MAP_HEIGHT + PROJECTILE_CLEANUP_MARGIN) {
                this.projectiles.splice(i, 1);
                continue;
            }

            for (let j = this.mobs.length - 1; j >= 0; j--) {
                const mob = this.mobs[j];
                if (distance(proj.x, proj.y, mob.x, mob.y) < mob.size + proj.size) {
                    let finalDamage = proj.damage;
                    const shooter = this.players.get(proj.ownerId);

                    if (mob.marked) finalDamage = Math.floor(finalDamage * MARK_DAMAGE_MULT);

                    const attacker = shooter || { critChance: 0, critMult: 1 };
                    finalDamage = calculateDamage(finalDamage, attacker, mob, proj.isMagic);

                    if (proj.splash > 0) {
                        const affected = calculateSplashDamage(proj.x, proj.y, proj.splash, finalDamage, this.mobs);
                        for (const { target, damage: splashDmg } of affected) {
                            target.hp -= splashDmg;
                        }
                        io.to(this.id).emit('explosion', {
                            x: proj.x, y: proj.y,
                            radius: proj.splash, color: proj.color
                        });
                    } else {
                        mob.hp -= finalDamage;
                    }

                    if (shooter) {
                        shooter.damageDealt += finalDamage;
                        shooter.totalDamageDealt += finalDamage;
                        this.totalDamageToMobs += finalDamage;
                    }

                    if (proj.applyPoison) {
                        applyStatusEffect(mob, 'poison', POISON_DURATION, { damage: POISON_TICK_DAMAGE });
                    }

                    if (proj.color === '#00CED1') {
                        applyStatusEffect(mob, 'slow', 2000, { slowFactor: 0.5 });
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
                        if (distance(tower.x, tower.y, p.x, p.y) < tower.range && !p.isDead) {
                            const heal = tower.healRate * tower.level;
                            p.hp = Math.min(p.maxHp, p.hp + heal);
                            tower.totalHealingDone += heal;
                            this.totalHealingDone += heal;
                        }
                    }
                    for (const w of this.walls) {
                        if (distance(tower.x, tower.y, w.x, w.y) < tower.range) {
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
                if (!tower.canTargetFlying && mob.isFlying) continue;
                const dist = distance(tower.x, tower.y, mob.x, mob.y);
                if (dist < closestDist) {
                    closestDist = dist;
                    closestMob = mob;
                }
            }

            if (closestMob) {
                tower.lastFired = now;
                tower.reloading = true;
                tower.totalShotsFired++;
                setTimeout(() => tower.reloading = false, tower.fireRate * engineerBoost);

                const damage = tower.damage * tower.level;

                if (tower.splash > 0) {
                    const affected = calculateSplashDamage(closestMob.x, closestMob.y, tower.splash, damage, this.mobs);
                    for (const { target, damage: splashDmg } of affected) {
                        target.hp -= splashDmg;
                    }
                    io.to(this.id).emit('explosion', {
                        x: closestMob.x, y: closestMob.y,
                        radius: tower.splash, color: tower.color
                    });
                } else {
                    closestMob.hp -= damage;
                }

                tower.totalDamageDealt += damage;
                this.totalDamageToMobs += damage;

                executeTowerSpecialEffect(tower, closestMob, this, now);

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

            cleanStatusEffects(mob);

            if (isStunned(mob.statusEffects)) continue;

            if (hasStatusEffect(mob, 'poison')) {
                const poison = getStatusEffect(mob, 'poison');
                if (poison && now % 1000 < TICK_RATE) {
                    mob.hp -= poison.damage;
                }
            }

            if (hasStatusEffect(mob, 'burn')) {
                const burn = getStatusEffect(mob, 'burn');
                if (burn && now % 1000 < TICK_RATE) {
                    mob.hp -= burn.damage;
                }
            }

            if (mob.specialAbility === 'regenerate' && now % 2000 < TICK_RATE) {
                mob.hp = Math.min(mob.maxHp, mob.hp + 3);
            }

            if (mob.isBoss && mob.abilities && mob.abilities.length > 0) {
                const hpPercent = mob.hp / mob.maxHp;
                if (mob.phaseThresholds) {
                    for (let p = 0; p < mob.phaseThresholds.length; p++) {
                        if (hpPercent <= mob.phaseThresholds[p] && mob.bossPhase <= p + 1) {
                            mob.bossPhase = p + 2;
                            executeBossAbility(mob, this, now);
                            break;
                        }
                    }
                }
                if (now - (mob.lastSpecialAbility || 0) > 5000) {
                    mob.lastSpecialAbility = now;
                    if (Math.random() < 0.3) {
                        executeBossAbility(mob, this, now);
                    }
                }
            }

            let target;
            switch (mob.behavior) {
                case 'swarm':
                    target = findSwarmTarget(mob, this.mobs, this.players, CENTER_X, CENTER_Y);
                    break;
                case 'tank':
                    target = findTankTarget(mob, this.players, CENTER_X, CENTER_Y);
                    break;
                case 'ranged':
                    target = calculatePathToFortress(mob, this.walls, this.players, CENTER_X, CENTER_Y);
                    break;
                case 'boss':
                    target = findBossTarget(mob, this.players, this.towers, CENTER_X, CENTER_Y);
                    break;
                default:
                    target = { x: CENTER_X, y: CENTER_Y };
            }

            const speedMod = calculateSpeedWithEffects(1, mob.statusEffects);
            const actualSpeed = mob.speed * speedMod * (this.difficulty * 0.2 + 0.8);

            if (mob.behavior !== 'ranged' || distance(mob.x, mob.y, CENTER_X, CENTER_Y) > mob.attackRange) {
                const newPos = moveTowards(mob.x, mob.y, target.x, target.y, actualSpeed);
                mob.x = newPos.x;
                mob.y = newPos.y;
            }

            for (let j = this.walls.length - 1; j >= 0; j--) {
                const wall = this.walls[j];
                if (distance(mob.x, mob.y, wall.x, wall.y) < (mob.size + wall.size) / 2) {
                    const wallDmg = Math.max(1, mob.damage - (wall.armor || 0));
                    wall.hp -= wallDmg;
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
                if (distance(mob.x, mob.y, trap.x, trap.y) < trap.radius) {
                    executeTrapEffect(trap, mob, this, now);
                    trap.totalTriggers++;
                    if (trap.damage > 0) trap.totalDamageDealt += trap.damage;
                    if (trap.uses <= 0) this.traps.splice(j, 1);
                    break;
                }
            }

            if (distance(mob.x, mob.y, CENTER_X, CENTER_Y) < FORTRESS_RADIUS + mob.size) {
                this.fortressHP -= mob.damage;
                this.totalDamageToFortress += mob.damage;
                this.mobs.splice(i, 1);
                io.to(this.id).emit('fortressHit', {
                    hp: this.fortressHP,
                    maxHp: this.fortressMaxHP
                });
                continue;
            }

            if (mob.behavior === 'ranged' && distance(mob.x, mob.y, CENTER_X, CENTER_Y) < mob.attackRange) {
                if (!mob.lastAttack || now - mob.lastAttack > mob.attackCooldown) {
                    mob.lastAttack = now;
                    let closestPlayer = null;
                    let closestDist = Infinity;
                    for (const [, player] of this.players) {
                        if (player.isDead) continue;
                        const dist = distance(mob.x, mob.y, player.x, player.y);
                        if (dist < closestDist) {
                            closestDist = dist;
                            closestPlayer = player;
                        }
                    }
                    if (closestPlayer && closestDist < mob.attackRange) {
                        closestPlayer.hp -= mob.damage;
                        closestPlayer.totalDamageTaken += mob.damage;
                        if (closestPlayer.hp <= 0) {
                            processPlayerDeath(closestPlayer, this, now);
                        }
                    }
                }
            }

            for (const [, player] of this.players) {
                if (player.isDead) continue;
                if (distance(mob.x, mob.y, player.x, player.y) < mob.size + MOB_PLAYER_COLLISION_SIZE) {
                    let playerDamage = mob.damage;
                    if (player.shield > 0) {
                        const absorbed = Math.min(player.shield, playerDamage);
                        player.shield -= absorbed;
                        playerDamage -= absorbed;
                    }
                    player.hp -= playerDamage;
                    player.totalDamageTaken += playerDamage;

                    if (player.hp <= 0) {
                        processPlayerDeath(player, this, now);
                    }
                }
            }

            executeMobSpecialAbility(mob, this, now);

            if (mob.hp <= 0) {
                this.mobs.splice(i, 1);
            }
        }
    }

    updateStatusEffects() {
        const now = Date.now();
        for (const [, player] of this.players) {
            cleanStatusEffects(player);
        }
    }

    startBuildPhase() {
        this.phase = 'build';
        this.wave = 0;
        this.fortressHP = this.fortressMaxHP;
        this.difficulty = 1;
        this.comboMultiplier = 1;
        this.gameStartTime = Date.now();

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
            player.statusEffects = [];
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

        const baseCount = WAVE_BASE_MOBS + this.wave * WAVE_MOBS_PER_LEVEL;
        this.waveMobsTotal = baseCount;

        const availableTypes = [];
        for (const [key, type] of Object.entries(MOB_TYPES)) {
            if (type.isBoss) continue;
            if (this.wave >= type.minWave) {
                availableTypes.push(key);
            }
        }

        const spawnWeights = availableTypes.map(key => MOB_TYPES[key].spawnWeight);

        for (let i = 0; i < baseCount; i++) {
            const typeKey = weightedRandom(availableTypes, spawnWeights);
            const type = MOB_TYPES[typeKey];
            const spawnPos = generateSpawnPosition(MAP_WIDTH, MAP_HEIGHT, CENTER_X, CENTER_Y, FORTRESS_RADIUS);

            const hpMod = 1 + (this.wave - 1) * MOB_HP_SCALE_PER_WAVE;
            const dmgMod = 1 + (this.wave - 1) * MOB_DAMAGE_SCALE_PER_WAVE;

            this.mobs.push({
                id: ++this.mobIdCounter,
                x: spawnPos.x,
                y: spawnPos.y,
                hp: Math.floor(type.hp * hpMod),
                maxHp: Math.floor(type.hp * hpMod),
                speed: type.speed,
                damage: Math.floor(type.damage * dmgMod),
                reward: type.reward,
                xp: type.xp,
                icon: type.icon,
                color: type.color,
                size: type.size,
                name: type.name,
                behavior: type.behavior,
                isBoss: type.isBoss || false,
                statusEffects: [],
                marked: false,
                lastAttack: 0,
                attackCooldown: type.attackCooldown,
                aggroRange: type.aggroRange,
                attackRange: type.attackRange,
                armor: type.armor,
                magicResist: type.magicResist,
                evasion: type.evasion,
                isFlying: type.isFlying,
                specialAbility: type.specialAbility,
                abilities: [...(type.abilities || [])],
                bossPhase: 1,
                phaseThresholds: type.phaseThresholds || null,
                lastSpecialAbility: 0
            });
            this.totalMobsSpawned++;
        }

        if (this.wave % BOSS_WAVE_INTERVAL === 0) {
            const bossKey = this.wave === 5 ? 'dragon' : this.wave === 10 ? 'lich' : 'arch_demon';
            const boss = MOB_TYPES[bossKey];
            if (boss) {
                const hpMod = 1 + (this.wave - 1) * MOB_HP_SCALE_PER_WAVE;
                this.mobs.push({
                    id: ++this.mobIdCounter,
                    x: MAP_WIDTH / 2,
                    y: -50,
                    hp: Math.floor(boss.hp * hpMod),
                    maxHp: Math.floor(boss.hp * hpMod),
                    speed: boss.speed,
                    damage: Math.floor(boss.damage * (1 + (this.wave - 1) * MOB_DAMAGE_SCALE_PER_WAVE)),
                    reward: boss.reward,
                    xp: boss.xp,
                    icon: boss.icon,
                    color: boss.color,
                    size: boss.size,
                    name: boss.name,
                    behavior: boss.behavior,
                    isBoss: true,
                    statusEffects: [],
                    marked: false,
                    lastAttack: 0,
                    attackCooldown: boss.attackCooldown,
                    aggroRange: boss.aggroRange,
                    attackRange: boss.attackRange,
                    armor: boss.armor,
                    magicResist: boss.magicResist,
                    evasion: boss.evasion,
                    isFlying: boss.isFlying,
                    specialAbility: boss.specialAbility,
                    abilities: [...(boss.abilities || [])],
                    bossPhase: 1,
                    phaseThresholds: boss.phaseThresholds,
                    lastSpecialAbility: 0
                });
                this.waveMobsTotal++;
                this.bossActive = true;
                io.to(this.id).emit('bossSpawn', { name: boss.name, icon: boss.icon });
                this.broadcastChat(`⚠️ ${boss.icon} ${boss.name} появился!`);
            }
        }

        this.maxMobsReached = Math.max(this.maxMobsReached, this.mobs.length);
    }

    startGameLoop() {
        this.gameLoop = setInterval(() => {
            const tickStart = Date.now();

            this.updateProjectiles();
            this.updateTowers();
            this.updateMobs();
            this.updateStatusEffects();

            if (this.mobs.length === 0 && this.waveMobsKilled >= this.waveMobsTotal) {
                this.bossActive = false;
                this.wavesCompleted++;

                const waveTime = Date.now() - (this.lastWaveStartTime || Date.now());
                this.totalWaveTime += waveTime;
                this.longestWave = Math.max(this.longestWave, waveTime);
                if (waveTime > 0 && waveTime < this.shortestWave) this.shortestWave = waveTime;
                this.averageWaveTime = this.totalWaveTime / this.wavesCompleted;

                this.wave++;

                if (this.wave > MAX_WAVES) {
                    this.endGame(true);
                    return;
                }

                const bonusCoins = COIN_BONUS_BASE + this.wave * COIN_BONUS_PER_WAVE;
                for (const [, player] of this.players) {
                    player.coins += bonusCoins;
                    player.ammo = Math.min(player.maxAmmo, player.ammo + AMMO_BONUS_PER_WAVE);
                    player.hp = Math.min(player.maxHp, player.hp + HP_BONUS_PER_WAVE);
                }

                this.difficulty += DIFFICULTY_SCALE_PER_WAVE;
                this.lastWaveStartTime = Date.now();
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

            const tickTime = Date.now() - tickStart;
            this.tickCount++;
            this.averageTickTime = ((this.tickCount - 1) * this.averageTickTime + tickTime) / this.tickCount;
            this.lastTickTime = Date.now();
        }, TICK_RATE);
    }

    endGame(won) {
        clearInterval(this.gameLoop);
        clearInterval(this.buildTimer);
        clearTimeout(this.waveTimer);
        clearTimeout(this.comboTimer);
        this.phase = 'ended';

        serverStats.totalGames++;
        serverStats.totalWavesCompleted += this.wavesCompleted;
        serverStats.highestWave = Math.max(serverStats.highestWave, this.wave - 1);

        const gameDuration = Date.now() - this.gameStartTime;

        const results = [];
        for (const [, player] of this.players) {
            results.push({
                name: player.name,
                role: player.role.name,
                roleIcon: player.role.icon,
                kills: player.kills,
                damage: player.damageDealt,
                score: player.score,
                level: player.level,
                deaths: player.totalDeaths || 0,
                abilitiesUsed: player.totalAbilitiesUsed || 0,
                shotsFired: player.totalShotsFired || 0
            });

            if (STAT_TRACKING_ENABLED) {
                const stats = playerStats.get(player.id) || {
                    gamesPlayed: 0, totalKills: 0, totalScore: 0,
                    wins: 0, totalDeaths: 0, totalDamage: 0,
                    highestLevel: 1, longestGame: 0, totalGamesWon: 0
                };
                stats.gamesPlayed++;
                stats.totalKills += player.kills;
                stats.totalScore += player.score;
                stats.totalDamage += player.damageDealt;
                stats.totalDeaths += player.totalDeaths || 0;
                stats.highestLevel = Math.max(stats.highestLevel, player.level);
                stats.longestGame = Math.max(stats.longestGame, gameDuration);
                if (won) {
                    stats.wins++;
                    stats.totalGamesWon++;
                }
                playerStats.set(player.id, stats);
            }
        }

        results.sort((a, b) => b.score - a.score);

        if (won) serverStats.bossesKilled++;

        io.to(this.id).emit('gameEnd', {
            won,
            score: this.score,
            wave: this.wave,
            message: won
                ? `🏆 ПОБЕДА! Все ${MAX_WAVES} волн пройдены! Счёт: ${this.score}`
                : `💀 ПОРАЖЕНИЕ! Дошли до волны ${this.wave}. Счёт: ${this.score}`,
            results,
            totalKills: this.totalKills,
            duration: gameDuration,
            stats: {
                totalDamageToMobs: this.totalDamageToMobs,
                totalDamageToFortress: this.totalDamageToFortress,
                totalHealingDone: this.totalHealingDone,
                totalWallsBuilt: this.totalWallsBuilt,
                totalTowersBuilt: this.totalTowersBuilt,
                totalTrapsBuilt: this.totalTrapsBuilt,
                totalAbilitiesUsed: this.totalAbilitiesUsed,
                totalRevives: this.totalRevives,
                maxMobsReached: this.maxMobsReached,
                averageTickTime: this.averageTickTime.toFixed(2)
            }
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
        clearTimeout(this.waveTransitionTimer);
        rooms.delete(this.id);
    }
}

// ==================== ДОСТИЖЕНИЯ ====================
const ACHIEVEMENTS = {
    FIRST_BLOOD: { id: 'first_blood', name: 'Первая кровь', desc: 'Убить первого моба', icon: '🩸', reward: 50 },
    WAVE_5: { id: 'wave_5', name: 'На полпути', desc: 'Дойти до 5 волны', icon: '⚔️', reward: 100 },
    WAVE_10: { id: 'wave_10', name: 'Ветеран', desc: 'Дойти до 10 волны', icon: '🎖️', reward: 200 },
    WAVE_15: { id: 'wave_15', name: 'Легенда', desc: 'Пройти все 15 волн', icon: '👑', reward: 500 },
    DRAGON_SLAYER: { id: 'dragon_slayer', name: 'Драконоборец', desc: 'Убить Дракона', icon: '🐲', reward: 150 },
    LICH_SLAYER: { id: 'lich_slayer', name: 'Личубийца', desc: 'Убить Лича', icon: '☠️', reward: 250 },
    ARCHDEMON_SLAYER: { id: 'archdemon_slayer', name: 'Архидемоноборец', desc: 'Убить Архидемона', icon: '👿', reward: 500 },
    COMBO_5: { id: 'combo_5', name: 'Комбо-мастер', desc: 'Набрать комбо x5', icon: '🔥', reward: 75 },
    PERFECT_WAVE: { id: 'perfect_wave', name: 'Безупречная волна', desc: 'Пройти волну без потерь', icon: '✨', reward: 100 },
    SPEED_BUILD: { id: 'speed_build', name: 'Строитель-экспресс', desc: 'Построить 10 стен за фазу', icon: '🏗️', reward: 50 },
    TOWER_MASTER: { id: 'tower_master', name: 'Мастер башен', desc: 'Построить 5 башен', icon: '🗼', reward: 75 },
    TRAP_MASTER: { id: 'trap_master', name: 'Мастер ловушек', desc: 'Построить 5 ловушек', icon: '🪤', reward: 75 },
    HEALER: { id: 'healer', name: 'Спасатель', desc: 'Исходить 500 HP союзникам', icon: '💚', reward: 100 },
    REVIVER: { id: 'reviver', name: 'Воскреситель', desc: 'Воскресить 3 союзников', icon: ' resurrection', reward: 150 },
    UNSTOPPABLE: { id: 'unstoppable', name: 'Неудержимый', desc: 'Убить 50 мобов за игру', icon: '💀', reward: 200 },
    GODLIKE: { id: 'godlike', name: 'Божественный', desc: 'Убить 100 мобов за игру', icon: '⚡', reward: 400 },
    FORTRESS_DEFENDER: { id: 'fortress_defender', name: 'Защитник крепости', desc: 'Не дать крепости умереть 5 волн', icon: '🏰', reward: 100 },
    IRON_WALL: { id: 'iron_wall', name: 'Железная стена', desc: 'Построить железную стену', icon: '⛓️', reward: 25 },
    MAGIC_MASTER: { id: 'magic_master', name: 'Маг-виртуоз', desc: 'Использовать все заклинания', icon: '✨', reward: 150 },
    SURVIVOR: { id: 'survivor', name: 'Выживший', desc: 'Не умереть за всю игру', icon: '🛡️', reward: 200 },
    NARROW_ESCAPE: { id: 'narrow_escape', name: 'Побег с減)', desc: 'Выйти из боя с <10 HP', icon: '😱', reward: 50 },
    COLLECTION: { id: 'collection', name: 'Коллекционер', desc: 'Накопить 500 монет', icon: '💰', reward: 100 },
    XP_MACHINE: { id: 'xp_machine', name: 'Машина опыта', desc: 'Достичь 5 уровня', icon: '📈', reward: 75 },
    TEAMWORK: { id: 'teamwork', name: 'Командная работа', desc: 'Играть в команде из 6 человек', icon: '🤝', reward: 50 },
    SOLO_HERO: { id: 'solo_hero', name: 'Одинокий герой', desc: 'Пройти волну в одиночку', icon: '🏃', reward: 150 },
    BUILD_RANGE: { id: 'build_range', name: 'Дальний строитель', desc: 'Построить стену на краю карты', icon: '🗺️', reward: 25 },
    COMBO_KING: { id: 'combo_king', name: 'Король комбо', desc: 'Удерживать комбо 10 секунд', icon: '🔥', reward: 100 },
    BOSS_HUNTER: { id: 'boss_hunter', name: 'Охотник на боссов', desc: 'Убить 3 боссов за сессию', icon: '🎯', reward: 300 },
    FORTRESS_FULL_HP: { id: 'fortress_full_hp', name: 'Неприкосновенность', desc: 'Закончить игру с полным HP крепости', icon: '💎', reward: 500 },
    LIGHTNING_FAST: { id: 'lightning_fast', name: 'Молниеносный', desc: 'Пройти волну за <30 секунд', icon: '⚡', reward: 100 },
    HEALING_SPREE: { id: 'healing_spree', name: 'Целительский бум', desc: 'Исходить 100 HP за 5 секунд', icon: '💊', reward: 75 },
    WALL修复: { id: 'wall_repair', name: 'Мастер ремонта', desc: 'Починить 10 стен', icon: '🔧', reward: 50 },
    TRAP_EXPLOIT: { id: 'trap_exploit', name: 'Ловушка-ловушка', desc: 'Убить моба ловушкой', icon: '💣', reward: 25 },
    LAST_STAND: { id: 'last_stand', name: 'Последний рубеж', desc: 'Быть последним живым игроком', icon: '🗡️', reward: 100 },
    ARCHER_PERFECT: { id: 'archer_perfect', name: 'Стрелок-снайпер', desc: 'Попасть в 10 мобов подряд', icon: '🏹', reward: 75 },
    MAGE_STORM: { id: 'mage_storm', name: 'Магический шторм', desc: 'Убить 5 мобов одним заклинанием', icon: '🌩️', reward: 150 },
    ENGINEER_GENIUS: { id: 'engineer_genius', name: 'Гений-инженер', desc: 'Улучшить башню до максимума', icon: '⚙️', reward: 100 },
    SCOUT_VISION: { id: 'scout_vision', name: 'Ясновидение', desc: 'Обнаружить 10 ловушек', icon: '👁️', reward: 50 },
    BUILDER_SUPREME: { id: 'builder_supreme', name: 'Верховный строитель', desc: 'Построить 20 стен за игру', icon: '🔨', reward: 200 }
};

function checkAchievements(player, room) {
    const unlocked = [];
    const playerAchievements = player.achievements || [];

    if (!playerAchievements.includes('first_blood') && player.kills >= 1) {
        unlocked.push(ACHIEVEMENTS.FIRST_BLOOD);
    }
    if (!playerAchievements.includes('wave_5') && room.wave >= 5) {
        unlocked.push(ACHIEVEMENTS.WAVE_5);
    }
    if (!playerAchievements.includes('wave_10') && room.wave >= 10) {
        unlocked.push(ACHIEVEMENTS.WAVE_10);
    }
    if (!playerAchievements.includes('wave_15') && room.wave >= 15) {
        unlocked.push(ACHIEVEMENTS.WAVE_15);
    }
    if (!playerAchievements.includes('combo_5') && room.comboMultiplier >= 5) {
        unlocked.push(ACHIEVEMENTS.COMBO_5);
    }
    if (!playerAchievements.includes('unstoppable') && player.kills >= 50) {
        unlocked.push(ACHIEVEMENTS.UNSTOPPABLE);
    }
    if (!playerAchievements.includes('godlike') && player.kills >= 100) {
        unlocked.push(ACHIEVEMENTS.GODLIKE);
    }
    if (!playerAchievements.includes('xp_machine') && player.level >= 5) {
        unlocked.push(ACHIEVEMENTS.XP_MACHINE);
    }
    if (!playerAchievements.includes('collection') && player.coins >= 500) {
        unlocked.push(ACHIEVEMENTS.COLLECTION);
    }
    if (!playerAchievements.includes('survivor') && !player.isDead && room.wave > 3) {
        unlocked.push(ACHIEVEMENTS.SURVIVOR);
    }
    if (!playerAchievements.includes('narrow_escape') && player.hp > 0 && player.hp < 10) {
        unlocked.push(ACHIEVEMENTS.NARROW_ESCAPE);
    }
    if (!playerAchievements.includes('healer') && player.totalHealingReceived >= 500) {
        unlocked.push(ACHIEVEMENTS.HEALER);
    }
    if (!playerAchievements.includes('tower_master') && room.totalTowersBuilt >= 5) {
        unlocked.push(ACHIEVEMENTS.TOWER_MASTER);
    }
    if (!playerAchievements.includes('trap_master') && room.totalTrapsBuilt >= 5) {
        unlocked.push(ACHIEVEMENTS.TRAP_MASTER);
    }
    if (!playerAchievements.includes('builder_supreme') && room.totalWallsBuilt >= 20) {
        unlocked.push(ACHIEVEMENTS.BUILDER_SUPREME);
    }
    if (!playerAchievements.includes('engineer_genius') && room.towers.some(t => t.level >= 5)) {
        unlocked.push(ACHIEVEMENTS.ENGINEER_GENIUS);
    }

    for (const achievement of unlocked) {
        if (!player.achievements) player.achievements = [];
        player.achievements.push(achievement.id);
        player.coins += achievement.reward;
        room.broadcastChat(`${achievement.icon} ${player.name} получил достижение: ${achievement.name}! (+${achievement.reward}💰)`);
    }

    return unlocked;
}

// ==================== ЛИДЕРБОРД ====================
function getLeaderboard() {
    const entries = [];
    for (const [id, stats] of playerGlobalStats) {
        entries.push({
            id,
            gamesPlayed: stats.gamesPlayed,
            totalKills: stats.totalKills,
            totalScore: stats.totalScore,
            wins: stats.wins,
            winRate: stats.gamesPlayed > 0 ? ((stats.wins / stats.gamesPlayed) * 100).toFixed(1) : '0.0',
            highestLevel: stats.highestLevel,
            longestGame: stats.longestGame
        });
    }
    entries.sort((a, b) => b.totalScore - a.totalScore);
    return entries.slice(0, 50);
}

function getPlayerStats(playerId) {
    return playerGlobalStats.get(playerId) || null;
}

// ==================== СИСТЕМА КОМНАТ ====================
function getRoomList() {
    const list = [];
    for (const [id, room] of rooms) {
        list.push({
            id,
            players: room.players.size,
            maxPlayers: MAX_PLAYERS_PER_ROOM,
            phase: room.phase,
            wave: room.wave,
            score: room.score
        });
    }
    return list;
}

function findAvailableRoom() {
    for (const [id, room] of rooms) {
        if (room.players.size < MAX_PLAYERS_PER_ROOM && room.phase === 'waiting') {
            return id;
        }
    }
    return null;
}

function createRoom(id) {
    const roomId = id || generateRoomId();
    if (!rooms.has(roomId)) {
        rooms.set(roomId, new GameRoom(roomId));
    }
    return roomId;
}

function getRoomInfo(roomId) {
    const room = rooms.get(roomId);
    if (!room) return null;
    return {
        id: room.id,
        players: room.players.size,
        maxPlayers: MAX_PLAYERS_PER_ROOM,
        phase: room.phase,
        wave: room.wave,
        score: room.score,
        fortressHP: room.fortressHP,
        fortressMaxHP: room.fortressMaxHP,
        difficulty: room.difficulty,
        createdAt: room.createdAt,
        uptime: Date.now() - room.createdAt
    };
}

// ==================== ЧАТ-КОМАНДЫ ====================
function handleChatCommand(player, room, message) {
    if (!message.startsWith('/')) return false;

    const parts = message.split(' ');
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    switch (command) {
        case '/help':
            room.broadcastChat('📜 Команды: /help, /stats, /leaderboard, /room, /players, /wave, /score, /time');
            return true;

        case '/stats':
            const stats = getPlayerStats(player.id);
            if (stats) {
                room.broadcastChat(`📊 ${player.name}: игр ${stats.gamesPlayed}, убийств ${stats.totalKills}, очков ${stats.totalScore}, побед ${stats.wins}`);
            } else {
                room.broadcastChat(`📊 ${player.name}: нет статистики`);
            }
            return true;

        case '/leaderboard':
            const lb = getLeaderboard();
            const top5 = lb.slice(0, 5);
            top5.forEach((entry, i) => {
                room.broadcastChat(`🏆 #${i + 1}: ${entry.id} - ${entry.totalScore} очков (${entry.totalKills} убийств)`);
            });
            return true;

        case '/room':
            const info = getRoomInfo(room.id);
            if (info) {
                room.broadcastChat(`🏠 Комната ${info.id}: ${info.players}/${info.maxPlayers} | Фаза: ${info.phase} | Волна: ${info.wave} | Счёт: ${info.score}`);
            }
            return true;

        case '/players':
            for (const [, p] of room.players) {
                const r = ROLES[p.roleKey] || {};
                room.broadcastChat(`${r.icon || '👤'} ${p.name} (${r.name || p.role}) - HP:${p.hp}/${p.maxHp} 💰${p.coins} 🔫${p.ammo} ур.${p.level}`);
            }
            return true;

        case '/wave':
            room.broadcastChat(`⚔️ Волна ${room.wave}/${MAX_WAVES} | Мобов: ${room.mobs.length} | Убито: ${room.waveMobsKilled}/${room.waveMobsTotal}`);
            return true;

        case '/score':
            room.broadcastChat(`⭐ Счёт: ${room.score} | Комбо: x${room.comboMultiplier.toFixed(1)} | Сложность: ${room.difficulty.toFixed(1)}`);
            return true;

        case '/time':
            const elapsed = Date.now() - room.createdAt;
            const mins = Math.floor(elapsed / 60000);
            const secs = Math.floor((elapsed % 60000) / 1000);
            room.broadcastChat(`⏱️ Время в игре: ${mins}м ${secs}с`);
            return true;

        case '/hp':
            room.broadcastChat(`🏰 Крепость: ${room.fortressHP}/${room.fortressMaxHP}`);
            return true;

        case '/kills':
            room.broadcastChat(`💀 Всего убито: ${room.totalKills} | Волна: ${room.waveMobsKilled}/${room.waveMobsTotal}`);
            return true;

        case '/damage':
            room.broadcastChat(`🗡️ Всего урона: ${room.totalDamageToMobs} | Крепость получила: ${room.totalDamageToFortress}`);
            return true;

        case '/healing':
            room.broadcastChat(`💚 Всего исцелено: ${room.totalHealingDone}`);
            return true;

        case '/building':
            room.broadcastChat(`🏗️ Стен: ${room.totalWallsBuilt} | Башен: ${room.totalTowersBuilt} | Ловушек: ${room.totalTrapsBuilt}`);
            return true;

        case '/abilities':
            room.broadcastChat(`⚡ Способностей использовано: ${room.totalAbilitiesUsed}`);
            return true;

        case '/revives':
            room.broadcastChat(` resurrection Воскрешений: ${room.totalRevives}`);
            return true;

        case '/boss':
            room.broadcastChat(`🐲 Босс активен: ${room.bossActive ? 'Да' : 'Нет'}`);
            return true;

        case '/combo':
            room.broadcastChat(`🔥 Комбо: x${room.comboMultiplier.toFixed(1)}`);
            return true;

        case '/difficulty':
            room.broadcastChat(`📈 Сложность: ${room.difficulty.toFixed(1)}`);
            return true;

        case '/mobs':
            const mobCounts = {};
            for (const mob of room.mobs) {
                mobCounts[mob.name] = (mobCounts[mob.name] || 0) + 1;
            }
            const mobList = Object.entries(mobCounts).map(([name, count]) => `${name}:${count}`).join(', ');
            room.broadcastChat(`👹 Мобы: ${mobList || 'нет'}`);
            return true;

        case '/towers':
            const towerCounts = {};
            for (const tower of room.towers) {
                const tName = TOWER_TYPES[tower.type]?.name || tower.type;
                towerCounts[tName] = (towerCounts[tName] || 0) + 1;
            }
            const towerList = Object.entries(towerCounts).map(([name, count]) => `${name}:${count}`).join(', ');
            room.broadcastChat(`🗼 Башни: ${towerList || 'нет'}`);
            return true;

        case '/walls':
            const wallCounts = {};
            for (const wall of room.walls) {
                const wName = WALL_TYPES[wall.type]?.name || wall.type;
                wallCounts[wName] = (wallCounts[wName] || 0) + 1;
            }
            const wallList = Object.entries(wallCounts).map(([name, count]) => `${name}:${count}`).join(', ');
            room.broadcastChat(`🧱 Стены: ${wallList || 'нет'}`);
            return true;

        case '/traps':
            const trapCounts = {};
            for (const trap of room.traps) {
                const tName = TRAP_TYPES[trap.type]?.name || trap.type;
                trapCounts[tName] = (trapCounts[tName] || 0) + 1;
            }
            const trapList = Object.entries(trapCounts).map(([name, count]) => `${name}:${count}`).join(', ');
            room.broadcastChat(`📍 Ловушки: ${trapList || 'нет'}`);
            return true;

        case '/projectiles':
            room.broadcastChat(`🔹 Снарядов: ${room.projectiles.length}`);
            return true;

        case '/ping':
            room.broadcastChat(`🏓 Pong!`);
            return true;

        case '/hello':
            room.broadcastChat(`👋 Привет, ${player.name}!`);
            return true;

        case '/joke':
            const jokes = [
                'Почему программист носит очки? Потому что не видит C++!',
                'Два байта встретились. Один спрашивает: "Ты в порядке?" Второй: "Нет, у меня переполнение!"',
                'Программист это тот, кто решает проблему, о которой ты не знал, способом, который ты не понимаешь.',
                'В мире есть 10 типов людей: те, кто понимает двоичную систему, и те, кто не понимает.',
                'Хороший программист - тот, у которого всегда есть что показать в продакшн.',
                'Я не.writer, я пишу код. Код пишет меня.',
                'Баги - это не ошибки, это фичи!'
            ];
            room.broadcastChat(`😂 ${randomChoice(jokes)}`);
            return true;

        case '/dance':
            room.broadcastChat(`💃 ${player.name} танцует! 🕺`);
            return true;

        case '/shout':
            if (args.length > 0) {
                room.broadcastChat(`📢 ${player.name} КРИЧИТ: ${args.join(' ').toUpperCase()}!`);
            }
            return true;

        case '/whisper':
            if (args.length >= 2) {
                const targetName = args[0];
                const whisperMsg = args.slice(1).join(' ');
                let targetPlayer = null;
                for (const [, p] of room.players) {
                    if (p.name.toLowerCase() === targetName.toLowerCase()) {
                        targetPlayer = p;
                        break;
                    }
                }
                if (targetPlayer) {
                    io.to(targetPlayer.id).emit('chat', {
                        text: `🤫 ${player.name}: ${whisperMsg}`,
                        time: Date.now()
                    });
                } else {
                    room.broadcastChat(`❌ Игрок ${targetName} не найден`);
                }
            }
            return true;

        case '/vote':
            room.broadcastChat(`🗳️ ${player.name} предлагает голосование! Голосуйте за следующую фазу!`);
            return true;

        case '/ready':
            const readyCount = Array.from(room.players.values()).filter(p => p.ready).length;
            room.broadcastChat(`✅ Готовы: ${readyCount}/${room.players.size}`);
            return true;

        case '/class':
            const r = ROLES[player.roleKey] || {};
            room.broadcastChat(`👤 ${player.name}: ${r.icon || '?'} ${r.name || player.role} | HP:${player.hp}/${player.maxHp} | DMG:${(player.damageMod * 100).toFixed(0)}% | SPD:${(player.speed / PLAYER_BASE_SPEED * 100).toFixed(0)}%`);
            return true;

        case '/ability':
            if (args.length > 0) {
                const abilityName = args[0];
                if (player.abilities[abilityName]) {
                    const cooldown = Math.max(0, (player.abilityCooldowns[abilityName] || 0) - Date.now());
                    room.broadcastChat(`⚡ ${abilityName}: ${cooldown > 0 ? (cooldown / 1000).toFixed(1) + 'с КД' : 'Готово'}`);
                } else {
                    room.broadcastChat(`❌ Способность ${abilityName} не найдена`);
                }
            }
            return true;

        default:
            return false;
    }
}

// ==================== РАСШИРЕННАЯ ЛОГИКА МОБОВ ====================
function calculateMobPath(mob, targetX, targetY, walls, otherMobs) {
    const angle = angleFromTo(mob.x, mob.y, targetX, targetY);
    let newX = mob.x + Math.cos(angle) * mob.speed;
    let newY = mob.y + Math.sin(angle) * mob.speed;

    for (const wall of walls) {
        const halfSize = wall.size / 2;
        if (newX > wall.x - halfSize - mob.size && newX < wall.x + halfSize + mob.size &&
            newY > wall.y - halfSize - mob.size && newY < wall.y + halfSize + mob.size) {
            const pushAngle = angleFromTo(wall.x, wall.y, mob.x, mob.y);
            newX = mob.x + Math.cos(pushAngle) * mob.speed;
            newY = mob.y + Math.sin(pushAngle) * mob.speed;
            break;
        }
    }

    for (const other of otherMobs) {
        if (other.id === mob.id) continue;
        const dist = distance(mob.x, mob.y, other.x, other.y);
        if (dist < mob.size + other.size) {
            const pushAngle = angleFromTo(other.x, other.y, mob.x, mob.y);
            newX += Math.cos(pushAngle) * 0.5;
            newY += Math.sin(pushAngle) * 0.5;
        }
    }

    newX = clamp(newX, -MOB_DESPAWN_MARGIN, MAP_WIDTH + MOB_DESPAWN_MARGIN);
    newY = clamp(newY, -MOB_DESPAWN_MARGIN, MAP_HEIGHT + MOB_DESPAWN_MARGIN);

    return { x: newX, y: newY };
}

function calculateMobAggro(mob, players) {
    let highestAggro = 0;
    let highestAggroTarget = null;

    for (const [, player] of players) {
        if (player.isDead) continue;
        const dist = distance(mob.x, mob.y, player.x, player.y);
        if (dist > mob.aggroRange) continue;

        let aggro = 100;
        aggro -= dist * 0.5;
        if (player.hp < player.maxHp * 0.3) aggro += 50;
        if (player.shield > 0) aggro -= 30;

        if (mob.behavior === 'tank') {
            aggro += player.kills * 5;
        }
        if (mob.behavior === 'swarm') {
            aggro -= dist * 0.3;
        }

        if (aggro > highestAggro) {
            highestAggro = aggro;
            highestAggroTarget = player;
        }
    }

    return highestAggroTarget;
}

function processMobAttack(mob, target, room, now) {
    if (!mob.lastAttack || now - mob.lastAttack >= mob.attackCooldown) {
        mob.lastAttack = now;

        if (mob.isRanged) {
            if (distance(mob.x, mob.y, target.x, target.y) <= mob.attackRange) {
                const damage = mob.damage;
                let finalDamage = damage;

                if (target.shield > 0) {
                    const absorbed = Math.min(target.shield, finalDamage);
                    target.shield -= absorbed;
                    finalDamage -= absorbed;
                }

                target.hp -= finalDamage;
                target.totalDamageTaken += finalDamage;

                io.to(room.id).emit('projectile', {
                    fromX: mob.x, fromY: mob.y,
                    toX: target.x, toY: target.y,
                    color: mob.color, size: 3
                });

                if (target.hp <= 0) {
                    processPlayerDeath(target, room, now);
                }
            }
        } else {
            if (distance(mob.x, mob.y, target.x, target.y) <= mob.attackRange + mob.size) {
                const damage = mob.damage;
                let finalDamage = damage;

                if (target.shield > 0) {
                    const absorbed = Math.min(target.shield, finalDamage);
                    target.shield -= absorbed;
                    finalDamage -= absorbed;
                }

                target.hp -= finalDamage;
                target.totalDamageTaken += finalDamage;

                if (target.hp <= 0) {
                    processPlayerDeath(target, room, now);
                }
            }
        }
    }
}

function processMobMovement(mob, targetX, targetY, room) {
    const angle = angleFromTo(mob.x, mob.y, targetX, targetY);
    let speedMod = 1;

    for (const effect of mob.statusEffects) {
        if (effect.type === 'slow') speedMod *= (effect.slowFactor || 0.5);
        if (effect.type === 'speed') speedMod *= 1.5;
    }

    if (isStunned(mob.statusEffects)) speedMod = 0;

    const actualSpeed = mob.speed * speedMod * (room.difficulty * 0.2 + 0.8);
    const newPos = calculateMobPath(mob, targetX, targetY, room.walls, room.mobs);

    mob.x = newPos.x;
    mob.y = newPos.y;
}

function processRangedMobBehavior(mob, players, fortressX, fortressY, room) {
    const aggroTarget = calculateMobAggro(mob, players);

    if (aggroTarget) {
        const distToTarget = distance(mob.x, mob.y, aggroTarget.x, aggroTarget.y);

        if (distToTarget < mob.attackRange) {
            processMobAttack(mob, aggroTarget, room, Date.now());
        } else if (distToTarget > mob.attackRange * 0.8) {
            processMobMovement(mob, aggroTarget.x, aggroTarget.y, room);
        } else {
            const strafeAngle = angleFromTo(mob.x, mob.y, aggroTarget.x, aggroTarget.y) + Math.PI / 2;
            const strafeX = mob.x + Math.cos(strafeAngle) * mob.speed;
            const strafeY = mob.y + Math.sin(strafeAngle) * mob.speed;
            processMobMovement(mob, strafeX, strafeY, room);
        }
    } else {
        processMobMovement(mob, fortressX, fortressY, room);
    }
}

function processSwarmMobBehavior(mob, players, fortressX, fortressY, room) {
    const nearbyAllies = room.mobs.filter(m =>
        m.id !== mob.id && m.behavior === 'swarm' && distance(mob.x, mob.y, m.x, m.y) < 120
    );

    if (nearbyAllies.length >= 3) {
        const centerX = nearbyAllies.reduce((sum, m) => sum + m.x, mob.x) / (nearbyAllies.length + 1);
        const centerY = nearbyAllies.reduce((sum, m) => sum + m.y, mob.y) / (nearbyAllies.length + 1);

        const aggroTarget = calculateMobAggro(mob, players);
        if (aggroTarget) {
            processMobAttack(mob, aggroTarget, room, Date.now());
            processMobMovement(mob, aggroTarget.x, aggroTarget.y, room);
        } else {
            processMobMovement(mob, fortressX, fortressY, room);
        }
    } else {
        const aggroTarget = calculateMobAggro(mob, players);
        if (aggroTarget) {
            processMobAttack(mob, aggroTarget, room, Date.now());
            processMobMovement(mob, aggroTarget.x, aggroTarget.y, room);
        } else {
            processMobMovement(mob, fortressX, fortressY, room);
        }
    }
}

function processTankMobBehavior(mob, players, fortressX, fortressY, room) {
    const aggroTarget = calculateMobAggro(mob, players);

    if (aggroTarget) {
        processMobAttack(mob, aggroTarget, room, Date.now());
        processMobMovement(mob, aggroTarget.x, aggroTarget.y, room);
    } else {
        processMobMovement(mob, fortressX, fortressY, room);
    }
}

function processBossMobBehavior(mob, players, towers, fortressX, fortressY, room) {
    const now = Date.now();

    if (mob.bossPhase >= 2 && mob.abilities && mob.abilities.length > 0) {
        if (now - (mob.lastSpecialAbility || 0) > 4000) {
            mob.lastSpecialAbility = now;
            if (Math.random() < 0.4) {
                executeBossAbility(mob, room, now);
            }
        }
    }

    const hpPercent = mob.hp / mob.maxHp;
    if (mob.phaseThresholds) {
        for (let p = 0; p < mob.phaseThresholds.length; p++) {
            if (hpPercent <= mob.phaseThresholds[p] && mob.bossPhase <= p + 1) {
                mob.bossPhase = p + 2;
                executeBossAbility(mob, room, now);
                room.broadcastChat(`⚠️ ${mob.name} переходит в фазу ${mob.bossPhase}!`);
                break;
            }
        }
    }

    switch (mob.bossPhase) {
        case 1: {
            const aggroTarget = calculateMobAggro(mob, players);
            if (aggroTarget) {
                processMobAttack(mob, aggroTarget, room, now);
                processMobMovement(mob, aggroTarget.x, aggroTarget.y, room);
            } else {
                processMobMovement(mob, fortressX, fortressY, room);
            }
            break;
        }
        case 2: {
            let closestTower = null;
            let closestDist = mob.aggroRange;
            for (const tower of towers) {
                const dist = distance(mob.x, mob.y, tower.x, tower.y);
                if (dist < closestDist) {
                    closestDist = dist;
                    closestTower = tower;
                }
            }
            if (closestTower) {
                processMobMovement(mob, closestTower.x, closestTower.y, room);
            } else {
                processMobMovement(mob, fortressX, fortressY, room);
            }
            break;
        }
        case 3: {
            let weakestPlayer = null;
            let lowestHp = Infinity;
            for (const [, player] of players) {
                if (player.isDead) continue;
                if (player.hp < lowestHp) {
                    lowestHp = player.hp;
                    weakestPlayer = player;
                }
            }
            if (weakestPlayer) {
                processMobAttack(mob, weakestPlayer, room, now);
                processMobMovement(mob, weakestPlayer.x, weakestPlayer.y, room);
            } else {
                processMobMovement(mob, fortressX, fortressY, room);
            }
            break;
        }
        default: {
            processMobMovement(mob, fortressX, fortressY, room);
            break;
        }
    }
}

// ==================== РАСШИРЕННАЯ ЛОГИКА БАШЕН ====================
function findTowerTarget(tower, mobs) {
    const validMobs = mobs.filter(m => {
        if (!tower.canTargetFlying && m.isFlying) return false;
        const dist = distance(tower.x, tower.y, m.x, m.y);
        return dist <= tower.range;
    });

    if (validMobs.length === 0) return null;

    switch (tower.targetPriority) {
        case 'closest':
            return validMobs.reduce((closest, mob) => {
                const dist = distance(tower.x, tower.y, mob.x, mob.y);
                const closestDist = distance(tower.x, tower.y, closest.x, closest.y);
                return dist < closestDist ? mob : closest;
            });
        case 'strongest':
            return validMobs.reduce((strongest, mob) =>
                mob.hp > strongest.hp ? mob : strongest
            );
        case 'fastest':
            return validMobs.reduce((fastest, mob) =>
                mob.speed > fastest.speed ? mob : fastest
            );
        case 'weakest':
            return validMobs.reduce((weakest, mob) =>
                mob.hp < weakest.hp ? mob : weakest
            );
        case 'lowest_hp':
            return validMobs.reduce((lowest, mob) => {
                const ratio = mob.hp / mob.maxHp;
                const lowestRatio = lowest.hp / lowest.maxHp;
                return ratio < lowestRatio ? mob : lowest;
            });
        case 'boss':
            const bosses = validMobs.filter(m => m.isBoss);
            if (bosses.length > 0) {
                return bosses.reduce((closest, mob) => {
                    const dist = distance(tower.x, tower.y, mob.x, mob.y);
                    const closestDist = distance(tower.x, tower.y, closest.x, closest.y);
                    return dist < closestDist ? mob : closest;
                });
            }
            return validMobs[0];
        default:
            return validMobs[0];
    }
}

function calculateTowerDamage(tower, target, difficulty) {
    let baseDamage = tower.damage * tower.level;

    const targetArmor = target.armor || 0;
    const targetMagicResist = target.magicResist || 0;

    if (tower.isMagic) {
        baseDamage = Math.max(1, baseDamage - targetMagicResist);
    } else {
        baseDamage = Math.max(1, baseDamage - targetArmor);
    }

    return Math.floor(baseDamage);
}

function calculateTowerFireRate(tower, engineerBoost) {
    return tower.fireRate * engineerBoost;
}

function processTowerFiring(tower, target, room, now, engineerBoost) {
    const fireRate = calculateTowerFireRate(tower, engineerBoost);

    if (now - tower.lastFired < fireRate) return;

    tower.lastFired = now;
    tower.reloading = true;
    tower.totalShotsFired++;

    setTimeout(() => { tower.reloading = false; }, fireRate);

    const damage = calculateTowerDamage(tower, target, room.difficulty);

    if (tower.splash > 0) {
        const affected = calculateSplashDamage(target.x, target.y, tower.splash, damage, room.mobs);
        for (const { target: mob, damage: splashDmg } of affected) {
            mob.hp -= splashDmg;
        }
        io.to(room.id).emit('explosion', {
            x: target.x, y: target.y,
            radius: tower.splash, color: tower.color
        });
    } else {
        target.hp -= damage;
    }

    tower.totalDamageDealt += damage;
    room.totalDamageToMobs += damage;

    executeTowerSpecialEffect(tower, target, room, now);

    io.to(room.id).emit('towerShot', {
        towerId: tower.id,
        targetX: target.x,
        targetY: target.y,
        color: tower.color
    });
}

// ==================== РАСШИРЕННАЯ СИСТЕМА ВОЛН ====================
function generateWaveComposition(waveNumber, difficulty) {
    const composition = {
        mobs: [],
        totalMobs: 0,
        difficulty: difficulty,
        specialModifiers: []
    };

    const baseCount = WAVE_BASE_MOBS + waveNumber * WAVE_MOBS_PER_LEVEL;
    composition.totalMobs = baseCount;

    const availableTypes = [];
    for (const [key, type] of Object.entries(MOB_TYPES)) {
        if (type.isBoss) continue;
        if (waveNumber >= type.minWave) {
            availableTypes.push(key);
        }
    }

    if (waveNumber >= 3) composition.specialModifiers.push('enraged');
    if (waveNumber >= 7) composition.specialModifiers.push('armored');
    if (waveNumber >= 10) composition.specialModifiers.push('swift');
    if (waveNumber >= 12) composition.specialModifiers.push('regenerating');

    for (let i = 0; i < baseCount; i++) {
        const typeKey = weightedRandom(availableTypes, availableTypes.map(k => MOB_TYPES[k].spawnWeight));
        const type = MOB_TYPES[typeKey];

        const mobData = {
            type: typeKey,
            hpMod: 1 + (waveNumber - 1) * MOB_HP_SCALE_PER_WAVE,
            dmgMod: 1 + (waveNumber - 1) * MOB_DAMAGE_SCALE_PER_WAVE,
            speedMod: 1,
            rewardMod: 1
        };

        for (const modifier of composition.specialModifiers) {
            switch (modifier) {
                case 'enraged':
                    mobData.dmgMod *= 1.2;
                    mobData.hpMod *= 0.9;
                    break;
                case 'armored':
                    mobData.hpMod *= 1.3;
                    mobData.dmgMod *= 0.8;
                    break;
                case 'swift':
                    mobData.speedMod *= 1.3;
                    mobData.hpMod *= 0.85;
                    break;
                case 'regenerating':
                    mobData.hpMod *= 1.1;
                    break;
            }
        }

        composition.mobs.push(mobData);
    }

    if (waveNumber % BOSS_WAVE_INTERVAL === 0) {
        const bossKey = waveNumber === 5 ? 'dragon' : waveNumber === 10 ? 'lich' : 'arch_demon';
        composition.mobs.push({
            type: bossKey,
            hpMod: 1 + (waveNumber - 1) * MOB_HP_SCALE_PER_WAVE,
            dmgMod: 1 + (waveNumber - 1) * MOB_DAMAGE_SCALE_PER_WAVE,
            speedMod: 1,
            rewardMod: 1,
            isBoss: true
        });
        composition.totalMobs++;
    }

    return composition;
}

function spawnMobFromComposition(mobData, room) {
    const type = MOB_TYPES[mobData.type];
    if (!type) return;

    const spawnPos = generateSpawnPosition(MAP_WIDTH, MAP_HEIGHT, CENTER_X, CENTER_Y, FORTRESS_RADIUS);

    room.mobs.push({
        id: ++room.mobIdCounter,
        x: spawnPos.x,
        y: spawnPos.y,
        hp: Math.floor(type.hp * mobData.hpMod),
        maxHp: Math.floor(type.hp * mobData.hpMod),
        speed: type.speed * mobData.speedMod,
        damage: Math.floor(type.damage * mobData.dmgMod),
        reward: Math.floor(type.reward * mobData.rewardMod),
        xp: type.xp,
        icon: type.icon,
        color: type.color,
        size: type.size,
        name: type.name,
        behavior: type.behavior,
        isBoss: mobData.isBoss || false,
        statusEffects: [],
        marked: false,
        lastAttack: 0,
        attackCooldown: type.attackCooldown,
        aggroRange: type.aggroRange,
        attackRange: type.attackRange,
        armor: type.armor,
        magicResist: type.magicResist,
        evasion: type.evasion,
        isFlying: type.isFlying,
        specialAbility: type.specialAbility,
        abilities: [...(type.abilities || [])],
        bossPhase: 1,
        phaseThresholds: type.phaseThresholds || null,
        lastSpecialAbility: 0
    });

    room.totalMobsSpawned++;
}

// ==================== СИСТЕМА ПРОГРЕССИИ ====================
const XP_TABLE = [100, 150, 225, 338, 507, 761, 1142, 1713, 2570, 3855, 5783, 8675, 13013, 19520, 29280];
const LEVEL_NAMES = [
    'Новичок', 'Ученик', 'Боец', 'Воин', 'Рыцарь',
    'Владыка', 'Чемпион', 'Герой', 'Легенда', 'Бог войны',
    'Бессмертный', 'Титан', 'Драконорождённый', 'Властелин', 'Абсолют'
];

function getLevelName(level) {
    if (level <= 0) return LEVEL_NAMES[0];
    if (level > LEVEL_NAMES.length) return LEVEL_NAMES[LEVEL_NAMES.length - 1];
    return LEVEL_NAMES[level - 1];
}

function getXpForLevel(level) {
    if (level <= 0) return XP_TABLE[0];
    if (level > XP_TABLE.length) return XP_TABLE[XP_TABLE.length - 1] * Math.pow(1.5, level - XP_TABLE.length);
    return XP_TABLE[level - 1];
}

function processLevelUp(player, room) {
    while (player.xp >= player.xpToNext) {
        player.level++;
        player.xp -= player.xpToNext;
        player.xpToNext = getXpForLevel(player.level);
        player.maxHp += 15;
        player.hp = Math.min(player.maxHp, player.hp + 15);
        player.maxAmmo += 5;
        player.ammo = Math.min(player.maxAmmo, player.ammo + 5);
        player.coins += 10 + player.level * 2;

        const levelName = getLevelName(player.level);
        room.broadcastChat(`⬆️ ${player.role.icon} ${player.name} достиг уровня ${player.level} (${levelName})!`);

        if (player.level % 5 === 0) {
            player.maxHp += 20;
            player.hp = player.maxHp;
            player.maxAmmo += 10;
            player.ammo = player.maxAmmo;
            room.broadcastChat(`🌟 ${player.name} получил бонус уровня ${player.level}!`);
        }
    }
}

// ==================== СИСТЕМА УРОНА ====================
function calculateProjectileDamage(projectile, mob, shooter) {
    let baseDamage = projectile.damage;

    const attacker = {
        critChance: shooter ? shooter.critChance : 0,
        critMult: shooter ? shooter.critMult : 1
    };

    let finalDamage = calculateDamage(baseDamage, attacker, mob, projectile.isMagic);

    if (mob.marked) {
        finalDamage = Math.floor(finalDamage * MARK_DAMAGE_MULT);
    }

    const evasion = mob.evasion || 0;
    if (Math.random() < evasion) {
        return { damage: 0, evaded: true };
    }

    return { damage: finalDamage, evaded: false };
}

function processProjectileHit(proj, mob, room) {
    const shooter = room.players.get(proj.ownerId);
    const result = calculateProjectileDamage(proj, mob, shooter);

    if (result.evaded) {
        io.to(room.id).emit('evade', {
            x: mob.x, y: mob.y,
            text: 'Уклонение!'
        });
        return;
    }

    let finalDamage = result.damage;

    if (proj.splash > 0) {
        const affected = calculateSplashDamage(proj.x, proj.y, proj.splash, finalDamage, room.mobs);
        for (const { target, damage } of affected) {
            target.hp -= damage;
        }
        io.to(room.id).emit('explosion', {
            x: proj.x, y: proj.y,
            radius: proj.splash, color: proj.color
        });
    } else {
        mob.hp -= finalDamage;
    }

    if (shooter) {
        shooter.damageDealt += finalDamage;
        shooter.totalDamageDealt += finalDamage;
        room.totalDamageToMobs += finalDamage;
    }

    if (proj.applyPoison) {
        applyStatusEffect(mob, 'poison', POISON_DURATION, { damage: POISON_TICK_DAMAGE });
    }

    if (proj.color === '#00CED1') {
        applyStatusEffect(mob, 'slow', 2000, { slowFactor: 0.5 });
    }

    io.to(room.id).emit('damageNumber', {
        x: mob.x, y: mob.y - 20,
        damage: finalDamage,
        isCrit: shooter && Math.random() < shooter.critChance
    });
}

// ==================== СИСТЕМА ЛОВУШЕК ====================
function processTrapTrigger(trap, mob, room) {
    trap.totalTriggers++;

    if (trap.damage > 0) {
        const damage = trap.damage;
        mob.hp -= damage;
        trap.totalDamageDealt += damage;
        room.totalDamageToMobs += damage;
    }

    if (trap.slow > 0) {
        applyStatusEffect(mob, 'slow', trap.duration, { slowFactor: trap.slow });
    }

    if (trap.teleportRadius > 0) {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * trap.teleportRadius;
        mob.x = trap.x + Math.cos(angle) * dist;
        mob.y = trap.y + Math.sin(angle) * dist;
    }

    trap.uses--;
    io.to(room.id).emit('trapTriggered', {
        x: trap.x, y: trap.y,
        type: trap.type,
        damage: trap.damage
    });

    if (trap.uses <= 0) {
        const idx = room.traps.indexOf(trap);
        if (idx !== -1) room.traps.splice(idx, 1);
    }
}

// ==================== СИСТЕМА РЕМОНТА ====================
function processWallRepair(wall, player, room) {
    const repairCost = Math.floor((wall.maxHp - wall.hp) * REPAIR_COST_FACTOR);
    if (player.coins < repairCost) return false;

    player.coins -= repairCost;
    const healAmount = REPAIR_HP;
    wall.hp = Math.min(wall.maxHp, wall.hp + healAmount);
    wall.lastRepair = Date.now();

    room.totalHealingDone += healAmount;
    player.totalHealingReceived += healAmount;

    io.to(room.id).emit('repairEffect', {
        x: wall.x, y: wall.y,
        amount: healAmount
    });

    return true;
}

function processWallSell(wall, player, room) {
    const sellValue = Math.floor(WALL_TYPES[wall.type].cost * SELL_VALUE_FACTOR);
    player.coins += sellValue;

    const idx = room.walls.indexOf(wall);
    if (idx !== -1) room.walls.splice(idx, 1);

    io.to(room.id).emit('sellEffect', {
        x: wall.x, y: wall.y,
        value: sellValue
    });

    return true;
}

// ==================== СИСТЕМА БАШЕН ====================
function processTowerUpgrade(tower, player, room) {
    const towerType = TOWER_TYPES[tower.type];
    if (!towerType) return false;
    if (tower.level >= towerType.maxLevel) return false;

    const upgradeCost = Math.floor(towerType.cost * tower.level * towerType.upgradeCostFactor);
    if (player.coins < upgradeCost) return false;

    player.coins -= upgradeCost;
    tower.level++;
    tower.hp = Math.min(tower.maxHp + tower.level * TOWER_LEVEL_HP_BONUS, tower.hp + TOWER_LEVEL_UPGRADE_HP);
    tower.maxHp += TOWER_LEVEL_HP_BONUS;
    tower.damage = Math.floor(tower.damage * TOWER_LEVEL_DAMAGE_MULT);
    tower.range += TOWER_LEVEL_RANGE_BONUS;

    io.to(room.id).emit('towerUpgraded', {
        towerId: tower.id,
        level: tower.level
    });

    return true;
}

function processTowerSell(tower, player, room) {
    const towerType = TOWER_TYPES[tower.type];
    if (!towerType) return false;

    const sellValue = Math.floor(towerType.cost * SELL_VALUE_FACTOR * tower.level);
    player.coins += sellValue;

    const idx = room.towers.indexOf(tower);
    if (idx !== -1) room.towers.splice(idx, 1);

    io.to(room.id).emit('sellEffect', {
        x: tower.x, y: tower.y,
        value: sellValue
    });

    return true;
}

// ==================== СИСТЕМА ВОСКРЕШЕНИЯ ====================
function processPlayerRevive(medic, targetPlayer, room) {
    if (medic.roleKey !== 'MEDIC') return false;
    if (!targetPlayer || !targetPlayer.isDead) return false;
    if (distance(medic.x, medic.y, targetPlayer.x, targetPlayer.y) > HEAL_RANGE) return false;
    if (medic.coins < REVIVE_COST) return false;

    medic.coins -= REVIVE_COST;
    targetPlayer.isDead = false;
    targetPlayer.hp = Math.floor(targetPlayer.maxHp * REVIVE_HP_FACTOR);
    targetPlayer.x = medic.x;
    targetPlayer.y = medic.y;
    targetPlayer.statusEffects = [];
    targetPlayer.shield = 0;

    room.totalRevives++;

    const healAmount = Math.floor(targetPlayer.maxHp * REVIVE_HP_FACTOR);
    room.totalHealingDone += healAmount;

    room.broadcastChat(`${medic.role.icon} ${medic.name} возродил ${targetPlayer.name}!`);

    io.to(room.id).emit('reviveEffect', {
        playerId: targetPlayer.id,
        x: targetPlayer.x,
        y: targetPlayer.y
    });

    return true;
}

// ==================== СИСТЕМА ПЕРЕСТАНОВКИ ====================
function processPlayerRearrange(player1, player2, room) {
    if (!player1 || !player2) return false;
    if (player1.isDead || player2.isDead) return false;
    if (distance(player1.x, player1.y, player2.x, player2.y) > REARRANGE_RANGE) return false;

    const tempX = player1.x;
    const tempY = player1.y;
    player1.x = player2.x;
    player1.y = player2.y;
    player2.x = tempX;
    player2.y = tempY;

    io.to(room.id).emit('swapPosition', {
        p1: { id: player1.id, x: player1.x, y: player1.y },
        p2: { id: player2.id, x: player2.x, y: player2.y }
    });

    return true;
}

// ==================== СИСТЕМА СОХРАНЕНИЯ ====================
function savePlayerData(player) {
    const data = {
        id: player.id,
        name: player.name,
        roleKey: player.roleKey,
        level: player.level,
        xp: player.xp,
        achievements: player.achievements || [],
        totalKills: player.totalKills || 0,
        totalDeaths: player.totalDeaths || 0,
        totalDamage: player.totalDamageDealt || 0,
        totalScore: player.score || 0,
        gamesPlayed: 1,
        joinTime: player.joinTime,
        saveTime: Date.now()
    };
    return data;
}

function loadPlayerData(playerId) {
    const globalData = playerGlobalStats.get(playerId);
    if (!globalData) return null;
    return {
        ...globalData,
        lastSeen: Date.now()
    };
}

// ==================== ГЕНЕРАЦИЯ ОКРУЖЕНИЯ ====================
function generateEnvironment() {
    const environment = {
        trees: [],
        rocks: [],
        bushes: [],
        flowers: [],
        rivers: [],
        paths: [],
        decorations: []
    };

    for (let i = 0; i < 40; i++) {
        const x = Math.random() * MAP_WIDTH;
        const y = Math.random() * MAP_HEIGHT;
        if (distance(x, y, CENTER_X, CENTER_Y) > FORTRESS_RADIUS + 80) {
            environment.trees.push({
                id: i,
                x, y,
                type: randomChoice(['oak', 'pine', 'birch', 'dead']),
                size: 15 + Math.random() * 15,
                color: randomChoice(['#228B22', '#2E8B57', '#006400', '#32CD32']),
                health: 50 + Math.random() * 50,
                maxHealth: 100,
                canBeDestroyed: true,
                blocksMovement: true,
                blocksProjectiles: false
            });
        }
    }

    for (let i = 0; i < 25; i++) {
        const x = Math.random() * MAP_WIDTH;
        const y = Math.random() * MAP_HEIGHT;
        if (distance(x, y, CENTER_X, CENTER_Y) > FORTRESS_RADIUS + 60) {
            environment.rocks.push({
                id: i,
                x, y,
                type: randomChoice(['small', 'medium', 'large', 'boulder']),
                size: 10 + Math.random() * 20,
                color: randomChoice(['#808080', '#696969', '#A9A9A9', '#778899']),
                health: 100 + Math.random() * 100,
                maxHealth: 200,
                canBeDestroyed: true,
                blocksMovement: true,
                blocksProjectiles: true
            });
        }
    }

    for (let i = 0; i < 30; i++) {
        const x = Math.random() * MAP_WIDTH;
        const y = Math.random() * MAP_HEIGHT;
        if (distance(x, y, CENTER_X, CENTER_Y) > FORTRESS_RADIUS + 40) {
            environment.bushes.push({
                id: i,
                x, y,
                type: randomChoice(['grass', 'flower_bush', 'berry_bush']),
                size: 8 + Math.random() * 8,
                color: randomChoice(['#228B22', '#32CD32', '#90EE90']),
                canBeDestroyed: true,
                blocksMovement: false,
                providesCover: true
            });
        }
    }

    for (let i = 0; i < 50; i++) {
        const x = Math.random() * MAP_WIDTH;
        const y = Math.random() * MAP_HEIGHT;
        if (distance(x, y, CENTER_X, CENTER_Y) > FORTRESS_RADIUS + 30) {
            environment.flowers.push({
                id: i,
                x, y,
                type: randomChoice(['red', 'blue', 'yellow', 'purple', 'white']),
                size: 3 + Math.random() * 3,
                color: randomChoice(['#FF6B6B', '#4ECDC4', '#FFE66D', '#A855F7', '#FFFFFF']),
                animated: Math.random() < 0.3
            });
        }
    }

    for (let i = 0; i < 3; i++) {
        const startX = Math.random() * MAP_WIDTH;
        const startY = Math.random() * MAP_HEIGHT;
        const length = 100 + Math.random() * 200;
        const angle = Math.random() * Math.PI * 2;

        const points = [];
        for (let j = 0; j < 10; j++) {
            const t = j / 9;
            points.push({
                x: startX + Math.cos(angle) * length * t + (Math.random() - 0.5) * 30,
                y: startY + Math.sin(angle) * length * t + (Math.random() - 0.5) * 30
            });
        }

        environment.rivers.push({
            id: i,
            points,
            width: 10 + Math.random() * 15,
            color: '#4A90D9',
            flowSpeed: 0.5 + Math.random() * 0.5,
            slowsMobs: true,
            slowFactor: 0.7
        });
    }

    for (let i = 0; i < 4; i++) {
        const side = Math.floor(Math.random() * 4);
        let startX, startY, endX, endY;

        switch (side) {
            case 0: startX = Math.random() * MAP_WIDTH; startY = 0; endX = CENTER_X; endY = CENTER_Y; break;
            case 1: startX = MAP_WIDTH; startY = Math.random() * MAP_HEIGHT; endX = CENTER_X; endY = CENTER_Y; break;
            case 2: startX = Math.random() * MAP_WIDTH; startY = MAP_HEIGHT; endX = CENTER_X; endY = CENTER_Y; break;
            case 3: startX = 0; startY = Math.random() * MAP_HEIGHT; endX = CENTER_X; endY = CENTER_Y; break;
        }

        const points = [];
        for (let j = 0; j < 8; j++) {
            const t = j / 7;
            points.push({
                x: lerp(startX, endX, t) + (Math.random() - 0.5) * 40,
                y: lerp(startY, endY, t) + (Math.random() - 0.5) * 40
            });
        }

        environment.paths.push({
            id: i,
            points,
            width: 8 + Math.random() * 6,
            color: '#8B7355',
            worn: Math.random() < 0.5
        });
    }

    for (let i = 0; i < 20; i++) {
        environment.decorations.push({
            id: i,
            x: Math.random() * MAP_WIDTH,
            y: Math.random() * MAP_HEIGHT,
            type: randomChoice(['mushroom', 'bone', 'skull', 'campfire', 'barrel', 'crate', 'sign', 'torch']),
            size: 5 + Math.random() * 8,
            rotation: Math.random() * Math.PI * 2,
            animated: false,
            interactable: true
        });
    }

    return environment;
}

function getEnvironmentNearby(x, y, radius, environment) {
    const nearby = {
        trees: [],
        rocks: [],
        bushes: [],
        flowers: [],
        decorations: []
    };

    for (const tree of environment.trees) {
        if (distance(x, y, tree.x, tree.y) < radius) nearby.trees.push(tree);
    }
    for (const rock of environment.rocks) {
        if (distance(x, y, rock.x, rock.y) < radius) nearby.rocks.push(rock);
    }
    for (const bush of environment.bushes) {
        if (distance(x, y, bush.x, bush.y) < radius) nearby.bushes.push(bush);
    }
    for (const flower of environment.flowers) {
        if (distance(x, y, flower.x, flower.y) < radius) nearby.flowers.push(flower);
    }
    for (const deco of environment.decorations) {
        if (distance(x, y, deco.x, deco.y) < radius) nearby.decorations.push(deco);
    }

    return nearby;
}

function checkEnvironmentCollision(x, y, size, environment) {
    for (const tree of environment.trees) {
        if (tree.blocksMovement && distance(x, y, tree.x, tree.y) < tree.size + size) {
            return true;
        }
    }
    for (const rock of environment.rocks) {
        if (rock.blocksMovement && distance(x, y, rock.x, rock.y) < rock.size + size) {
            return true;
        }
    }
    return false;
}

function checkProjectileEnvironmentCollision(x, y, environment) {
    for (const rock of environment.rocks) {
        if (rock.blocksProjectiles && distance(x, y, rock.x, rock.y) < rock.size) {
            return true;
        }
    }
    return false;
}

// ==================== СИСТЕМА ЗВУКОВ ====================
const SOUND_EFFECTS = {
    HIT: { name: 'hit', volume: 0.3, pitch: 1.0 },
    SHOOT: { name: 'shoot', volume: 0.4, pitch: 1.0 },
    EXPLOSION: { name: 'explosion', volume: 0.6, pitch: 0.8 },
    BUILD: { name: 'build', volume: 0.3, pitch: 1.0 },
    HEAL: { name: 'heal', volume: 0.3, pitch: 1.2 },
    ABILITY: { name: 'ability', volume: 0.4, pitch: 1.0 },
    LEVEL_UP: { name: 'level_up', volume: 0.5, pitch: 1.0 },
    DEATH: { name: 'death', volume: 0.5, pitch: 0.8 },
    WAVE_START: { name: 'wave_start', volume: 0.5, pitch: 1.0 },
    BOSS_SPAWN: { name: 'boss_spawn', volume: 0.7, pitch: 0.9 },
    VICTORY: { name: 'victory', volume: 0.6, pitch: 1.0 },
    DEFEAT: { name: 'defeat', volume: 0.6, pitch: 0.9 },
    COIN: { name: 'coin', volume: 0.2, pitch: 1.5 },
    POWER_UP: { name: 'power_up', volume: 0.4, pitch: 1.2 },
    TRAP_TRIGGER: { name: 'trap_trigger', volume: 0.3, pitch: 1.0 },
    WALL_BREAK: { name: 'wall_break', volume: 0.4, pitch: 0.8 },
    TOWER_SHOOT: { name: 'tower_shoot', volume: 0.2, pitch: 1.0 },
    PLAYER_HIT: { name: 'player_hit', volume: 0.4, pitch: 1.0 },
    PLAYER_HEAL: { name: 'player_heal', volume: 0.3, pitch: 1.2 },
    REVIVE: { name: 'revive', volume: 0.5, pitch: 1.0 },
    CHAT: { name: 'chat', volume: 0.1, pitch: 1.0 }
};

function playSound(room, soundName, x, y, extra) {
    const sound = SOUND_EFFECTS[soundName];
    if (!sound) return;

    const data = {
        name: sound.name,
        volume: sound.volume,
        pitch: sound.pitch,
        x, y,
        ...extra
    };

    io.to(room.id).emit('sound', data);
}

// ==================== ДОПОЛНИТЕЛЬНЫЕ МОБЫ ====================
const EXTRA_MOB_TYPES = {
    imp: {
        name: 'Имп',
        icon: '👿',
        hp: 20,
        speed: 2.0,
        damage: 3,
        reward: 8,
        color: '#FF6347',
        size: 8,
        behavior: 'swarm',
        aggroRange: 150,
        attackRange: 10,
        attackCooldown: 800,
        xp: 3,
        isRanged: false,
        isFlying: false,
        abilities: [],
        spawnWeight: 12,
        minWave: 1,
        armor: 0,
        magicResist: 0,
        evasion: 0.1,
        lifesteal: 0,
        deathEffect: null,
        specialAbility: null
    },
    ghoul: {
        name: 'Вурдалак',
        icon: '🧟',
        hp: 60,
        speed: 1.1,
        damage: 12,
        reward: 20,
        color: '#556B2F',
        size: 12,
        behavior: 'swarm',
        aggroRange: 180,
        attackRange: 14,
        attackCooldown: 1200,
        xp: 10,
        isRanged: false,
        isFlying: false,
        abilities: ['lifesteal'],
        spawnWeight: 6,
        minWave: 3,
        armor: 1,
        magicResist: 0,
        evasion: 0,
        lifesteal: 0.15,
        deathEffect: null,
        specialAbility: 'lifesteal'
    },
    wraith: {
        name: 'Призрак',
        icon: '👻',
        hp: 35,
        speed: 1.4,
        damage: 8,
        reward: 18,
        color: '#E6E6FA',
        size: 10,
        behavior: 'ranged',
        aggroRange: 220,
        attackRange: 130,
        attackCooldown: 1800,
        xp: 9,
        isRanged: true,
        isFlying: true,
        abilities: ['phase'],
        spawnWeight: 6,
        minWave: 4,
        armor: 0,
        magicResist: 5,
        evasion: 0.2,
        lifesteal: 0,
        deathEffect: null,
        specialAbility: 'phase'
    },
    minotaur: {
        name: 'Минотавр',
        icon: '🐂',
        hp: 180,
        speed: 0.9,
        damage: 30,
        reward: 60,
        color: '#8B4513',
        size: 20,
        behavior: 'tank',
        aggroRange: 160,
        attackRange: 20,
        attackCooldown: 2000,
        xp: 30,
        isRanged: false,
        isFlying: false,
        abilities: ['charge', 'stomp'],
        spawnWeight: 3,
        minWave: 7,
        armor: 6,
        magicResist: 2,
        evasion: 0,
        lifesteal: 0,
        deathEffect: null,
        specialAbility: 'stomp'
    },
    medusa: {
        name: 'Медуза',
        icon: '🐍',
        hp: 90,
        speed: 0.8,
        damage: 15,
        reward: 45,
        color: '#2E8B57',
        size: 14,
        behavior: 'ranged',
        aggroRange: 200,
        attackRange: 170,
        attackCooldown: 2200,
        xp: 22,
        isRanged: true,
        isFlying: false,
        abilities: ['petrify', 'poison_bite'],
        spawnWeight: 4,
        minWave: 6,
        armor: 2,
        magicResist: 4,
        evasion: 0.05,
        lifesteal: 0,
        deathEffect: null,
        specialAbility: 'petrify'
    },
    basilisk: {
        name: 'Василиск',
        icon: '🦎',
        hp: 120,
        speed: 1.0,
        damage: 22,
        reward: 55,
        color: '#DAA520',
        size: 16,
        behavior: 'swarm',
        aggroRange: 200,
        attackRange: 16,
        attackCooldown: 1500,
        xp: 28,
        isRanged: false,
        isFlying: false,
        abilities: ['petrifying_gaze'],
        spawnWeight: 4,
        minWave: 8,
        armor: 3,
        magicResist: 5,
        evasion: 0.05,
        lifesteal: 0,
        deathEffect: null,
        specialAbility: 'petrifying_gaze'
    },
    chimera: {
        name: 'Химера',
        icon: '🦁',
        hp: 250,
        speed: 0.9,
        damage: 40,
        reward: 90,
        color: '#B22222',
        size: 22,
        behavior: 'tank',
        aggroRange: 220,
        attackRange: 18,
        attackCooldown: 1800,
        xp: 45,
        isRanged: false,
        isFlying: true,
        abilities: ['multi_attack', 'fire_breath'],
        spawnWeight: 2,
        minWave: 10,
        armor: 5,
        magicResist: 5,
        evasion: 0.1,
        lifesteal: 0,
        deathEffect: 'fire_explosion',
        specialAbility: 'multi_attack'
    },
    vampire: {
        name: ' Вампир',
        icon: '🧛',
        hp: 150,
        speed: 1.2,
        damage: 25,
        reward: 65,
        color: '#8B0000',
        size: 15,
        behavior: 'swarm',
        aggroRange: 200,
        attackRange: 15,
        attackCooldown: 1200,
        xp: 32,
        isRanged: false,
        isFlying: false,
        abilities: ['lifesteal', 'bat_swarm'],
        spawnWeight: 3,
        minWave: 9,
        armor: 2,
        magicResist: 3,
        evasion: 0.1,
        lifesteal: 0.2,
        deathEffect: null,
        specialAbility: 'bat_swarm'
    },
    cerberus: {
        name: 'Цербер',
        icon: '🐕',
        hp: 300,
        speed: 1.1,
        damage: 45,
        reward: 100,
        color: '#4A4A4A',
        size: 24,
        behavior: 'tank',
        aggroRange: 250,
        attackRange: 20,
        attackCooldown: 1500,
        xp: 50,
        isRanged: false,
        isFlying: false,
        abilities: ['triple_bite', 'fire_breath'],
        spawnWeight: 2,
        minWave: 11,
        armor: 6,
        magicResist: 4,
        evasion: 0,
        lifesteal: 0.1,
        deathEffect: 'fire_explosion',
        specialAbility: 'triple_bite'
    },
    fenrir: {
        name: 'Фенрир',
        icon: '🐺',
        hp: 400,
        speed: 1.3,
        damage: 55,
        reward: 150,
        color: '#2F4F4F',
        size: 28,
        behavior: 'boss',
        aggroRange: 300,
        attackRange: 22,
        attackCooldown: 1600,
        xp: 75,
        isRanged: false,
        isFlying: false,
        abilities: ['howl', 'devour', 'frenzy'],
        spawnWeight: 0,
        minWave: 12,
        armor: 7,
        magicResist: 5,
        evasion: 0.15,
        lifesteal: 0.15,
        deathEffect: 'massive_explosion',
        specialAbility: 'howl',
        isBoss: true,
        bossPhase: 1,
        phaseThresholds: [0.7, 0.4, 0.15]
    },
    hydra: {
        name: 'Гидра',
        icon: '🐲',
        hp: 600,
        speed: 0.5,
        damage: 50,
        reward: 250,
        color: '#006400',
        size: 32,
        behavior: 'boss',
        aggroRange: 280,
        attackRange: 25,
        attackCooldown: 2000,
        xp: 120,
        isRanged: false,
        isFlying: false,
        abilities: ['regenerate', 'poison_bite', 'hydra_heads'],
        spawnWeight: 0,
        minWave: 13,
        armor: 8,
        magicResist: 8,
        evasion: 0,
        lifesteal: 0.2,
        deathEffect: 'poison_explosion',
        specialAbility: 'regenerate',
        isBoss: true,
        bossPhase: 1,
        phaseThresholds: [0.75, 0.5, 0.25, 0.1]
    },
    kraken: {
        name: 'Кракен',
        icon: '🐙',
        hp: 900,
        speed: 0.3,
        damage: 70,
        reward: 400,
        color: '#191970',
        size: 38,
        behavior: 'boss',
        aggroRange: 350,
        attackRange: 200,
        attackCooldown: 2500,
        xp: 180,
        isRanged: true,
        isFlying: false,
        abilities: ['tentacle_slam', 'ink_cloud', 'whirlpool', 'deep_dive'],
        spawnWeight: 0,
        minWave: 14,
        armor: 10,
        magicResist: 10,
        evasion: 0.05,
        lifesteal: 0.1,
        deathEffect: 'apocalypse',
        specialAbility: 'tentacle_slam',
        isBoss: true,
        bossPhase: 1,
        phaseThresholds: [0.8, 0.6, 0.4, 0.2, 0.1]
    }
};

function executeExtraMobSpecialAbility(mob, room, now) {
    switch (mob.specialAbility) {
        case 'lifesteal': {
            const target = findClosestTarget(mob.x, mob.y, Array.from(room.players.values()).filter(p => !p.isDead), mob.attackRange);
            if (target) {
                const damage = mob.damage;
                target.hp -= damage;
                mob.hp = Math.min(mob.maxHp, mob.hp + Math.floor(damage * mob.lifesteal));
                if (target.hp <= 0) {
                    processPlayerDeath(target, room, now);
                }
            }
            break;
        }
        case 'phase': {
            mob.isFlying = !mob.isFlying;
            room.broadcastChat(`👻 ${mob.name}${mob.isFlying ? ' поднялся' : ' опустился'}!`);
            break;
        }
        case 'stomp': {
            for (const [, player] of room.players) {
                if (player.isDead) continue;
                if (distance(mob.x, mob.y, player.x, player.y) < 60) {
                    player.hp -= Math.floor(mob.damage * 0.6);
                    applyStatusEffect(player, 'stun', 1500);
                    if (player.hp <= 0) {
                        processPlayerDeath(player, room, now);
                    }
                }
            }
            io.to(room.id).emit('explosion', { x: mob.x, y: mob.y, radius: 60, color: '#8B4513' });
            room.broadcastChat('🐂 Минотавр потопал!');
            break;
        }
        case 'petrify': {
            const target = findClosestTarget(mob.x, mob.y, Array.from(room.players.values()).filter(p => !p.isDead), mob.attackRange);
            if (target) {
                applyStatusEffect(target, 'stun', 3000);
                applyStatusEffect(target, 'slow', 3000, { slowFactor: 0.3 });
                room.broadcastChat('🐍 Медуза окаменила ' + target.name + '!');
            }
            break;
        }
        case 'petrifying_gaze': {
            for (const [, player] of room.players) {
                if (player.isDead) continue;
                if (distance(mob.x, mob.y, player.x, player.y) < 100) {
                    if (Math.random() < 0.3) {
                        applyStatusEffect(player, 'stun', 2000);
                        room.broadcastChat('🦎 Василиск окаменил ' + player.name + '!');
                    }
                }
            }
            break;
        }
        case 'multi_attack': {
            const targets = Array.from(room.players.values()).filter(p => !p.isDead).slice(0, 3);
            for (const target of targets) {
                if (distance(mob.x, mob.y, target.x, target.y) < mob.attackRange + 20) {
                    target.hp -= Math.floor(mob.damage * 0.7);
                    if (target.hp <= 0) {
                        processPlayerDeath(target, room, now);
                    }
                }
            }
            room.broadcastChat('🦁 Химера атакует всех!');
            break;
        }
        case 'bat_swarm': {
            for (let i = 0; i < 5; i++) {
                setTimeout(() => {
                    const target = findClosestTarget(mob.x, mob.y, Array.from(room.players.values()).filter(p => !p.isDead), 150);
                    if (target) {
                        target.hp -= Math.floor(mob.damage * 0.3);
                        if (target.hp <= 0) {
                            processPlayerDeath(target, room, Date.now());
                        }
                    }
                }, i * 200);
            }
            room.broadcastChat('🧛 Вампир выпускает стаю летучих мышей!');
            break;
        }
        case 'triple_bite': {
            const target = findClosestTarget(mob.x, mob.y, Array.from(room.players.values()).filter(p => !p.isDead), mob.attackRange);
            if (target) {
                for (let i = 0; i < 3; i++) {
                    setTimeout(() => {
                        target.hp -= Math.floor(mob.damage * 0.5);
                        if (target.hp <= 0) {
                            processPlayerDeath(target, room, Date.now());
                        }
                    }, i * 200);
                }
                room.broadcastChat('🐕 Цербер наносит тройной укус!');
            }
            break;
        }
        case 'howl': {
            for (const [, player] of room.players) {
                if (player.isDead) continue;
                if (distance(mob.x, mob.y, player.x, player.y) < 250) {
                    applyStatusEffect(player, 'slow', 3000, { slowFactor: 0.5 });
                }
            }
            room.broadcastChat('🐺 Фенрир завыл!');
            break;
        }
        case 'devour': {
            const target = findClosestTarget(mob.x, mob.y, Array.from(room.players.values()).filter(p => !p.isDead), mob.attackRange);
            if (target) {
                target.hp -= Math.floor(mob.damage * 2);
                mob.hp = Math.min(mob.maxHp, mob.hp + Math.floor(mob.damage * 1.5));
                if (target.hp <= 0) {
                    processPlayerDeath(target, room, now);
                    room.broadcastChat('🐺 Фенрир поглотил ' + target.name + '!');
                }
            }
            break;
        }
        case 'frenzy': {
            if (mob.hp < mob.maxHp * 0.3) {
                mob.speed *= 1.5;
                mob.damage = Math.floor(mob.damage * 1.3);
                applyStatusEffect(mob, 'speed', 5000);
                room.broadcastChat('🐺 Фенрир в ярости!');
                mob.specialAbility = null;
            }
            break;
        }
        case 'hydra_heads': {
            if (mob.hp < mob.maxHp * 0.5 && mob.bossPhase < 3) {
                for (let i = 0; i < 2; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    const dist = 40 + Math.random() * 40;
                    room.mobs.push({
                        id: ++room.mobIdCounter,
                        x: mob.x + Math.cos(angle) * dist,
                        y: mob.y + Math.sin(angle) * dist,
                        hp: 80, maxHp: 80,
                        speed: 1.0, damage: 20,
                        reward: 30, xp: 15,
                        icon: '🐲', color: '#006400',
                        size: 10, name: 'Голова гидры',
                        behavior: 'swarm',
                        isBoss: false,
                        statusEffects: [],
                        marked: false,
                        lastAttack: 0,
                        attackCooldown: 1500,
                        aggroRange: 150,
                        attackRange: 15,
                        armor: 3, magicResist: 3,
                        evasion: 0
                    });
                }
                room.broadcastChat('🐲 Гидра отращивает новые головы!');
            }
            break;
        }
        case 'poison_bite': {
            const target = findClosestTarget(mob.x, mob.y, Array.from(room.players.values()).filter(p => !p.isDead), mob.attackRange);
            if (target) {
                applyStatusEffect(target, 'poison', 5000, { damage: 8 });
                room.broadcastChat('🐲 Гидра отравила ' + target.name + '!');
            }
            break;
        }
        case 'tentacle_slam': {
            for (let i = 0; i < 4; i++) {
                setTimeout(() => {
                    const tx = CENTER_X + (Math.random() - 0.5) * 300;
                    const ty = CENTER_Y + (Math.random() - 0.5) * 200;
                    for (const [, player] of room.players) {
                        if (player.isDead) continue;
                        if (distance(tx, ty, player.x, player.y) < 50) {
                            player.hp -= Math.floor(mob.damage * 0.8);
                            applyStatusEffect(player, 'stun', 1000);
                            if (player.hp <= 0) {
                                processPlayerDeath(player, room, Date.now());
                            }
                        }
                    }
                    io.to(room.id).emit('explosion', { x: tx, y: ty, radius: 50, color: '#191970' });
                }, i * 400);
            }
            room.broadcastChat('🐙 Кракен бьёт щупальцами!');
            break;
        }
        case 'ink_cloud': {
            for (const [, player] of room.players) {
                if (player.isDead) continue;
                if (distance(mob.x, mob.y, player.x, player.y) < 200) {
                    applyStatusEffect(player, 'slow', 4000, { slowFactor: 0.4 });
                }
            }
            room.broadcastChat('🐙 Кракен выпускает чернильное облако!');
            break;
        }
        case 'whirlpool': {
            for (const [, player] of room.players) {
                if (player.isDead) continue;
                if (distance(mob.x, mob.y, player.x, player.y) < 300) {
                    const angle = angleFromTo(player.x, player.y, mob.x, mob.y);
                    player.x += Math.cos(angle) * 30;
                    player.y += Math.sin(angle) * 30;
                }
            }
            room.broadcastChat('🐙 Кракен создал водоворот!');
            break;
        }
        case 'deep_dive': {
            mob.isFlying = true;
            setTimeout(() => {
                mob.isFlying = false;
                for (const [, player] of room.players) {
                    if (player.isDead) continue;
                    if (distance(mob.x, mob.y, player.x, player.y) < 100) {
                        player.hp -= Math.floor(mob.damage * 1.2);
                        if (player.hp <= 0) {
                            processPlayerDeath(player, room, Date.now());
                        }
                    }
                }
                io.to(room.id).emit('explosion', { x: mob.x, y: mob.y, radius: 100, color: '#191970' });
            }, 2000);
            room.broadcastChat('🐙 Кракен ныряет!');
            break;
        }
    }
}

// ==================== ДОПОЛНИТЕЛЬНЫЕ ТИПЫ БАШЕН ====================
const EXTRA_TOWER_TYPES = {
    poison: {
        name: 'Ядовитая',
        icon: '🟢',
        cost: 40,
        hp: 75,
        damage: 12,
        range: 90,
        fireRate: 1800,
        color: '#00FF00',
        size: 20,
        splash: 0,
        slow: 0,
        burn: false,
        healRate: 0,
        projectileColor: '#00FF00',
        projectileSize: 4,
        isMagic: true,
        upgradeCostFactor: 0.75,
        maxLevel: 5,
        targetPriority: 'closest',
        canTargetFlying: true,
        description: 'Отравляет врагов.',
        specialEffect: 'poison'
    },
    chain: {
        name: 'Цепная молния',
        icon: '⚡',
        cost: 55,
        hp: 65,
        damage: 18,
        range: 110,
        fireRate: 1600,
        color: '#FFD700',
        size: 20,
        splash: 0,
        slow: 0,
        burn: false,
        healRate: 0,
        projectileColor: '#FFD700',
        projectileSize: 5,
        isMagic: true,
        upgradeCostFactor: 0.75,
        maxLevel: 5,
        targetPriority: 'closest',
        canTargetFlying: true,
        description: 'Бьёт молнией, перескакивающей на других врагов.',
        specialEffect: 'chain_lightning'
    },
    slow: {
        name: 'Замедляющая',
        icon: '🕸️',
        cost: 30,
        hp: 85,
        damage: 5,
        range: 100,
        fireRate: 1000,
        color: '#DDA0DD',
        size: 20,
        splash: 0,
        slow: 0.6,
        burn: false,
        healRate: 0,
        projectileColor: '#DDA0DD',
        projectileSize: 3,
        isMagic: true,
        upgradeCostFactor: 0.75,
        maxLevel: 5,
        targetPriority: 'fastest',
        canTargetFlying: true,
        description: 'Сильно замедляет врагов.',
        specialEffect: 'slow'
    },
    explosive: {
        name: 'Взрывная',
        icon: '💣',
        cost: 65,
        hp: 55,
        damage: 40,
        range: 70,
        fireRate: 2500,
        color: '#FF4500',
        size: 20,
        splash: 60,
        slow: 0,
        burn: false,
        healRate: 0,
        projectileColor: '#FF4500',
        projectileSize: 8,
        isMagic: true,
        upgradeCostFactor: 0.75,
        maxLevel: 5,
        targetPriority: 'closest',
        canTargetFlying: false,
        description: 'Мощный взрыв по площади.',
        specialEffect: 'explosive'
    },
    drain: {
        name: 'Вытягивающая',
        icon: '🩸',
        cost: 50,
        hp: 80,
        damage: 15,
        range: 95,
        fireRate: 1500,
        color: '#DC143C',
        size: 20,
        splash: 0,
        slow: 0,
        burn: false,
        healRate: 0,
        projectileColor: '#DC143C',
        projectileSize: 4,
        isMagic: true,
        upgradeCostFactor: 0.75,
        maxLevel: 5,
        targetPriority: 'strongest',
        canTargetFlying: true,
        description: 'Вытягивает жизнь, исцеляя крепость.',
        specialEffect: 'drain'
    }
};

// ==================== ДОПОЛНИТЕЛЬНЫЕ ТИПЫ СТЕН ====================
const EXTRA_WALL_TYPES = {
    enchanted: {
        name: 'Зачарованная',
        icon: '✨',
        cost: 60,
        hp: 300,
        color: '#9b59b6',
        size: 30,
        reflectDamage: 8,
        damageBack: 5,
        armor: 4,
        description: 'Отражает урон и замедляет атакующих.',
        specialEffect: 'slow_attackers'
    },
    living: {
        name: 'Живая',
        icon: '🌿',
        cost: 45,
        hp: 180,
        color: '#228B22',
        size: 30,
        reflectDamage: 0,
        damageBack: 0,
        armor: 2,
        description: 'Регенерирует HP со временем.',
        specialEffect: 'regenerate'
    },
    explosive_wall: {
        name: 'Взрывчатая',
        icon: '💥',
        cost: 40,
        hp: 120,
        color: '#FF4500',
        size: 30,
        reflectDamage: 0,
        damageBack: 30,
        armor: 0,
        description: 'Взрывается при разрушении, нанося урон по области.',
        specialEffect: 'death_explosion'
    },
    frozen: {
        name: 'Ледяная',
        icon: '🧊',
        cost: 55,
        hp: 220,
        color: '#00CED1',
        size: 30,
        reflectDamage: 0,
        damageBack: 0,
        armor: 3,
        description: 'Замедляет врагов при контакте.',
        specialEffect: 'freeze_attackers'
    },
    cursed: {
        name: 'Проклятая',
        icon: '💀',
        cost: 70,
        hp: 160,
        color: '#4B0082',
        size: 30,
        reflectDamage: 15,
        damageBack: 15,
        armor: 1,
        description: 'Накладывает проклятие на атакующих.',
        specialEffect: 'curse_attackers'
    }
};

// ==================== ДОПОЛНИТЕЛЬНЫЕ ТИПЫ ЛОВУШЕК ====================
const EXTRA_TRAP_TYPES = {
    fire: {
        name: 'Огненная',
        icon: '🔥',
        cost: 35,
        damage: 40,
        slow: 0,
        duration: 2000,
        uses: 2,
        color: '#FF4500',
        radius: 40,
        teleportRadius: 0,
        description: 'Поджигает врагов.',
        specialEffect: 'burn'
    },
    freeze: {
        name: 'Ледяная',
        icon: '❄️',
        cost: 30,
        damage: 15,
        slow: 0.7,
        duration: 3000,
        uses: 3,
        color: '#00CED1',
        radius: 35,
        teleportRadius: 0,
        description: 'Замораживает врагов.',
        specialEffect: 'freeze'
    },
    stun: {
        name: 'Оглушающая',
        icon: '⚡',
        cost: 25,
        damage: 10,
        slow: 0,
        duration: 2000,
        uses: 2,
        color: '#FFD700',
        radius: 30,
        teleportRadius: 0,
        description: 'Оглушает врагов.',
        specialEffect: 'stun'
    },
    poison_cloud: {
        name: 'Ядовитое облако',
        icon: '☁️',
        cost: 45,
        damage: 8,
        slow: 0,
        duration: 5000,
        uses: 3,
        color: '#00FF00',
        radius: 50,
        teleportRadius: 0,
        description: 'Создаёт ядовитое облако.',
        specialEffect: 'poison_cloud'
    },
    magnet: {
        name: 'Магнит',
        icon: '🧲',
        cost: 50,
        damage: 0,
        slow: 0,
        duration: 3000,
        uses: 2,
        color: '#C0C0C0',
        radius: 80,
        teleportRadius: 0,
        description: 'Притягивает врагов к центру.',
        specialEffect: 'magnet'
    }
};

// ==================== СИСТЕМА ВОЛН РАСШИРЕННАЯ ====================
function calculateWaveDifficulty(waveNumber) {
    const baseDifficulty = 1 + (waveNumber - 1) * DIFFICULTY_SCALE_PER_WAVE;
    const bossBonus = waveNumber % BOSS_WAVE_INTERVAL === 0 ? 0.5 : 0;
    const eliteBonus = waveNumber >= 10 ? 0.2 : 0;
    return baseDifficulty + bossBonus + eliteBonus;
}

function calculateMobCount(waveNumber) {
    const base = WAVE_BASE_MOBS + waveNumber * WAVE_MOBS_PER_LEVEL;
    const scaling = Math.floor(waveNumber / 5) * 2;
    return base + scaling;
}

function getWaveModifiers(waveNumber) {
    const modifiers = [];
    if (waveNumber >= 2) modifiers.push('faster');
    if (waveNumber >= 4) modifiers.push('stronger');
    if (waveNumber >= 6) modifiers.push('tougher');
    if (waveNumber >= 8) modifiers.push('smarter');
    if (waveNumber >= 10) modifiers.push('elite');
    if (waveNumber >= 12) modifiers.push('berserker');
    if (waveNumber >= 14) modifiers.push('legendary');
    if (waveNumber % BOSS_WAVE_INTERVAL === 0) modifiers.push('boss_wave');
    return modifiers;
}

function applyWaveModifiers(mobData, modifiers) {
    for (const mod of modifiers) {
        switch (mod) {
            case 'faster':
                mobData.speedMod *= 1.15;
                break;
            case 'stronger':
                mobData.dmgMod *= 1.2;
                break;
            case 'tougher':
                mobData.hpMod *= 1.25;
                break;
            case 'smarter':
                mobData.aggroRangeMod = 1.3;
                break;
            case 'elite':
                mobData.rewardMod *= 1.5;
                mobData.xpMod = 1.5;
                break;
            case 'berserker':
                mobData.dmgMod *= 1.4;
                mobData.hpMod *= 0.8;
                break;
            case 'legendary':
                mobData.rewardMod *= 2;
                mobData.xpMod = 2;
                mobData.hpMod *= 1.5;
                mobData.dmgMod *= 1.3;
                break;
            case 'boss_wave':
                mobData.rewardMod *= 1.5;
                break;
        }
    }
    return mobData;
}

// ==================== СИСТЕМА МИНИ-ИГР ====================
function startMiniGame(room, type) {
    switch (type) {
        case 'treasure_hunt': {
            const treasureX = Math.random() * MAP_WIDTH;
            const treasureY = Math.random() * MAP_HEIGHT;
            room.broadcastChat('💎 Сокровище появилось на карте! Найди его первым!');
            io.to(room.id).emit('minigame', {
                type: 'treasure_hunt',
                x: treasureX,
                y: treasureY,
                duration: 30000,
                reward: 100
            });
            setTimeout(() => {
                room.broadcastChat('💎 Время на поиск сокровища истекло!');
            }, 30000);
            break;
        }
        case 'speed_build': {
            room.broadcastChat('⚡ Быстрое строительство! Построй как можно больше за 15 секунд!');
            let buildCount = 0;
            const buildListener = (playerId, action) => {
                if (action.type === 'placeWall' || action.type === 'placeTower' || action.type === 'placeTrap') {
                    buildCount++;
                }
            };
            room.on('build', buildListener);
            setTimeout(() => {
                room.off('build', buildListener);
                const reward = buildCount * 10;
                room.broadcastChat(`⚡ Быстрое строительство окончено! Построено: ${buildCount}, Награда: ${reward}💰`);
                for (const [, player] of room.players) {
                    player.coins += reward;
                }
                room.broadcastRoomState();
            }, 15000);
            break;
        }
        case 'kill_rush': {
            room.broadcastChat('💀 Охота на мобов! Убей как можно больше за 20 секунд!');
            let killCount = 0;
            const origProcessMobDeath = processMobDeath;
            const killListener = (mob, rm) => {
                killCount++;
            };
            room.on('mobKill', killListener);
            setTimeout(() => {
                room.off('mobKill', killListener);
                const reward = killCount * 15;
                room.broadcastChat(`💀 Охота окончена! Убито: ${killCount}, Награда: ${reward}💰`);
                for (const [, player] of room.players) {
                    player.coins += reward;
                }
                room.broadcastRoomState();
            }, 20000);
            break;
        }
    }
}

// ==================== СИСТЕМА ОТДЕЛЬНЫХ КОМНАТ ====================
class MiniRoom {
    constructor(parentRoom, type, data) {
        this.parentRoom = parentRoom;
        this.type = type;
        this.data = data;
        this.players = new Map();
        this.timer = null;
        this.active = false;
    }

    addPlayer(player) {
        this.players.set(player.id, player);
        this.active = true;
    }

    removePlayer(playerId) {
        this.players.delete(playerId);
        if (this.players.size === 0) {
            this.end();
        }
    }

    end() {
        this.active = false;
        clearTimeout(this.timer);
    }
}

// ==================== СИСТЕМА АДМИНИСТРИРОВАНИЯ ====================
function handleAdminCommand(player, room, message) {
    if (!message.startsWith('!')) return false;

    const parts = message.split(' ');
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    switch (command) {
        case '!godmode':
            player.hp = 99999;
            player.maxHp = 99999;
            room.broadcastChat(`⚡ ${player.name} включил бог-режим!`);
            return true;

        case '!speed':
            player.speed = PLAYER_BASE_SPEED * 3;
            room.broadcastChat(`⚡ ${player.name} ускорился!`);
            return true;

        case '!coins':
            if (args[0]) {
                player.coins += parseInt(args[0]);
                room.broadcastChat(`💰 ${player.name} получил ${args[0]} монет!`);
            }
            return true;

        case '!healall':
            for (const [, p] of room.players) {
                p.hp = p.maxHp;
                p.isDead = false;
            }
            room.broadcastChat(`💚 ${player.name} исцелил всех!`);
            room.broadcastRoomState();
            return true;

        case '!killall':
            for (const mob of room.mobs) {
                mob.hp = 0;
            }
            room.cleanMobs();
            room.broadcastChat(`💀 ${player.name} убил всех мобов!`);
            room.broadcastRoomState();
            return true;

        case '!spawnboss':
            const bossKeys = Object.keys(MOB_TYPES).filter(k => MOB_TYPES[k].isBoss);
            const bossKey = randomChoice(bossKeys);
            const boss = MOB_TYPES[bossKey];
            room.mobs.push({
                id: ++room.mobIdCounter,
                x: MAP_WIDTH / 2,
                y: -50,
                hp: boss.hp,
                maxHp: boss.hp,
                speed: boss.speed,
                damage: boss.damage,
                reward: boss.reward,
                xp: boss.xp,
                icon: boss.icon,
                color: boss.color,
                size: boss.size,
                name: boss.name,
                behavior: boss.behavior,
                isBoss: true,
                statusEffects: [],
                marked: false,
                lastAttack: 0,
                attackCooldown: boss.attackCooldown,
                aggroRange: boss.aggroRange,
                attackRange: boss.attackRange,
                armor: boss.armor,
                magicResist: boss.magicResist,
                evasion: boss.evasion,
                isFlying: boss.isFlying,
                specialAbility: boss.specialAbility,
                abilities: [...(boss.abilities || [])],
                bossPhase: 1,
                phaseThresholds: boss.phaseThresholds || null,
                lastSpecialAbility: 0
            });
            io.to(room.id).emit('bossSpawn', { name: boss.name, icon: boss.icon });
            room.broadcastChat(`⚠️ ${player.name} призвал ${boss.name}!`);
            return true;

        case '!wave':
            if (args[0]) {
                room.wave = parseInt(args[0]);
                room.spawnWave();
                room.broadcastChat(`⚔️ ${player.name} перешёл к волне ${room.wave}!`);
            }
            return true;

        case '!difficulty':
            if (args[0]) {
                room.difficulty = parseFloat(args[0]);
                room.broadcastChat(`📈 ${player.name} установил сложность ${room.difficulty}!`);
            }
            return true;

        case '!kick':
            if (args[0]) {
                for (const [id, p] of room.players) {
                    if (p.name.toLowerCase() === args[0].toLowerCase()) {
                        room.removePlayer(id);
                        room.broadcastChat(`🚪 ${args[0]} был исключён!`);
                        break;
                    }
                }
            }
            return true;

        case '!mute':
            if (args[0]) {
                for (const [id, p] of room.players) {
                    if (p.name.toLowerCase() === args[0].toLowerCase()) {
                        p.muted = true;
                        room.broadcastChat(`🔇 ${args[0]} замьючен!`);
                        break;
                    }
                }
            }
            return true;

        case '!unmute':
            if (args[0]) {
                for (const [id, p] of room.players) {
                    if (p.name.toLowerCase() === args[0].toLowerCase()) {
                        p.muted = false;
                        room.broadcastChat(`🔊 ${args[0]} размьючен!`);
                        break;
                    }
                }
            }
            return true;

        case '!tp':
            if (args[0]) {
                for (const [id, p] of room.players) {
                    if (p.name.toLowerCase() === args[0].toLowerCase()) {
                        player.x = p.x;
                        player.y = p.y;
                        room.broadcastChat(`✨ ${player.name} телепортировался к ${p.name}!`);
                        break;
                    }
                }
            }
            return true;

        case '!tphere':
            if (args[0]) {
                for (const [id, p] of room.players) {
                    if (p.name.toLowerCase() === args[0].toLowerCase()) {
                        p.x = player.x;
                        p.y = player.y;
                        room.broadcastChat(`✨ ${player.name} телепортировал ${args[0]} к себе!`);
                        break;
                    }
                }
            }
            return true;

        case '!freeze':
            for (const mob of room.mobs) {
                applyStatusEffect(mob, 'stun', 10000);
            }
            room.broadcastChat(`❄️ ${player.name} заморозил всех мобов!`);
            return true;

        case '!unfreeze':
            for (const mob of room.mobs) {
                removeStatusEffect(mob, 'stun');
            }
            room.broadcastChat(`🔥 ${player.name} разморозил всех мобов!`);
            return true;

        case '!resurrect':
            for (const [, p] of room.players) {
                if (p.isDead) {
                    p.isDead = false;
                    p.hp = Math.floor(p.maxHp * 0.5);
                    p.statusEffects = [];
                }
            }
            room.broadcastChat(`✨ ${player.name} воскресил всех!`);
            room.broadcastRoomState();
            return true;

        case '!minigame':
            if (args[0]) {
                startMiniGame(room, args[0]);
            }
            return true;

        case '!stats':
            room.broadcastChat(`📊 Статистика комнаты:`);
            room.broadcastChat(`  Игроков: ${room.players.size}`);
            room.broadcastChat(`  Волна: ${room.wave}/${MAX_WAVES}`);
            room.broadcastChat(`  Счёт: ${room.score}`);
            room.broadcastChat(`  Крепость: ${room.fortressHP}/${room.fortressMaxHP}`);
            room.broadcastChat(`  Мобов: ${room.mobs.length}`);
            room.broadcastChat(`  Убито: ${room.totalKills}`);
            room.broadcastChat(`  Стены: ${room.totalWallsBuilt}`);
            room.broadcastChat(`  Башни: ${room.totalTowersBuilt}`);
            room.broadcastChat(`  Ловушки: ${room.totalTrapsBuilt}`);
            return true;

        case '!reset':
            room.walls = [];
            room.towers = [];
            room.traps = [];
            room.mobs = [];
            room.projectiles = [];
            room.score = 0;
            room.totalKills = 0;
            room.broadcastChat(`🔄 ${player.name} сбросил игру!`);
            room.broadcastRoomState();
            return true;

        case '!pause':
            if (room.gameLoop) {
                clearInterval(room.gameLoop);
                room.gameLoop = null;
                room.broadcastChat(`⏸️ Игра на паузе!`);
            }
            return true;

        case '!resume':
            if (!room.gameLoop && room.phase === 'defense') {
                room.startGameLoop();
                room.broadcastChat(`▶️ Игра продолжается!`);
            }
            return true;

        case '!help':
            room.broadcastChat('🔧 Админ-команды:');
            room.broadcastChat('  !godmode - бог-режим');
            room.broadcastChat('  !speed - ускорение');
            room.broadcastChat('  !coins [кол-во] - монеты');
            room.broadcastChat('  !healall - исцелить всех');
            room.broadcastChat('  !killall - убить всех мобов');
            room.broadcastChat('  !spawnboss - призвать босса');
            room.broadcastChat('  !wave [номер] - перейти к волне');
            room.broadcastChat('  !difficulty [число] - сложность');
            room.broadcastChat('  !kick [имя] - исключить');
            room.broadcastChat('  !mute [имя] - замутить');
            room.broadcastChat('  !unmute [имя] - размутить');
            room.broadcastChat('  !tp [имя] - телепорт');
            room.broadcastChat('  !tphere [имя] - телепорт к себе');
            room.broadcastChat('  !freeze - заморозить мобов');
            room.broadcastChat('  !unfreeze - разморозить');
            room.broadcastChat('  !resurrect - воскресить всех');
            room.broadcastChat('  !minigame [тип] - мини-игра');
            room.broadcastChat('  !stats - статистика');
            room.broadcastChat('  !reset - сброс');
            room.broadcastChat('  !pause - пауза');
            room.broadcastChat('  !resume - продолжить');
            return true;

        default:
            return false;
    }
}

// ==================== СИСТЕМА ПРОКАТИВАНИЯ МОБОВ ====================
function processMobSpecialAbilities(mob, room, now) {
    if (!mob.specialAbility) return;

    switch (mob.specialAbility) {
        case 'charge': {
            const target = findClosestTarget(mob.x, mob.y, Array.from(room.players.values()).filter(p => !p.isDead), 150);
            if (target) {
                const angle = angleFromTo(mob.x, mob.y, target.x, target.y);
                mob.x += Math.cos(angle) * 80;
                mob.y += Math.sin(angle) * 80;
                if (distance(mob.x, mob.y, target.x, target.y) < 30) {
                    target.hp -= Math.floor(mob.damage * 1.8);
                    if (target.hp <= 0) processPlayerDeath(target, room, now);
                    io.to(room.id).emit('explosion', { x: target.x, y: target.y, radius: 30, color: '#8B4513' });
                }
            }
            break;
        }
        case 'stomp': {
            for (const [, player] of room.players) {
                if (player.isDead) continue;
                if (distance(mob.x, mob.y, player.x, player.y) < 80) {
                    player.hp -= Math.floor(mob.damage * 0.8);
                    applyStatusEffect(player, 'stun', 2000);
                    if (player.hp <= 0) processPlayerDeath(player, room, now);
                }
            }
            io.to(room.id).emit('explosion', { x: mob.x, y: mob.y, radius: 80, color: '#8B4513' });
            break;
        }
        case 'regenerate': {
            mob.hp = Math.min(mob.maxHp, mob.hp + Math.floor(mob.maxHp * 0.02));
            break;
        }
        case 'fire_aura': {
            for (const [, player] of room.players) {
                if (player.isDead) continue;
                if (distance(mob.x, mob.y, player.x, player.y) < 50) {
                    player.hp -= 3;
                    if (player.hp <= 0) processPlayerDeath(player, room, now);
                }
            }
            break;
        }
        case 'rage': {
            if (mob.hp < mob.maxHp * 0.3 && mob.rageActive !== true) {
                mob.rageActive = true;
                mob.damage = Math.floor(mob.damage * 1.5);
                mob.speed *= 1.3;
                room.broadcastChat(`😡 ${mob.name} в ярости!`);
            }
            break;
        }
        case 'dark_bolt': {
            const target = findClosestTarget(mob.x, mob.y, Array.from(room.players.values()).filter(p => !p.isDead), mob.attackRange);
            if (target) {
                target.hp -= Math.floor(mob.damage * 1.2);
                mob.hp = Math.min(mob.maxHp, mob.hp + Math.floor(mob.damage * 0.3));
                io.to(room.id).emit('projectile', { fromX: mob.x, fromY: mob.y, toX: target.x, toY: target.y, color: '#4B0082', size: 5 });
                if (target.hp <= 0) processPlayerDeath(target, room, now);
            }
            break;
        }
        case 'summon': {
            if (room.mobs.length < 30) {
                const angle = Math.random() * Math.PI * 2;
                const dist = 60 + Math.random() * 60;
                const minionType = randomChoice(['goblin', 'skeleton', 'imp']);
                const mDef = MOB_TYPES[minionType] || EXTRA_MOB_TYPES[minionType];
                if (mDef) {
                    room.mobs.push({
                        id: ++room.mobIdCounter,
                        x: mob.x + Math.cos(angle) * dist,
                        y: mob.y + Math.sin(angle) * dist,
                        hp: Math.floor(mDef.hp * 0.7), maxHp: Math.floor(mDef.hp * 0.7),
                        speed: mDef.speed, damage: Math.floor(mDef.damage * 0.7),
                        reward: Math.floor(mDef.reward * 0.5), xp: Math.floor(mDef.xp * 0.5),
                        icon: mDef.icon, color: mDef.color, size: Math.floor(mDef.size * 0.8),
                        name: mDef.name, behavior: mDef.behavior,
                        isBoss: false, statusEffects: [], marked: false,
                        lastAttack: 0, attackCooldown: mDef.attackCooldown,
                        aggroRange: mDef.aggroRange, attackRange: mDef.attackRange,
                        armor: mDef.armor, magicResist: mDef.magicResist,
                        evasion: mDef.evasion, isFlying: mDef.isFlying || false,
                        specialAbility: null, abilities: [],
                        bossPhase: 1, phaseThresholds: null, lastSpecialAbility: 0
                    });
                    room.totalMobsSpawned++;
                }
            }
            break;
        }
        case 'fly_over': {
            mob.isFlying = true;
            break;
        }
        case 'lifesteal': {
            const target = findClosestTarget(mob.x, mob.y, Array.from(room.players.values()).filter(p => !p.isDead), mob.attackRange + 10);
            if (target) {
                const dmg = mob.damage;
                target.hp -= dmg;
                mob.hp = Math.min(mob.maxHp, mob.hp + Math.floor(dmg * 0.2));
                if (target.hp <= 0) processPlayerDeath(target, room, now);
            }
            break;
        }
        case 'phase': {
            if (!mob._phaseCooldown || now - mob._phaseCooldown > 5000) {
                mob.isFlying = !mob.isFlying;
                mob._phaseCooldown = now;
                room.broadcastChat(`👻 ${mob.name} ${mob.isFlying ? 'стал призрачным' : 'стал материальным'}!`);
            }
            break;
        }
        case 'petrify': {
            const target = findClosestTarget(mob.x, mob.y, Array.from(room.players.values()).filter(p => !p.isDead), mob.attackRange);
            if (target) {
                applyStatusEffect(target, 'stun', 3000);
                applyStatusEffect(target, 'slow', 3000, { slowFactor: 0.3 });
                room.broadcastChat(`石化 ${target.name}!`);
            }
            break;
        }
        case 'petrifying_gaze': {
            for (const [, player] of room.players) {
                if (player.isDead) continue;
                if (distance(mob.x, mob.y, player.x, player.y) < 120) {
                    if (Math.random() < 0.2) {
                        applyStatusEffect(player, 'stun', 2000);
                    }
                }
            }
            break;
        }
        case 'multi_attack': {
            const targets = Array.from(room.players.values()).filter(p => !p.isDead);
            for (let i = 0; i < Math.min(3, targets.length); i++) {
                const t = targets[i];
                if (distance(mob.x, mob.y, t.x, t.y) < mob.attackRange + 30) {
                    t.hp -= Math.floor(mob.damage * 0.6);
                    if (t.hp <= 0) processPlayerDeath(t, room, now);
                }
            }
            break;
        }
        case 'fire_breath': {
            for (const [, player] of room.players) {
                if (player.isDead) continue;
                if (distance(mob.x, mob.y, player.x, player.y) < 100) {
                    player.hp -= Math.floor(mob.damage * 0.4);
                    applyStatusEffect(player, 'burn', 3000, { damage: 5 });
                    if (player.hp <= 0) processPlayerDeath(player, room, now);
                }
            }
            io.to(room.id).emit('explosion', { x: mob.x, y: mob.y, radius: 100, color: '#FF4500' });
            break;
        }
        case 'bat_swarm': {
            for (let i = 0; i < 6; i++) {
                setTimeout(() => {
                    const t = findClosestTarget(mob.x, mob.y, Array.from(room.players.values()).filter(p => !p.isDead), 150);
                    if (t) {
                        t.hp -= Math.floor(mob.damage * 0.3);
                        if (t.hp <= 0) processPlayerDeath(t, room, Date.now());
                    }
                }, i * 150);
            }
            break;
        }
        case 'triple_bite': {
            const target = findClosestTarget(mob.x, mob.y, Array.from(room.players.values()).filter(p => !p.isDead), mob.attackRange + 20);
            if (target) {
                for (let i = 0; i < 3; i++) {
                    setTimeout(() => {
                        target.hp -= Math.floor(mob.damage * 0.5);
                        if (target.hp <= 0) processPlayerDeath(target, room, Date.now());
                    }, i * 200);
                }
            }
            break;
        }
        case 'howl': {
            for (const [, player] of room.players) {
                if (player.isDead) continue;
                if (distance(mob.x, mob.y, player.x, player.y) < 300) {
                    applyStatusEffect(player, 'slow', 4000, { slowFactor: 0.5 });
                }
            }
            break;
        }
        case 'devour': {
            const target = findClosestTarget(mob.x, mob.y, Array.from(room.players.values()).filter(p => !p.isDead), mob.attackRange);
            if (target) {
                const dmg = Math.floor(mob.damage * 2);
                target.hp -= dmg;
                mob.hp = Math.min(mob.maxHp, mob.hp + Math.floor(dmg * 0.5));
                if (target.hp <= 0) {
                    processPlayerDeath(target, room, now);
                    room.broadcastChat(`🐺 Фенрир поглотил ${target.name}!`);
                }
            }
            break;
        }
        case 'frenzy': {
            if (mob.hp < mob.maxHp * 0.3 && !mob._frenzyUsed) {
                mob._frenzyUsed = true;
                mob.speed *= 1.5;
                mob.damage = Math.floor(mob.damage * 1.5);
                room.broadcastChat(`🐺 Фенрир в ярости!`);
            }
            break;
        }
        case 'hydra_heads': {
            if (mob.hp < mob.maxHp * 0.5 && !mob._headsSpawned) {
                mob._headsSpawned = true;
                for (let i = 0; i < 2; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    const dist = 50 + Math.random() * 50;
                    room.mobs.push({
                        id: ++room.mobIdCounter,
                        x: mob.x + Math.cos(angle) * dist,
                        y: mob.y + Math.sin(angle) * dist,
                        hp: 60, maxHp: 60,
                        speed: 1.0, damage: 15,
                        reward: 20, xp: 10,
                        icon: '🐲', color: '#006400',
                        size: 8, name: 'Голова',
                        behavior: 'swarm',
                        isBoss: false, statusEffects: [], marked: false,
                        lastAttack: 0, attackCooldown: 1200,
                        aggroRange: 120, attackRange: 12,
                        armor: 2, magicResist: 2,
                        evasion: 0, isFlying: false,
                        specialAbility: null, abilities: [],
                        bossPhase: 1, phaseThresholds: null, lastSpecialAbility: 0
                    });
                }
            }
            break;
        }
        case 'poison_bite': {
            const target = findClosestTarget(mob.x, mob.y, Array.from(room.players.values()).filter(p => !p.isDead), mob.attackRange);
            if (target) {
                applyStatusEffect(target, 'poison', 5000, { damage: 8 });
            }
            break;
        }
        case 'tentacle_slam': {
            for (let i = 0; i < 4; i++) {
                setTimeout(() => {
                    const tx = CENTER_X + (Math.random() - 0.5) * 300;
                    const ty = CENTER_Y + (Math.random() - 0.5) * 200;
                    for (const [, player] of room.players) {
                        if (player.isDead) continue;
                        if (distance(tx, ty, player.x, player.y) < 60) {
                            player.hp -= Math.floor(mob.damage * 0.8);
                            applyStatusEffect(player, 'stun', 1000);
                            if (player.hp <= 0) processPlayerDeath(player, room, Date.now());
                        }
                    }
                    io.to(room.id).emit('explosion', { x: tx, y: ty, radius: 60, color: '#191970' });
                }, i * 400);
            }
            break;
        }
        case 'ink_cloud': {
            for (const [, player] of room.players) {
                if (player.isDead) continue;
                if (distance(mob.x, mob.y, player.x, player.y) < 250) {
                    applyStatusEffect(player, 'slow', 4000, { slowFactor: 0.4 });
                }
            }
            break;
        }
        case 'whirlpool': {
            for (const [, player] of room.players) {
                if (player.isDead) continue;
                if (distance(mob.x, mob.y, player.x, player.y) < 350) {
                    const angle = angleFromTo(player.x, player.y, mob.x, mob.y);
                    player.x += Math.cos(angle) * 40;
                    player.y += Math.sin(angle) * 40;
                }
            }
            break;
        }
        case 'deep_dive': {
            if (!mob._diving) {
                mob._diving = true;
                mob.isFlying = true;
                setTimeout(() => {
                    mob.isFlying = false;
                    mob._diving = false;
                    for (const [, player] of room.players) {
                        if (player.isDead) continue;
                        if (distance(mob.x, mob.y, player.x, player.y) < 120) {
                            player.hp -= Math.floor(mob.damage * 1.5);
                            if (player.hp <= 0) processPlayerDeath(player, room, Date.now());
                        }
                    }
                    io.to(room.id).emit('explosion', { x: mob.x, y: mob.y, radius: 120, color: '#191970' });
                }, 2000);
            }
            break;
        }
        case 'dragon_fear': {
            for (const [, player] of room.players) {
                if (player.isDead) continue;
                if (distance(mob.x, mob.y, player.x, player.y) < 250) {
                    applyStatusEffect(player, 'slow', 2500, { slowFactor: 0.5 });
                }
            }
            break;
        }
        case 'frost_aura': {
            for (const [, player] of room.players) {
                if (player.isDead) continue;
                if (distance(mob.x, mob.y, player.x, player.y) < 180) {
                    applyStatusEffect(player, 'slow', 1500, { slowFactor: 0.7 });
                }
            }
            break;
        }
        case 'meteor_rain': {
            for (let i = 0; i < 10; i++) {
                setTimeout(() => {
                    const mx = CENTER_X + (Math.random() - 0.5) * MAP_WIDTH * 0.7;
                    const my = CENTER_Y + (Math.random() - 0.5) * MAP_HEIGHT * 0.7;
                    for (const [, player] of room.players) {
                        if (player.isDead) continue;
                        if (distance(mx, my, player.x, player.y) < 70) {
                            player.hp -= 50;
                            if (player.hp <= 0) processPlayerDeath(player, room, Date.now());
                        }
                    }
                    io.to(room.id).emit('explosion', { x: mx, y: my, radius: 70, color: '#ff4500' });
                }, i * 250);
            }
            break;
        }
        case 'dark_shield': {
            mob.hp = Math.min(mob.maxHp, mob.hp + Math.floor(mob.maxHp * 0.25));
            applyStatusEffect(mob, 'shield', 6000, { shieldAmount: 150 });
            break;
        }
        case 'summon_demons': {
            for (let i = 0; i < 3; i++) {
                const angle = Math.random() * Math.PI * 2;
                const dist = 80 + Math.random() * 80;
                const demonDef = MOB_TYPES.demon;
                if (demonDef) {
                    room.mobs.push({
                        id: ++room.mobIdCounter,
                        x: mob.x + Math.cos(angle) * dist,
                        y: mob.y + Math.sin(angle) * dist,
                        hp: Math.floor(demonDef.hp * 0.6), maxHp: Math.floor(demonDef.hp * 0.6),
                        speed: demonDef.speed, damage: Math.floor(demonDef.damage * 0.6),
                        reward: Math.floor(demonDef.reward * 0.5), xp: Math.floor(demonDef.xp * 0.5),
                        icon: demonDef.icon, color: demonDef.color,
                        size: Math.floor(demonDef.size * 0.8), name: demonDef.name,
                        behavior: demonDef.behavior, isBoss: false,
                        statusEffects: [], marked: false, lastAttack: 0,
                        attackCooldown: demonDef.attackCooldown,
                        aggroRange: demonDef.aggroRange, attackRange: demonDef.attackRange,
                        armor: demonDef.armor, magicResist: demonDef.magicResist,
                        evasion: demonDef.evasion, isFlying: false,
                        specialAbility: null, abilities: [],
                        bossPhase: 1, phaseThresholds: null, lastSpecialAbility: 0
                    });
                }
            }
            break;
        }
        case 'void_blast': {
            for (const [, player] of room.players) {
                if (player.isDead) continue;
                if (distance(mob.x, mob.y, player.x, player.y) < 250) {
                    player.hp -= Math.floor(mob.damage * 0.9);
                    applyStatusEffect(player, 'slow', 3000, { slowFactor: 0.3 });
                    if (player.hp <= 0) processPlayerDeath(player, room, now);
                }
            }
            io.to(room.id).emit('explosion', { x: mob.x, y: mob.y, radius: 250, color: '#40E0D0' });
            break;
        }
        case 'summon_skeletons': {
            for (let i = 0; i < 6; i++) {
                const angle = Math.random() * Math.PI * 2;
                const dist = 40 + Math.random() * 60;
                room.mobs.push({
                    id: ++room.mobIdCounter,
                    x: mob.x + Math.cos(angle) * dist,
                    y: mob.y + Math.sin(angle) * dist,
                    hp: 25, maxHp: 25,
                    speed: 1.3, damage: 6,
                    reward: 5, xp: 3,
                    icon: '💀', color: '#D3D3D3',
                    size: 7, name: 'Дух',
                    behavior: 'swarm', isBoss: false,
                    statusEffects: [], marked: false,
                    lastAttack: 0, attackCooldown: 1200,
                    aggroRange: 120, attackRange: 12,
                    armor: 0, magicResist: 0,
                    evasion: 0, isFlying: false,
                    specialAbility: null, abilities: [],
                    bossPhase: 1, phaseThresholds: null, lastSpecialAbility: 0
                });
            }
            break;
        }
        case 'death_coil': {
            const target = findClosestTarget(mob.x, mob.y, Array.from(room.players.values()).filter(p => !p.isDead), mob.attackRange);
            if (target) {
                const dmg = Math.floor(mob.damage * 1.8);
                target.hp -= dmg;
                mob.hp = Math.min(mob.maxHp, mob.hp + Math.floor(dmg * 0.4));
                if (target.hp <= 0) processPlayerDeath(target, room, now);
            }
            break;
        }
    }
}

// ==================== СИСТЕМА ВЫЗОВА ====================
function processMobCallForHelp(mob, room) {
    if (mob._calledForHelp) return;
    mob._calledForHelp = true;

    const nearbyMobs = room.mobs.filter(m =>
        m.id !== mob.id && distance(mob.x, mob.y, m.x, m.y) < 200 && m.behavior !== 'boss'
    );

    if (nearbyMobs.length > 0) {
        const target = findClosestTarget(mob.x, mob.y, Array.from(room.players.values()).filter(p => !p.isDead), mob.aggroRange);
        if (target) {
            for (const ally of nearbyMobs) {
                ally.aggroRange = Math.max(ally.aggroRange, 300);
            }
        }
    }
}

// ==================== СИСТЕМА КОМБО РАСШИРЕННАЯ ====================
function calculateComboBonus(comboMultiplier) {
    const baseBonus = 1;
    const comboBonus = Math.floor(comboMultiplier * 10);
    const totalBonus = baseBonus + comboBonus;
    return totalBonus;
}

function processComboKill(room) {
    room.comboMultiplier = Math.min(COMBO_MAX, room.comboMultiplier + COMBO_INCREMENT);
    clearTimeout(room.comboTimer);
    room.comboTimer = setTimeout(() => {
        room.comboMultiplier = COMBO_DECAY;
    }, COMBO_TIMEOUT);

    if (room.comboMultiplier >= 3) {
        const bonus = calculateComboBonus(room.comboMultiplier);
        for (const [, player] of room.players) {
            player.coins += Math.floor(bonus / room.players.size);
        }
    }
}

// ==================== СИСТЕМА ТРОФЕВ ====================
function getTrophyForScore(score) {
    if (score >= 5000) return { name: 'Легенда', icon: '👑', tier: 'gold' };
    if (score >= 3000) return { name: 'Ветеран', icon: '🎖️', tier: 'silver' };
    if (score >= 1500) return { name: 'Боец', icon: '⚔️', tier: 'bronze' };
    if (score >= 500) return { name: 'Новичок', icon: '🌱', tier: 'starter' };
    return { name: 'Рекрут', icon: '🔰', tier: 'none' };
}

function getPlayerTitle(player) {
    const trophies = [];
    if (player.level >= 10) trophies.push('Мастер');
    if (player.kills >= 100) trophies.push('Убийца');
    if (player.totalHealingReceived >= 300) trophies.push('Целитель');
    if (player.coins >= 1000) trophies.push('Богач');
    return trophies.length > 0 ? trophies.join(' | ') : '';
}

// ==================== СИСТЕМА СЕЗОНОВ ====================
function getCurrentSeason() {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return { name: 'Весна', icon: '🌸', bonus: 'healing' };
    if (month >= 5 && month <= 7) return { name: 'Лето', icon: '☀️', bonus: 'damage' };
    if (month >= 8 && month <= 10) return { name: 'Осень', icon: '🍂', bonus: 'defense' };
    return { name: 'Зима', icon: '❄️', bonus: 'speed' };
}

function applySeasonBonus(player, season) {
    switch (season.bonus) {
        case 'healing':
            player.maxHp = Math.floor(player.maxHp * 1.1);
            break;
        case 'damage':
            player.damageMod *= 1.1;
            break;
        case 'defense':
            player.shield += 20;
            break;
        case 'speed':
            player.speed *= 1.1;
            break;
    }
}

// ==================== СИСТЕМА КВЕСТОВ ====================
const QUESTS = [
    { id: 'q1', name: 'Первые шаги', desc: 'Убей 10 мобов', target: 10, type: 'kills', reward: 50 },
    { id: 'q2', name: 'Защитник', desc: 'Построй 5 стен', target: 5, type: 'walls', reward: 75 },
    { id: 'q3', name: 'Охотник', desc: 'Убей 50 мобов', target: 50, type: 'kills', reward: 200 },
    { id: 'q4', name: 'Строитель', desc: 'Построй 10 башен', target: 10, type: 'towers', reward: 150 },
    { id: 'q5', name: 'Воин', desc: 'Нанеси 1000 урона', target: 1000, type: 'damage', reward: 100 },
    { id: 'q6', name: 'Волна', desc: 'Дойди до 5 волны', target: 5, type: 'wave', reward: 100 },
    { id: 'q7', name: 'Богач', desc: 'Накопи 300 монет', target: 300, type: 'coins', reward: 75 },
    { id: 'q8', name: 'Уровень', desc: 'Достигни 5 уровня', target: 5, type: 'level', reward: 125 },
    { id: 'q9', name: 'Босс-хантер', desc: 'Убей босса', target: 1, type: 'bossKills', reward: 200 },
    { id: 'q10', name: 'Комбо', desc: 'Набери комбо x3', target: 3, type: 'combo', reward: 75 }
];

function checkQuestProgress(player, room) {
    const completed = [];
    const activeQuests = player.activeQuests || [];

    for (const quest of QUESTS) {
        if (activeQuests.includes(quest.id)) continue;
        if (!player.questProgress) player.questProgress = {};
        if (!player.questProgress[quest.id]) player.questProgress[quest.id] = 0;

        let progress = 0;
        switch (quest.type) {
            case 'kills': progress = player.kills; break;
            case 'walls': progress = room.totalWallsBuilt; break;
            case 'towers': progress = room.totalTowersBuilt; break;
            case 'damage': progress = player.totalDamageDealt; break;
            case 'wave': progress = room.wave; break;
            case 'coins': progress = player.coins; break;
            case 'level': progress = player.level; break;
            case 'bossKills': progress = room.bossesKilled; break;
            case 'combo': progress = Math.floor(room.comboMultiplier); break;
        }

        player.questProgress[quest.id] = progress;

        if (progress >= quest.target) {
            completed.push(quest);
            if (!player.activeQuests) player.activeQuests = [];
            player.activeQuests.push(quest.id);
            player.coins += quest.reward;
            room.broadcastChat(`📜 ${player.name} выполнил квест "${quest.name}"! +${quest.reward}💰`);
        }
    }

    return completed;
}

// ==================== СИСТЕМА ЧАСТИЦ ====================
function createParticleEffect(room, x, y, type, count, color, size, speed, life) {
    const particles = [];
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const spd = speed * (0.5 + Math.random() * 0.5);
        particles.push({
            x, y,
            vx: Math.cos(angle) * spd,
            vy: Math.sin(angle) * spd,
            color: color,
            size: size * (0.5 + Math.random() * 0.5),
            life: life * (0.7 + Math.random() * 0.3),
            maxLife: life,
            type: type
        });
    }
    return particles;
}

function updateParticles(particles) {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.95;
        p.vy *= 0.95;
        p.vy += 0.02;
        p.life--;
        if (p.life <= 0) particles.splice(i, 1);
    }
}

// ==================== СИСТЕМА ВРЕМЕННОГО ПРОГРЕССИРОВАНИЯ ====================
function getTimeBonus(gameDuration) {
    const minutes = gameDuration / 60000;
    if (minutes < 10) return { multiplier: 1.5, name: 'Быстрая игра' };
    if (minutes < 20) return { multiplier: 1.2, name: 'Нормальная' };
    if (minutes < 30) return { multiplier: 1.0, name: 'Длинная' };
    return { multiplier: 0.8, name: 'Марафон' };
}

// ==================== СИСТЕМА ДОСТИЖЕНИЙ РАСШИРЕННАЯ ====================
function checkExtendedAchievements(player, room, event) {
    const newAchievements = [];
    const pa = player.achievements || [];

    switch (event.type) {
        case 'kill':
            if (!pa.includes('first_kill') && player.kills === 1) {
                newAchievements.push({ id: 'first_kill', name: 'Первая кровь', icon: '🩸', reward: 25 });
            }
            if (!pa.includes('kill_10') && player.kills >= 10) {
                newAchievements.push({ id: 'kill_10', name: 'Охотник', icon: '🎯', reward: 50 });
            }
            if (!pa.includes('kill_50') && player.kills >= 50) {
                newAchievements.push({ id: 'kill_50', name: 'Убийца', icon: '💀', reward: 150 });
            }
            if (!pa.includes('kill_100') && player.kills >= 100) {
                newAchievements.push({ id: 'kill_100', name: 'Бог смерти', icon: '☠️', reward: 300 });
            }
            break;

        case 'wave':
            if (!pa.includes('wave_5') && room.wave >= 5) {
                newAchievements.push({ id: 'wave_5', name: 'На полпути', icon: '⚔️', reward: 100 });
            }
            if (!pa.includes('wave_10') && room.wave >= 10) {
                newAchievements.push({ id: 'wave_10', name: 'Ветеран', icon: '🎖️', reward: 200 });
            }
            if (!pa.includes('wave_15') && room.wave >= 15) {
                newAchievements.push({ id: 'wave_15', name: 'Легенда', icon: '👑', reward: 500 });
            }
            break;

        case 'boss':
            if (!pa.includes('boss_kill') && room.bossesKilled >= 1) {
                newAchievements.push({ id: 'boss_kill', name: 'Босс-хантер', icon: '🎯', reward: 150 });
            }
            if (!pa.includes('boss_3') && room.bossesKilled >= 3) {
                newAchievements.push({ id: 'boss_3', name: 'Мастер боссов', icon: '🏆', reward: 400 });
            }
            break;

        case 'level':
            if (!pa.includes('level_5') && player.level >= 5) {
                newAchievements.push({ id: 'level_5', name: 'Опытный', icon: '📈', reward: 75 });
            }
            if (!pa.includes('level_10') && player.level >= 10) {
                newAchievements.push({ id: 'level_10', name: 'Мастер', icon: '🌟', reward: 200 });
            }
            break;

        case 'combo':
            if (!pa.includes('combo_3') && room.comboMultiplier >= 3) {
                newAchievements.push({ id: 'combo_3', name: 'Комбо-старт', icon: '🔥', reward: 50 });
            }
            if (!pa.includes('combo_5') && room.comboMultiplier >= 5) {
                newAchievements.push({ id: 'combo_5', name: 'Комбо-король', icon: '🔥', reward: 150 });
            }
            break;

        case 'score':
            if (!pa.includes('score_500') && player.score >= 500) {
                newAchievements.push({ id: 'score_500', name: 'Сборщик', icon: '⭐', reward: 50 });
            }
            if (!pa.includes('score_1000') && player.score >= 1000) {
                newAchievements.push({ id: 'score_1000', name: 'Звезда', icon: '🌟', reward: 100 });
            }
            if (!pa.includes('score_5000') && player.score >= 5000) {
                newAchievements.push({ id: 'score_5000', name: 'Суперзвезда', icon: '💫', reward: 300 });
            }
            break;

        case 'damage':
            if (!pa.includes('dmg_100') && player.totalDamageDealt >= 100) {
                newAchievements.push({ id: 'dmg_100', name: 'Боевик', icon: '🗡️', reward: 50 });
            }
            if (!pa.includes('dmg_1000') && player.totalDamageDealt >= 1000) {
                newAchievements.push({ id: 'dmg_1000', name: 'Разрушитель', icon: '💥', reward: 150 });
            }
            if (!pa.includes('dmg_5000') && player.totalDamageDealt >= 5000) {
                newAchievements.push({ id: 'dmg_5000', name: 'Катализатор', icon: '💣', reward: 400 });
            }
            break;

        case 'survive':
            if (!pa.includes('survive_5') && room.wave >= 5 && !player.isDead) {
                newAchievements.push({ id: 'survive_5', name: 'Выживший', icon: '🛡️', reward: 100 });
            }
            if (!pa.includes('survive_10') && room.wave >= 10 && !player.isDead) {
                newAchievements.push({ id: 'survive_10', name: 'Неуязвимый', icon: '💪', reward: 250 });
            }
            break;

        case 'heal':
            if (!pa.includes('heal_100') && player.totalHealingReceived >= 100) {
                newAchievements.push({ id: 'heal_100', name: 'Лечимый', icon: '💊', reward: 50 });
            }
            if (!pa.includes('heal_500') && player.totalHealingReceived >= 500) {
                newAchievements.push({ id: 'heal_500', name: 'Бессмертный', icon: '✨', reward: 200 });
            }
            break;

        case 'ability':
            if (!pa.includes('ability_10') && player.totalAbilitiesUsed >= 10) {
                newAchievements.push({ id: 'ability_10', name: 'Маг', icon: '✨', reward: 75 });
            }
            if (!pa.includes('ability_50') && player.totalAbilitiesUsed >= 50) {
                newAchievements.push({ id: 'ability_50', name: 'Архимаг', icon: '🔮', reward: 250 });
            }
            break;

        case 'coins':
            if (!pa.includes('coins_500') && player.coins >= 500) {
                newAchievements.push({ id: 'coins_500', name: 'Капиталист', icon: '💰', reward: 75 });
            }
            if (!pa.includes('coins_1000') && player.coins >= 1000) {
                newAchievements.push({ id: 'coins_1000', name: 'Магнат', icon: '💎', reward: 200 });
            }
            break;
    }

    for (const ach of newAchievements) {
        if (!player.achievements) player.achievements = [];
        player.achievements.push(ach.id);
        player.coins += ach.reward;
        room.broadcastChat(`${ach.icon} ${player.name} получил достижение: ${ach.name}! (+${ach.reward}💰)`);
    }

    return newAchievements;
}

// ==================== СИСТЕМА ПРОДВИНУТОГО УРОНА ====================
function calculateAdvancedDamage(baseDamage, attacker, defender, isMagic, room) {
    let damage = baseDamage;
    let armor = defender.armor || 0;
    let magicResist = defender.magicResist || 0;
    let critChance = attacker.critChance || 0;
    let critMult = attacker.critMult || 1;

    if (isMagic) {
        damage = Math.max(1, damage - magicResist);
    } else {
        damage = Math.max(1, damage - armor);
    }

    let isCrit = false;
    if (critChance > 0 && Math.random() < critChance) {
        damage = Math.floor(damage * critMult);
        isCrit = true;
    }

    const season = getCurrentSeason();
    if (season.bonus === 'damage' && attacker.isPlayer) {
        damage = Math.floor(damage * 1.1);
    }

    const evasion = defender.evasion || 0;
    if (Math.random() < evasion) {
        return { damage: 0, isCrit: false, evaded: true };
    }

    return { damage: Math.floor(damage), isCrit, evaded: false };
}

// ==================== СИСТЕМА ОБРАБОТКИ СОБЫТИЙ ====================
function processGameEvent(room, event) {
    switch (event.type) {
        case 'mobKilled':
            processComboKill(room);
            for (const [, player] of room.players) {
                checkExtendedAchievements(player, room, { type: 'kill' });
            }
            checkQuestProgress(room.players.values().next().value, room);
            break;

        case 'waveCompleted':
            for (const [, player] of room.players) {
                checkExtendedAchievements(player, room, { type: 'wave' });
            }
            break;

        case 'bossDefeated':
            serverStats.bossesKilled++;
            for (const [, player] of room.players) {
                checkExtendedAchievements(player, room, { type: 'boss' });
            }
            break;

        case 'levelUp':
            checkExtendedAchievements(event.player, room, { type: 'level' });
            break;

        case 'abilityUsed':
            checkExtendedAchievements(event.player, room, { type: 'ability' });
            break;

        case 'damageDealt':
            checkExtendedAchievements(event.player, room, { type: 'damage' });
            break;

        case 'coinsEarned':
            checkExtendedAchievements(event.player, room, { type: 'coins' });
            break;

        case 'scoreEarned':
            checkExtendedAchievements(event.player, room, { type: 'score' });
            break;

        case 'healed':
            checkExtendedAchievements(event.player, room, { type: 'heal' });
            break;

        case 'survived':
            checkExtendedAchievements(event.player, room, { type: 'survive' });
            break;

        case 'comboReached':
            for (const [, player] of room.players) {
                checkExtendedAchievements(player, room, { type: 'combo' });
            }
            break;
    }
}

// ==================== СИСТЕМА СТАТИСТИКИ ИГРОКА ====================
class PlayerStatistics {
    constructor() {
        this.gamesPlayed = 0;
        this.gamesWon = 0;
        this.totalKills = 0;
        this.totalDeaths = 0;
        this.totalDamageDealt = 0;
        this.totalDamageTaken = 0;
        this.totalHealingDone = 0;
        this.totalHealingReceived = 0;
        this.totalCoinsEarned = 0;
        this.totalCoinsSpent = 0;
        this.totalXpEarned = 0;
        this.totalWallsBuilt = 0;
        this.totalTowersBuilt = 0;
        this.totalTrapsBuilt = 0;
        this.totalAbilitiesUsed = 0;
        this.totalShotsFired = 0;
        this.totalShotsHit = 0;
        this.totalRevives = 0;
        this.totalRevivedBy = 0;
        this.totalWavesCompleted = 0;
        this.highestWave = 0;
        this.highestScore = 0;
        this.highestLevel = 0;
        this.highestCombo = 0;
        this.longestGame = 0;
        this.shortestWin = Infinity;
        this.averageGameLength = 0;
        this.totalGameTime = 0;
        this.favoriteClass = null;
        this.classPlaytime = {};
        this.killStreaks = [];
        this.bestKillStreak = 0;
        this.achievements = [];
        this.lastPlayed = null;
        this.firstPlayed = null;
    }

    addGame(gameData) {
        this.gamesPlayed++;
        this.totalKills += gameData.kills || 0;
        this.totalDeaths += gameData.deaths || 0;
        this.totalDamageDealt += gameData.damage || 0;
        this.totalDamageTaken += gameData.damageTaken || 0;
        this.totalHealingDone += gameData.healingDone || 0;
        this.totalHealingReceived += gameData.healingReceived || 0;
        this.totalCoinsEarned += gameData.coinsEarned || 0;
        this.totalCoinsSpent += gameData.coinsSpent || 0;
        this.totalXpEarned += gameData.xpEarned || 0;
        this.totalWallsBuilt += gameData.wallsBuilt || 0;
        this.totalTowersBuilt += gameData.towersBuilt || 0;
        this.totalTrapsBuilt += gameData.trapsBuilt || 0;
        this.totalAbilitiesUsed += gameData.abilitiesUsed || 0;
        this.totalShotsFired += gameData.shotsFired || 0;
        this.totalRevives += gameData.revives || 0;
        this.totalRevivedBy += gameData.revivedBy || 0;
        this.totalWavesCompleted += gameData.wavesCompleted || 0;
        this.totalGameTime += gameData.duration || 0;

        if (gameData.won) {
            this.gamesWon++;
            if (gameData.duration < this.shortestWin) this.shortestWin = gameData.duration;
        }

        this.highestWave = Math.max(this.highestWave, gameData.wave || 0);
        this.highestScore = Math.max(this.highestScore, gameData.score || 0);
        this.highestLevel = Math.max(this.highestLevel, gameData.level || 0);
        this.highestCombo = Math.max(this.highestCombo, gameData.maxCombo || 0);
        this.longestGame = Math.max(this.longestGame, gameData.duration || 0);

        if (this.gamesPlayed > 0) {
            this.averageGameLength = this.totalGameTime / this.gamesPlayed;
        }

        if (gameData.className) {
            this.classPlaytime[gameData.className] = (this.classPlaytime[gameData.className] || 0) + (gameData.duration || 0);
            let maxTime = 0;
            for (const [cls, time] of Object.entries(this.classPlaytime)) {
                if (time > maxTime) {
                    maxTime = time;
                    this.favoriteClass = cls;
                }
            }
        }

        this.lastPlayed = Date.now();
        if (!this.firstPlayed) this.firstPlayed = Date.now();
    }

    getWinRate() {
        return this.gamesPlayed > 0 ? ((this.gamesWon / this.gamesPlayed) * 100).toFixed(1) : '0.0';
    }

    getKDR() {
        return this.totalDeaths > 0 ? (this.totalKills / this.totalDeaths).toFixed(2) : this.totalKills.toString();
    }

    getAccuracy() {
        return this.totalShotsFired > 0 ? ((this.totalShotsHit / this.totalShotsFired) * 100).toFixed(1) : '0.0';
    }

    getStatsSummary() {
        return {
            gamesPlayed: this.gamesPlayed,
            gamesWon: this.gamesWon,
            winRate: this.getWinRate(),
            totalKills: this.totalKills,
            totalDeaths: this.totalDeaths,
            kdr: this.getKDR(),
            totalDamage: this.totalDamageDealt,
            totalHealing: this.totalHealingDone,
            highestWave: this.highestWave,
            highestScore: this.highestScore,
            highestLevel: this.highestLevel,
            favoriteClass: this.favoriteClass,
            accuracy: this.getAccuracy(),
            totalGameTime: Math.floor(this.totalGameTime / 60000)
        };
    }
}

// ==================== СИСТЕМА ДОСТИЖЕНИЙ ПОЛНАЯ ====================
const FULL_ACHIEVEMENTS = {
    first_blood: { name: 'Первая кровь', desc: 'Убить первого моба', icon: '🩸', reward: 25, tier: 'bronze' },
    kill_10: { name: 'Охотник', desc: 'Убить 10 мобов', icon: '🎯', reward: 50, tier: 'bronze' },
    kill_50: { name: 'Убийца', desc: 'Убить 50 мобов', icon: '💀', reward: 150, tier: 'silver' },
    kill_100: { name: 'Бог смерти', desc: 'Убить 100 мобов', icon: '☠️', reward: 300, tier: 'gold' },
    kill_500: { name: 'Геноцид', desc: 'Убить 500 мобов', icon: '💀', reward: 1000, tier: 'platinum' },
    wave_5: { name: 'На полпути', desc: 'Дойти до 5 волны', icon: '⚔️', reward: 100, tier: 'bronze' },
    wave_10: { name: 'Ветеран', desc: 'Дойти до 10 волны', icon: '🎖️', reward: 200, tier: 'silver' },
    wave_15: { name: 'Легенда', desc: 'Пройти все 15 волн', icon: '👑', reward: 500, tier: 'gold' },
    boss_kill: { name: 'Босс-хантер', desc: 'Убить первого босса', icon: '🎯', reward: 150, tier: 'bronze' },
    boss_3: { name: 'Мастер боссов', desc: 'Убить 3 боссов', icon: '🏆', reward: 400, tier: 'silver' },
    boss_all: { name: 'Истребитель', desc: 'Убить всех типов боссов', icon: '🐉', reward: 750, tier: 'gold' },
    level_5: { name: 'Опытный', desc: 'Достичь 5 уровня', icon: '📈', reward: 75, tier: 'bronze' },
    level_10: { name: 'Мастер', desc: 'Достичь 10 уровня', icon: '🌟', reward: 200, tier: 'silver' },
    level_15: { name: 'Абсолют', desc: 'Достичь 15 уровня', icon: '💫', reward: 500, tier: 'gold' },
    combo_3: { name: 'Комбо-старт', desc: 'Набрать комбо x3', icon: '🔥', reward: 50, tier: 'bronze' },
    combo_5: { name: 'Комбо-король', desc: 'Набрать комбо x5', icon: '🔥', reward: 150, tier: 'silver' },
    score_500: { name: 'Сборщик', desc: 'Набрать 500 очков', icon: '⭐', reward: 50, tier: 'bronze' },
    score_1000: { name: 'Звезда', desc: 'Набрать 1000 очков', icon: '🌟', reward: 100, tier: 'bronze' },
    score_5000: { name: 'Суперзвезда', desc: 'Набрать 5000 очков', icon: '💫', reward: 300, tier: 'silver' },
    score_10000: { name: 'Легенда', desc: 'Набрать 10000 очков', icon: '👑', reward: 600, tier: 'gold' },
    dmg_100: { name: 'Боевик', desc: 'Нанести 100 урона', icon: '🗡️', reward: 50, tier: 'bronze' },
    dmg_1000: { name: 'Разрушитель', desc: 'Нанести 1000 урона', icon: '💥', reward: 150, tier: 'silver' },
    dmg_5000: { name: 'Катализатор', desc: 'Нанести 5000 урона', icon: '💣', reward: 400, tier: 'gold' },
    dmg_10000: { name: 'Аннигилятор', desc: 'Нанести 10000 урона', icon: '💀', reward: 800, tier: 'platinum' },
    survive_5: { name: 'Выживший', desc: 'Не умереть 5 волн', icon: '🛡️', reward: 100, tier: 'bronze' },
    survive_10: { name: 'Неуязвимый', desc: 'Не умереть 10 волн', icon: '💪', reward: 250, tier: 'silver' },
    heal_100: { name: 'Лечимый', desc: 'Получить 100 лечения', icon: '💊', reward: 50, tier: 'bronze' },
    heal_500: { name: 'Бессмертный', desc: 'Получить 500 лечения', icon: '✨', reward: 200, tier: 'silver' },
    ability_10: { name: 'Маг', desc: 'Использовать 10 способностей', icon: '✨', reward: 75, tier: 'bronze' },
    ability_50: { name: 'Архимаг', desc: 'Использовать 50 способностей', icon: '🔮', reward: 250, tier: 'silver' },
    coins_500: { name: 'Капиталист', desc: 'Накопить 500 монет', icon: '💰', reward: 75, tier: 'bronze' },
    coins_1000: { name: 'Магнат', desc: 'Накопить 1000 монет', icon: '💎', reward: 200, tier: 'silver' },
    builder_10: { name: 'Строитель', desc: 'Построить 10 стен', icon: '🧱', reward: 50, tier: 'bronze' },
    builder_50: { name: 'Архитектор', desc: 'Построить 50 стен', icon: '🏰', reward: 200, tier: 'silver' },
    tower_5: { name: 'Инженер', desc: 'Построить 5 башен', icon: '🗼', reward: 75, tier: 'bronze' },
    tower_20: { name: 'Мастер башен', desc: 'Построить 20 башен', icon: '🏰', reward: 250, tier: 'silver' },
    trap_5: { name: 'Ловкач', desc: 'Построить 5 ловушек', icon: '🪤', reward: 75, tier: 'bronze' },
    trap_20: { name: 'Мастер ловушек', desc: 'Построить 20 ловушек', icon: '🕸️', reward: 250, tier: 'silver' },
    win: { name: 'Победитель', desc: 'Выиграть игру', icon: '🏆', reward: 200, tier: 'bronze' },
    win_solo: { name: 'Одинокий волк', desc: 'Выиграть в одиночку', icon: '🐺', reward: 500, tier: 'gold' },
    win_perfect: { name: 'Безупречно', desc: 'Выиграть без потерь', icon: '💎', reward: 1000, tier: 'platinum' },
    speed_5min: { name: 'Скорострел', desc: 'Пройти 5 волн за 5 минут', icon: '⚡', reward: 150, tier: 'silver' },
    no_damage: { name: 'Невидимка', desc: 'Пройти волну без урона', icon: '👻', reward: 200, tier: 'silver' },
    reviver_3: { name: 'Воскреситель', desc: 'Воскресить 3 союзников', icon: '✨', reward: 100, tier: 'bronze' },
    reviver_10: { name: 'Ангел-хранитель', desc: 'Воскресить 10 союзников', icon: '😇', reward: 300, tier: 'silver' }
};

function checkFullAchievements(player, room) {
    const newAchievements = [];
    const pa = player.achievements || [];

    const checks = [
        { id: 'first_blood', condition: player.kills >= 1 },
        { id: 'kill_10', condition: player.kills >= 10 },
        { id: 'kill_50', condition: player.kills >= 50 },
        { id: 'kill_100', condition: player.kills >= 100 },
        { id: 'kill_500', condition: player.kills >= 500 },
        { id: 'wave_5', condition: room.wave >= 5 },
        { id: 'wave_10', condition: room.wave >= 10 },
        { id: 'wave_15', condition: room.wave >= 15 },
        { id: 'boss_kill', condition: room.bossesKilled >= 1 },
        { id: 'boss_3', condition: room.bossesKilled >= 3 },
        { id: 'level_5', condition: player.level >= 5 },
        { id: 'level_10', condition: player.level >= 10 },
        { id: 'level_15', condition: player.level >= 15 },
        { id: 'combo_3', condition: room.comboMultiplier >= 3 },
        { id: 'combo_5', condition: room.comboMultiplier >= 5 },
        { id: 'score_500', condition: player.score >= 500 },
        { id: 'score_1000', condition: player.score >= 1000 },
        { id: 'score_5000', condition: player.score >= 5000 },
        { id: 'score_10000', condition: player.score >= 10000 },
        { id: 'dmg_100', condition: player.totalDamageDealt >= 100 },
        { id: 'dmg_1000', condition: player.totalDamageDealt >= 1000 },
        { id: 'dmg_5000', condition: player.totalDamageDealt >= 5000 },
        { id: 'dmg_10000', condition: player.totalDamageDealt >= 10000 },
        { id: 'survive_5', condition: room.wave >= 5 && !player.isDead },
        { id: 'survive_10', condition: room.wave >= 10 && !player.isDead },
        { id: 'heal_100', condition: player.totalHealingReceived >= 100 },
        { id: 'heal_500', condition: player.totalHealingReceived >= 500 },
        { id: 'ability_10', condition: player.totalAbilitiesUsed >= 10 },
        { id: 'ability_50', condition: player.totalAbilitiesUsed >= 50 },
        { id: 'coins_500', condition: player.coins >= 500 },
        { id: 'coins_1000', condition: player.coins >= 1000 },
        { id: 'builder_10', condition: room.totalWallsBuilt >= 10 },
        { id: 'builder_50', condition: room.totalWallsBuilt >= 50 },
        { id: 'tower_5', condition: room.totalTowersBuilt >= 5 },
        { id: 'tower_20', condition: room.totalTowersBuilt >= 20 },
        { id: 'trap_5', condition: room.totalTrapsBuilt >= 5 },
        { id: 'trap_20', condition: room.totalTrapsBuilt >= 20 },
        { id: 'reviver_3', condition: room.totalRevives >= 3 },
        { id: 'reviver_10', condition: room.totalRevives >= 10 }
    ];

    for (const check of checks) {
        if (!pa.includes(check.id) && check.condition && FULL_ACHIEVEMENTS[check.id]) {
            const ach = FULL_ACHIEVEMENTS[check.id];
            newAchievements.push({ id: check.id, ...ach });
        }
    }

    for (const ach of newAchievements) {
        if (!player.achievements) player.achievements = [];
        player.achievements.push(ach.id);
        player.coins += ach.reward;
        room.broadcastChat(`${ach.icon} ${player.name} получил: ${ach.name}! (+${ach.reward}💰)`);
    }

    return newAchievements;
}

// ==================== СИСТЕМА КОМНАТ-ОЧЕРЕДИ ====================
class MatchmakingQueue {
    constructor() {
        this.queue = [];
        this.waitingRooms = new Map();
    }

    addToQueue(player, preferences) {
        this.queue.push({
            playerId: player.id,
            playerName: player.name,
            preferences: preferences || {},
            joinTime: Date.now(),
            rating: preferences.rating || 0
        });
    }

    removeFromQueue(playerId) {
        this.queue = this.queue.filter(p => p.playerId !== playerId);
    }

    findMatch(player) {
        const compatible = this.queue.filter(p =>
            p.playerId !== player.id &&
            Math.abs((p.rating || 0) - (player.rating || 0)) < 500
        );

        if (compatible.length >= 2) {
            const match = compatible.slice(0, 6);
            for (const p of match) {
                this.removeFromQueue(p.playerId);
            }
            return match;
        }

        return null;
    }

    getQueueSize() {
        return this.queue.length;
    }

    getAverageWaitTime() {
        if (this.queue.length === 0) return 0;
        const now = Date.now();
        const totalWait = this.queue.reduce((sum, p) => sum + (now - p.joinTime), 0);
        return Math.floor(totalWait / this.queue.length / 1000);
    }
}

// ==================== СИСТЕМА ЧЕМПИОНАТА ====================
class Tournament {
    constructor() {
        this.id = generateRoomId();
        this.players = [];
        this.matches = [];
        this.currentRound = 0;
        this.maxRounds = 5;
        this.phase = 'registration';
        this.startTime = null;
        this.endTime = null;
        this.prizePool = 0;
        this.leaderboard = [];
    }

    register(player) {
        if (this.phase !== 'registration') return false;
        if (this.players.length >= 16) return false;
        if (this.players.find(p => p.id === player.id)) return false;

        this.players.push({
            id: player.id,
            name: player.name,
            score: 0,
            wins: 0,
            losses: 0,
            eliminated: false
        });
        return true;
    }

    start() {
        if (this.players.length < 4) return false;
        this.phase = 'active';
        this.startTime = Date.now();
        this.generateMatches();
        return true;
    }

    generateMatches() {
        this.matches = [];
        const activePlayers = this.players.filter(p => !p.eliminated);
        for (let i = 0; i < activePlayers.length; i += 2) {
            if (i + 1 < activePlayers.length) {
                this.matches.push({
                    id: this.matches.length,
                    player1: activePlayers[i],
                    player2: activePlayers[i + 1],
                    winner: null,
                    score1: 0,
                    score2: 0,
                    completed: false
                });
            }
        }
    }

    recordMatchResult(matchId, winnerId, score1, score2) {
        const match = this.matches.find(m => m.id === matchId);
        if (!match || match.completed) return false;

        match.winner = winnerId;
        match.score1 = score1;
        match.score2 = score2;
        match.completed = true;

        const winner = this.players.find(p => p.id === winnerId);
        const loser = this.players.find(p => p.id === (winnerId === match.player1.id ? match.player2.id : match.player1.id));

        if (winner) { winner.wins++; winner.score += 100; }
        if (loser) { loser.losses++; loser.eliminated = true; }

        return true;
    }

    advanceRound() {
        this.currentRound++;
        if (this.currentRound >= this.maxRounds) {
            this.end();
            return false;
        }
        this.generateMatches();
        return true;
    }

    end() {
        this.phase = 'completed';
        this.endTime = Date.now();
        this.leaderboard = this.players
            .filter(p => !p.eliminated)
            .sort((a, b) => b.score - a.score);
    }

    getLeaderboard() {
        return this.players.sort((a, b) => b.score - a.score);
    }

    getActiveMatch(playerId) {
        return this.matches.find(m =>
            !m.completed && (m.player1.id === playerId || m.player2.id === playerId)
        );
    }
}

// ==================== СИСТЕМА КОМНАТЫ-МАГАЗИН ====================
class ShopSystem {
    constructor() {
        this.items = [
            { id: 'hp_potion', name: 'Зелье здоровья', desc: '+50 HP', cost: 25, effect: { type: 'heal', amount: 50 } },
            { id: 'ammo_pack', name: 'Набор патронов', desc: '+30 патронов', cost: 20, effect: { type: 'ammo', amount: 30 } },
            { id: 'shield_scroll', name: 'Свиток щита', desc: '+50 щит', cost: 35, effect: { type: 'shield', amount: 50 } },
            { id: 'speed_potion', name: 'Зелье скорости', desc: 'Ускорение на 10 сек', cost: 30, effect: { type: 'speed', duration: 10000 } },
            { id: 'damage_scroll', name: 'Свиток урона', desc: '+20% урона на 15 сек', cost: 40, effect: { type: 'damage_boost', duration: 15000, amount: 1.2 } },
            { id: 'crit_scroll', name: 'Свиток крита', desc: '+15% крита на 15 сек', cost: 35, effect: { type: 'crit_boost', duration: 15000, amount: 0.15 } },
            { id: 'revive_token', name: 'Жетон воскрешения', desc: 'Автовоскрешение при смерти', cost: 100, effect: { type: 'auto_revive' } },
            { id: 'treasure_map', name: 'Карта сокровищ', desc: 'Показывает сокровище', cost: 50, effect: { type: 'reveal_treasure' } },
            { id: 'wall_scroll', name: 'Свиток стены', desc: 'Бесплатная каменная стена', cost: 15, effect: { type: 'free_wall', wallType: 'stone' } },
            { id: 'tower_scroll', name: 'Свиток башни', desc: 'Бесплатная стрелковая башня', cost: 20, effect: { type: 'free_tower', towerType: 'arrow' } }
        ];
    }

    buyItem(player, itemId) {
        const item = this.items.find(i => i.id === itemId);
        if (!item) return { success: false, message: 'Предмет не найден' };
        if (player.coins < item.cost) return { success: false, message: 'Недостаточно монет' };

        player.coins -= item.cost;
        return { success: true, item: item.effect, message: `Куплено: ${item.name}` };
    }

    getItems() {
        return this.items;
    }

    applyItem(player, effect, room) {
        switch (effect.type) {
            case 'heal':
                player.hp = Math.min(player.maxHp, player.hp + effect.amount);
                break;
            case 'ammo':
                player.ammo = Math.min(player.maxAmmo, player.ammo + effect.amount);
                break;
            case 'shield':
                player.shield += effect.amount;
                break;
            case 'speed':
                applyStatusEffect(player, 'speed', effect.duration);
                break;
            case 'damage_boost':
                player.damageMod *= effect.amount;
                setTimeout(() => { player.damageMod /= effect.amount; }, effect.duration);
                break;
            case 'crit_boost':
                player.critChance += effect.amount;
                setTimeout(() => { player.critChance -= effect.amount; }, effect.duration);
                break;
            case 'auto_revive':
                player.autoRevive = true;
                break;
            case 'free_wall':
                room.walls.push({
                    id: ++room.wallIdCounter,
                    x: player.x + player.direction.x * 40,
                    y: player.y + player.direction.y * 40,
                    type: effect.wallType,
                    hp: WALL_TYPES[effect.wallType].hp,
                    maxHp: WALL_TYPES[effect.wallType].hp,
                    icon: WALL_TYPES[effect.wallType].icon,
                    color: WALL_TYPES[effect.wallType].color,
                    size: WALL_TYPES[effect.wallType].size,
                    reflectDamage: 0, damageBack: 0, armor: WALL_TYPES[effect.wallType].armor || 0, lastRepair: 0
                });
                break;
            case 'free_tower':
                room.towers.push({
                    id: ++room.towerIdCounter,
                    x: player.x + player.direction.x * 50,
                    y: player.y + player.direction.y * 50,
                    type: effect.towerType,
                    hp: TOWER_TYPES[effect.towerType].hp,
                    maxHp: TOWER_TYPES[effect.towerType].hp,
                    damage: TOWER_TYPES[effect.towerType].damage,
                    range: TOWER_TYPES[effect.towerType].range,
                    fireRate: TOWER_TYPES[effect.towerType].fireRate,
                    icon: TOWER_TYPES[effect.towerType].icon,
                    color: TOWER_TYPES[effect.towerType].color,
                    size: TOWER_TYPES[effect.towerType].size,
                    level: 1, splash: 0, slow: 0, burn: false, healRate: 0,
                    projectileColor: TOWER_TYPES[effect.towerType].projectileColor,
                    projectileSize: TOWER_TYPES[effect.towerType].projectileSize,
                    isMagic: TOWER_TYPES[effect.towerType].isMagic,
                    targetPriority: 'closest', canTargetFlying: true,
                    lastFired: 0, reloading: false,
                    totalShotsFired: 0, totalDamageDealt: 0, totalHealingDone: 0, kills: 0
                });
                break;
        }
        room.broadcastRoomState();
    }
}

// ==================== СИСТЕМА АВТОМАТИЧЕСКОГО СОХРАНЕНИЯ ====================
class AutoSaveSystem {
    constructor() {
        this.saveInterval = 60000;
        this.lastSave = Date.now();
        this.saveData = new Map();
    }

    registerRoom(room) {
        this.saveData.set(room.id, {
            lastSave: Date.now(),
            roomState: 'active'
        });
    }

    saveRoom(room) {
        const data = {
            id: room.id,
            timestamp: Date.now(),
            phase: room.phase,
            wave: room.wave,
            score: room.score,
            fortressHP: room.fortressHP,
            playerCount: room.players.size,
            stats: {
                totalKills: room.totalKills,
                totalDamage: room.totalDamageToMobs,
                totalHealing: room.totalHealingDone,
                totalWalls: room.totalWallsBuilt,
                totalTowers: room.totalTowersBuilt,
                totalTraps: room.totalTrapsBuilt
            }
        };
        this.saveData.set(room.id, data);
    }

    periodicSave(rooms) {
        const now = Date.now();
        if (now - this.lastSave < this.saveInterval) return;

        this.lastSave = now;
        for (const [id, room] of rooms) {
            this.saveRoom(room);
        }
    }
}

// ==================== СИСТЕМА МОНИТОРИНГА ====================
class PerformanceMonitor {
    constructor() {
        this.tickTimes = [];
        this.maxTickTimes = 100;
        this.memoryUsage = [];
        this.connectedPlayers = 0;
        this.activeRooms = 0;
        this.totalEvents = 0;
        this.eventsPerSecond = 0;
        this.lastEventCount = 0;
        this.lastEventCheck = Date.now();
    }

    recordTick(time) {
        this.tickTimes.push(time);
        if (this.tickTimes.length > this.maxTickTimes) {
            this.tickTimes.shift();
        }
    }

    recordMemory() {
        const usage = process.memoryUsage();
        this.memoryUsage.push({
            heap: usage.heapUsed,
            rss: usage.rss,
            timestamp: Date.now()
        });
        if (this.memoryUsage.length > 60) this.memoryUsage.shift();
    }

    recordEvent() {
        this.totalEvents++;
    }

    updateStats(playerCount, roomCount) {
        this.connectedPlayers = playerCount;
        this.activeRooms = roomCount;

        const now = Date.now();
        const elapsed = (now - this.lastEventCheck) / 1000;
        if (elapsed >= 1) {
            this.eventsPerSecond = Math.floor((this.totalEvents - this.lastEventCount) / elapsed);
            this.lastEventCount = this.totalEvents;
            this.lastEventCheck = now;
        }
    }

    getAverageTickTime() {
        if (this.tickTimes.length === 0) return 0;
        const sum = this.tickTimes.reduce((a, b) => a + b, 0);
        return (sum / this.tickTimes.length).toFixed(2);
    }

    getMaxTickTime() {
        return Math.max(...this.tickTimes, 0);
    }

    getMinTickTime() {
        return Math.min(...this.tickTimes, 0);
    }

    getMemoryMB() {
        if (this.memoryUsage.length === 0) return 0;
        const latest = this.memoryUsage[this.memoryUsage.length - 1];
        return (latest.heap / 1024 / 1024).toFixed(1);
    }

    getReport() {
        return {
            averageTickTime: this.getAverageTickTime(),
            maxTickTime: this.getMaxTickTime(),
            minTickTime: this.getMinTickTime(),
            memoryMB: this.getMemoryMB(),
            connectedPlayers: this.connectedPlayers,
            activeRooms: this.activeRooms,
            totalEvents: this.totalEvents,
            eventsPerSecond: this.eventsPerSecond,
            tickSamples: this.tickTimes.length
        };
    }
}

// ==================== ГЛОБАЛЬНЫЕ ЭКЗЕМПЛЯРЫ ====================
const matchmaking = new MatchmakingQueue();
const shop = new ShopSystem();
const autoSave = new AutoSaveSystem();
const monitor = new PerformanceMonitor();
const tournaments = new Map();

// ==================== СИСТЕМА ДОПОЛНИТЕЛЬНЫХ ИВЕНТОВ ====================
function emitSpecialEvent(room, eventType, data) {
    switch (eventType) {
        case 'treasure_spawned': {
            const tx = Math.random() * MAP_WIDTH;
            const ty = Math.random() * MAP_HEIGHT;
            io.to(room.id).emit('specialEvent', {
                type: 'treasure',
                x: tx, y: ty,
                reward: 100 + room.wave * 20,
                duration: 30000
            });
            room.broadcastChat('💎 Сокровище появилось на карте!');
            break;
        }
        case 'power_up_spawned': {
            const types = ['speed', 'damage', 'shield', 'heal', 'coins'];
            const puType = randomChoice(types);
            const px = Math.random() * MAP_WIDTH;
            const py = Math.random() * MAP_HEIGHT;
            io.to(room.id).emit('specialEvent', {
                type: 'powerup',
                powerType: puType,
                x: px, y: py,
                duration: 20000
            });
            room.broadcastChat(`⚡ Бонус "${puType}" появился на карте!`);
            break;
        }
        case 'weather_change': {
            const weathers = ['clear', 'rain', 'fog', 'storm', 'snow'];
            const weather = randomChoice(weathers);
            io.to(room.id).emit('weather', { type: weather });
            room.broadcastChat(`🌤️ Погода изменилась: ${weather}`);
            break;
        }
        case 'night_fall': {
            io.to(room.id).emit('timeOfDay', { period: 'night', visibility: 0.6 });
            room.broadcastChat('🌙 Наступила ночь! Видимость снижена.');
            break;
        }
        case 'dawn': {
            io.to(room.id).emit('timeOfDay', { period: 'day', visibility: 1.0 });
            room.broadcastChat('🌅 Рассвет! Видимость восстановлена.');
            break;
        }
        case 'elite_wave': {
            room.broadcastChat('⭐ Элитная волна! Мобы сильнее, но награда выше!');
            break;
        }
        case 'frenzy_mode': {
            for (const mob of room.mobs) {
                mob.speed *= 1.5;
                mob.damage = Math.floor(mob.damage * 1.3);
            }
            room.broadcastChat('😡 Режим ярости! Мобы ускорились!');
            break;
        }
        case 'shield_rain': {
            for (const [, player] of room.players) {
                if (!player.isDead) {
                    player.shield += 30;
                }
            }
            room.broadcastChat('🛡️ Дождь щитов! Все получили +30 щит!');
            break;
        }
        case 'coin_rain': {
            for (const [, player] of room.players) {
                player.coins += 25;
            }
            room.broadcastChat('💰 Дождь монет! Все получили +25 монет!');
            break;
        }
        case 'healing_wave': {
            for (const [, player] of room.players) {
                if (!player.isDead) {
                    player.hp = Math.min(player.maxHp, player.hp + 50);
                }
            }
            room.broadcastChat('💚 Лечебная волна! Все восстановили 50 HP!');
            break;
        }
        case 'ammo_dump': {
            for (const [, player] of room.players) {
                player.ammo = Math.min(player.maxAmmo, player.ammo + 20);
            }
            room.broadcastChat('🔫 Поднёс патронов! Все получили +20 патронов!');
            break;
        }
    }
}

function processRandomEvent(room) {
    if (Math.random() < 0.02) {
        emitSpecialEvent(room, 'treasure_spawned');
    }
    if (Math.random() < 0.03) {
        emitSpecialEvent(room, 'power_up_spawned');
    }
    if (Math.random() < 0.01) {
        emitSpecialEvent(room, 'weather_change');
    }
    if (Math.random() < 0.005) {
        emitSpecialEvent(room, 'frenzy_mode');
    }
    if (Math.random() < 0.008) {
        emitSpecialEvent(room, 'shield_rain');
    }
    if (Math.random() < 0.01) {
        emitSpecialEvent(room, 'coin_rain');
    }
    if (Math.random() < 0.008) {
        emitSpecialEvent(room, 'healing_wave');
    }
    if (Math.random() < 0.015) {
        emitSpecialEvent(room, 'ammo_dump');
    }
}

// ==================== СИСТЕМА АНАЛИТИКИ ====================
class GameAnalytics {
    constructor() {
        this.sessionData = [];
        this.dailyStats = new Map();
        this.popularClasses = {};
        this.averageWaveReached = 0;
        this.totalGamesPlayed = 0;
        this.totalWins = 0;
        this.averageScore = 0;
        this.averageDuration = 0;
        this.peakConcurrentPlayers = 0;
        this.currentConcurrentPlayers = 0;
    }

    recordGame(room) {
        const gameData = {
            roomId: room.id,
            timestamp: Date.now(),
            duration: Date.now() - (room.gameStartTime || room.createdAt),
            wave: room.wave,
            score: room.score,
            won: room.fortressHP > 0,
            playerCount: room.players.size,
            totalKills: room.totalKills,
            totalDamage: room.totalDamageToMobs,
            difficulty: room.difficulty,
            classes: {}
        };

        for (const [, player] of room.players) {
            const cls = player.roleKey;
            gameData.classes[cls] = (gameData.classes[cls] || 0) + 1;
            this.popularClasses[cls] = (this.popularClasses[cls] || 0) + 1;
        }

        this.sessionData.push(gameData);
        this.totalGamesPlayed++;
        if (gameData.won) this.totalWins++;

        this.averageWaveReached = ((this.averageWaveReached * (this.totalGamesPlayed - 1)) + room.wave) / this.totalGamesPlayed;
        this.averageScore = ((this.averageScore * (this.totalGamesPlayed - 1)) + room.score) / this.totalGamesPlayed;
        this.averageDuration = ((this.averageDuration * (this.totalGamesPlayed - 1)) + gameData.duration) / this.totalGamesPlayed;

        const today = new Date().toISOString().split('T')[0];
        const daily = this.dailyStats.get(today) || { games: 0, wins: 0, totalScore: 0 };
        daily.games++;
        if (gameData.won) daily.wins++;
        daily.totalScore += room.score;
        this.dailyStats.set(today, daily);
    }

    updateConcurrentPlayers(count) {
        this.currentConcurrentPlayers = count;
        this.peakConcurrentPlayers = Math.max(this.peakConcurrentPlayers, count);
    }

    getPopularClasses() {
        const sorted = Object.entries(this.popularClasses)
            .sort((a, b) => b[1] - a[1])
            .map(([cls, count]) => ({ class: cls, count, percentage: ((count / Math.max(1, this.totalGamesPlayed)) * 100).toFixed(1) }));
        return sorted;
    }

    getDailyStats() {
        const stats = [];
        for (const [date, data] of this.dailyStats) {
            stats.push({
                date,
                games: data.games,
                wins: data.wins,
                winRate: data.games > 0 ? ((data.wins / data.games) * 100).toFixed(1) : '0.0',
                averageScore: data.games > 0 ? Math.floor(data.totalScore / data.games) : 0
            });
        }
        return stats.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 30);
    }

    getReport() {
        return {
            totalGames: this.totalGamesPlayed,
            totalWins: this.totalWins,
            overallWinRate: this.totalGamesPlayed > 0 ? ((this.totalWins / this.totalGamesPlayed) * 100).toFixed(1) : '0.0',
            averageWave: this.averageWaveReached.toFixed(1),
            averageScore: Math.floor(this.averageScore),
            averageDuration: Math.floor(this.averageDuration / 1000),
            peakPlayers: this.peakConcurrentPlayers,
            currentPlayers: this.currentConcurrentPlayers,
            popularClasses: this.getPopularClasses().slice(0, 5),
            recentGames: this.sessionData.slice(-10).map(g => ({
                wave: g.wave,
                score: g.score,
                won: g.won,
                players: g.playerCount,
                kills: g.totalKills
            }))
        };
    }
}

const analytics = new GameAnalytics();

// ==================== СИСТЕМА ОБРАБОТКИ СОБЫТИЙ РАСШИРЕННАЯ ====================
function processExtendedEvent(room, eventType, data) {
    switch (eventType) {
        case 'playerJoined':
            analytics.updateConcurrentPlayers(totalPlayers());
            break;
        case 'playerLeft':
            analytics.updateConcurrentPlayers(totalPlayers());
            break;
        case 'gameStarted':
            autoSave.registerRoom(room);
            break;
        case 'gameEnded':
            analytics.recordGame(room);
            for (const [, player] of room.players) {
                checkFullAchievements(player, room);
            }
            break;
        case 'waveCompleted':
            processRandomEvent(room);
            break;
        case 'bossDefeated':
            emitSpecialEvent(room, 'coin_rain');
            emitSpecialEvent(room, 'healing_wave');
            break;
        case 'mobKilled':
            processGameEvent(room, { type: 'mobKilled' });
            break;
        case 'playerDied':
            if (data && data.player && data.player.autoRevive) {
                data.player.isDead = false;
                data.player.hp = Math.floor(data.player.maxHp * 0.5);
                data.player.autoRevive = false;
                room.broadcastChat(`✨ ${data.player.name} автоматически воскрес!`);
            }
            break;
        case 'shopPurchase':
            if (data && data.player && data.effect) {
                shop.applyItem(data.player, data.effect, room);
            }
            break;
        case 'minigameStart':
            startMiniGame(room, data.minigameType);
            break;
        case 'fortressDamaged':
            if (room.fortressHP <= room.fortressMaxHP * 0.25) {
                io.to(room.id).emit('warning', { type: 'fortress_critical', hp: room.fortressHP });
            }
            break;
        case 'comboReached':
            processGameEvent(room, { type: 'comboReached' });
            break;
    }
}

// ==================== СИСТЕМА ОБРАБОТКИ ВХОДЯЩИХ СООБЩЕНИЙ ====================
function processIncomingMessage(socket, data, room) {
    if (!data || !data.type) return;

    switch (data.type) {
        case 'shop_buy':
            if (data.itemId) {
                const result = shop.buyItem(room.players.get(socket.id), data.itemId);
                if (result.success) {
                    socket.emit('shopResult', { success: true, message: result.message });
                    processExtendedEvent(room, 'shopPurchase', {
                        player: room.players.get(socket.id),
                        effect: result.item
                    });
                } else {
                    socket.emit('shopResult', { success: false, message: result.message });
                }
            }
            break;
        case 'shop_browse':
            socket.emit('shopItems', shop.getItems());
            break;
        case 'minigame_start':
            if (data.minigameType) {
                processExtendedEvent(room, 'minigameStart', { minigameType: data.minigameType });
            }
            break;
        case 'tournament_join':
            if (data.tournamentId && tournaments.has(data.tournamentId)) {
                const tournament = tournaments.get(data.tournamentId);
                const player = room.players.get(socket.id);
                if (tournament.register(player)) {
                    socket.emit('tournamentUpdate', { success: true, players: tournament.players.length });
                }
            }
            break;
        case 'analytics_request':
            socket.emit('analytics', analytics.getReport());
            break;
        case 'monitor_request':
            socket.emit('monitor', monitor.getReport());
            break;
        case 'performance_request':
            socket.emit('performance', {
                tickTime: monitor.getAverageTickTime(),
                memory: monitor.getMemoryMB(),
                players: totalPlayers(),
                rooms: rooms.size
            });
            break;
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
        if (room.players.size === 0 && Date.now() - room.createdAt > ROOM_IDLE_TIMEOUT) {
            room.stopGame();
        }
    }
}, ROOM_CLEANUP_INTERVAL);

// ==================== ЗАПУСК ====================
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🏰 Сервер крепости запущен на порту ${PORT}`);
    console.log(`📊 Макс. волн: ${MAX_WAVES}, Макс. игроков: ${MAX_PLAYERS_PER_ROOM}`);
    console.log(`🗺️  Карта: ${MAP_WIDTH}x${MAP_HEIGHT}`);
});
