const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));
app.get('/health', (req, res) => res.send('OK'));

const ROLES = ['Строитель', 'Стрелок', 'Инженер', 'Медик', 'Маг', 'Разведчик'];
const WALL_HP = 100;
const MOB_TYPES = [
    { name: 'Гоблин', hp: 30, speed: 1, damage: 5 },
    { name: 'Орк', hp: 80, speed: 0.5, damage: 15 },
    { name: 'Дракон', hp: 200, speed: 0.3, damage: 40 }
];

const rooms = new Map();

class GameRoom {
    constructor(id) {
        this.id = id;
        this.players = new Map();
        this.phase = 'waiting';
        this.walls = [];
        this.towers = [];
        this.mobs = [];
        this.wave = 0;
        this.score = 0;
        this.gameLoop = null;
        this.waveTimer = null;
        this.fortressHP = 500;
    }

    addPlayer(socket, name) {
        if (this.players.size >= 6) {
            socket.emit('error_msg', 'Комната полна');
            return false;
        }
        const roleIndex = this.players.size;
        const player = {
            id: socket.id,
            name,
            role: ROLES[roleIndex],
            x: 400 + (roleIndex % 3) * 100,
            y: 300 + Math.floor(roleIndex / 3) * 100,
            hp: 100,
            maxHp: 100,
            ammo: 50,
            coins: 100,
            ready: false
        };
        this.players.set(socket.id, player);
        this.broadcastRoomState();
        return true;
    }

    removePlayer(playerId) {
        this.players.delete(playerId);
        if (this.players.size === 0) this.stopGame();
        this.broadcastRoomState();
    }

    broadcast(data) {
        io.to(this.id).emit('roomState', data);
    }

    broadcastRoomState() {
        this.broadcast({
            phase: this.phase,
            players: Array.from(this.players.values()).map(p => ({
                id: p.id, name: p.name, role: p.role,
                hp: p.hp, maxHp: p.maxHp, ready: p.ready,
                x: p.x, y: p.y
            })),
            walls: this.walls,
            towers: this.towers,
            wave: this.wave,
            score: this.score,
            fortressHP: this.fortressHP,
            mobCount: this.mobs.length
        });
    }

    handleAction(playerId, action) {
        const player = this.players.get(playerId);
        if (!player) return;

        if (action.type === 'ready') {
            player.ready = action.ready;
            if (Array.from(this.players.values()).every(p => p.ready) && this.players.size >= 1) {
                this.startBuildPhase();
            }
            this.broadcastRoomState();
        }

        if (this.phase === 'build') {
            if (action.type === 'placeWall' && player.coins >= 10) {
                this.walls.push({ x: action.x, y: action.y, hp: WALL_HP, maxHp: WALL_HP });
                player.coins -= 10;
                this.broadcastRoomState();
            }
            if (action.type === 'placeTower' && player.coins >= 25) {
                this.towers.push({ x: action.x, y: action.y, range: 100, damage: 10 });
                player.coins -= 25;
                this.broadcastRoomState();
            }
            if (action.type === 'endBuild') {
                this.startDefensePhase();
            }
        }

        if (this.phase === 'defense') {
            if (action.type === 'move') {
                player.x = Math.max(20, Math.min(780, player.x + action.dx));
                player.y = Math.max(20, Math.min(580, player.y + action.dy));
                io.to(this.id).emit('playerMove', { id: playerId, x: player.x, y: player.y });
            }
            if (action.type === 'shoot') {
                this.handleShoot(player, action.targetX, action.targetY);
            }
            if (action.type === 'heal' && player.role === 'Медик' && player.ammo >= 5) {
                const target = this.players.get(action.targetId);
                if (target) {
                    target.hp = Math.min(target.maxHp, target.hp + 30);
                    player.ammo -= 5;
                    this.broadcastRoomState();
                }
            }
        }
    }

    handleShoot(player, tx, ty) {
        if (player.ammo <= 0) return;
        player.ammo--;

        for (let i = this.mobs.length - 1; i >= 0; i--) {
            const mob = this.mobs[i];
            const dist = Math.hypot(mob.x - tx, mob.y - ty);
            if (dist < 30) {
                let damage = 15;
                if (player.role === 'Стрелок') damage = 30;
                if (player.role === 'Маг') damage = 25;
                mob.hp -= damage;
                if (mob.hp <= 0) {
                    this.mobs.splice(i, 1);
                    this.score += 10;
                    player.coins += 5;
                }
                break;
            }
        }

        io.to(this.id).emit('shoot', { playerId: player.id, tx, ty });
        this.broadcastRoomState();
    }

    startBuildPhase() {
        this.phase = 'build';
        for (const [, player] of this.players) {
            player.coins = 100;
            player.ready = false;
        }
        this.broadcastRoomState();
        io.to(this.id).emit('phaseChange', { phase: 'build', message: 'Стройте крепость! 60 секунд.' });
        this.waveTimer = setTimeout(() => this.startDefensePhase(), 60000);
    }

    startDefensePhase() {
        clearTimeout(this.waveTimer);
        this.phase = 'defense';
        this.wave = 1;
        this.spawnWave();
        io.to(this.id).emit('phaseChange', { phase: 'defense', message: 'Волна 1! Защищайте крепость!' });
        this.startGameLoop();
    }

    spawnWave() {
        const count = 3 + this.wave * 2;
        for (let i = 0; i < count; i++) {
            const type = MOB_TYPES[Math.floor(Math.random() * Math.min(this.wave, MOB_TYPES.length))];
            const side = Math.floor(Math.random() * 4);
            let x, y;
            switch (side) {
                case 0: x = Math.random() * 800; y = -20; break;
                case 1: x = 820; y = Math.random() * 600; break;
                case 2: x = Math.random() * 800; y = 620; break;
                case 3: x = -20; y = Math.random() * 600; break;
            }
            this.mobs.push({ x, y, hp: type.hp, maxHp: type.hp, speed: type.speed, damage: type.damage, name: type.name });
        }
    }

    startGameLoop() {
        this.gameLoop = setInterval(() => {
            this.updateMobs();
            this.broadcastRoomState();
            if (this.mobs.length === 0) {
                this.wave++;
                if (this.wave > 10) {
                    this.endGame(true);
                } else {
                    this.spawnWave();
                    io.to(this.id).emit('phaseChange', { phase: 'defense', message: `Волна ${this.wave}!` });
                    for (const [, player] of this.players) player.ammo += 20;
                }
            }
            if (this.fortressHP <= 0) this.endGame(false);
        }, 500);
    }

    updateMobs() {
        const centerX = 400, centerY = 300;
        for (let i = this.mobs.length - 1; i >= 0; i--) {
            const mob = this.mobs[i];
            const angle = Math.atan2(centerY - mob.y, centerX - mob.x);
            mob.x += Math.cos(angle) * mob.speed * 2;
            mob.y += Math.sin(angle) * mob.speed * 2;

            for (let j = this.walls.length - 1; j >= 0; j--) {
                const wall = this.walls[j];
                if (Math.hypot(mob.x - wall.x, mob.y - wall.y) < 30) {
                    wall.hp -= mob.damage;
                    if (wall.hp <= 0) this.walls.splice(j, 1);
                    mob.hp -= 5;
                    if (mob.hp <= 0) { this.mobs.splice(i, 1); this.score += 5; break; }
                }
            }

            if (this.mobs[i] && Math.hypot(mob.x - centerX, mob.y - centerY) < 40) {
                this.fortressHP -= mob.damage;
                this.mobs.splice(i, 1);
            }
        }

        for (const tower of this.towers) {
            for (let i = this.mobs.length - 1; i >= 0; i--) {
                const mob = this.mobs[i];
                if (Math.hypot(mob.x - tower.x, mob.y - tower.y) < tower.range) {
                    mob.hp -= tower.damage;
                    if (mob.hp <= 0) { this.mobs.splice(i, 1); this.score += 5; }
                }
            }
        }
    }

    endGame(won) {
        clearInterval(this.gameLoop);
        this.phase = 'ended';
        io.to(this.id).emit('gameEnd', {
            won, score: this.score,
            message: won ? `Победа! Счёт: ${this.score}` : `Поражение! Счёт: ${this.score}`
        });
    }

    stopGame() {
        clearInterval(this.gameLoop);
        clearTimeout(this.waveTimer);
        rooms.delete(this.id);
    }
}

io.on('connection', (socket) => {
    console.log('Подключён:', socket.id);
    let currentRoom = null;

    socket.on('join', (data) => {
        const roomId = data.room || 'default';
        socket.join(roomId);
        if (!rooms.has(roomId)) rooms.set(roomId, new GameRoom(roomId));
        const room = rooms.get(roomId);
        if (room.addPlayer(socket, data.name)) {
            currentRoom = room;
        }
    });

    socket.on('action', (action) => {
        if (currentRoom) currentRoom.handleAction(socket.id, action);
    });

    socket.on('disconnect', () => {
        if (currentRoom) currentRoom.removePlayer(socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Сервер запущен на порту ${PORT}`));