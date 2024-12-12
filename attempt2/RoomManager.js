export class RoomManager {
    constructor(game, player, roomTemplate) {
        this.game = game;
        this.player = player;
        this.roomTemplate = roomTemplate; // A Room instance to clone for new rooms
        this.rooms = new Map(); // Map of room coordinates to Room objects
        this.activeRadius = 2; // Number of rooms around the player to keep active
    }

    getRoomKey(x, z) {
        return `${x},${z}`;
    }

    generateRoom(x, z) {
        const room = new this.roomTemplate.constructor(
            this.game,
            new Transform3(new THREE.Vector3(x * 50, 0, z * 50), 1),
            this.roomTemplate.material,
            this.roomTemplate.wallMaterial,
            this.roomTemplate.geometry,
            this.roomTemplate.wallGeometry
        );
        room.generate(new THREE.Vector3(x * 50, 0, z * 50));
        this.rooms.set(this.getRoomKey(x, z), room);
        console.log(`Generated room at (${x}, ${z}).`);
    }

    removeRoom(x, z) {
        const key = this.getRoomKey(x, z);
        if (this.rooms.has(key)) {
            const room = this.rooms.get(key);
            room.objects.forEach(obj => this.game.scene.remove(obj.mesh));
            this.game.scene.remove(room.mesh);
            this.rooms.delete(key);
            console.log(`Removed room at (${x}, ${z}).`);
        }
    }

    updateRooms() {
        const playerPos = this.player.transform3.pos;
        const currentX = Math.floor(playerPos.x / 50);
        const currentZ = Math.floor(playerPos.z / 50);

        // Generate new rooms within the active radius
        for (let dx = -this.activeRadius; dx <= this.activeRadius; dx++) {
            for (let dz = -this.activeRadius; dz <= this.activeRadius; dz++) {
                const x = currentX + dx;
                const z = currentZ + dz;
                const key = this.getRoomKey(x, z);
                if (!this.rooms.has(key)) {
                    this.generateRoom(x, z);
                }
            }
        }

        // Remove rooms outside the active radius
        Array.from(this.rooms.keys()).forEach(key => {
            const [x, z] = key.split(',').map(Number);
            if (
                Math.abs(x - currentX) > this.activeRadius ||
                Math.abs(z - currentZ) > this.activeRadius
            ) {
                this.removeRoom(x, z);
            }
        });
    }
}
