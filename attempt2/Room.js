import { Transform3 } from "./Transform3.js";
import { Renderable } from "./Renderable.js";

export class Room extends Renderable {
    constructor(game, transform3, floorMaterial, wallMaterial, floorGeometry, wallGeometry) {
        super(game, transform3, floorGeometry, floorMaterial);
        this.wallMaterial = wallMaterial;
        this.wallGeometry = wallGeometry;
        this.roomOffset = { x: 0, z: 0 }; // Room's central offset
    }

    generate(position) {
        // Clear old room objects
        this.game.scene.children = this.game.scene.children.filter(obj => obj.type !== "Mesh");

        // Update room offset
        this.roomOffset = position;

        // Add Floor
        const floor = new THREE.Mesh(this.geometry, this.material);
        floor.rotation.x = -Math.PI / 2; // Align horizontally
        floor.position.set(position.x, 0, position.z);
        this.game.scene.add(floor);

        // Add Walls to Define the Room
        const wallPositions = [
            { x: position.x, y: 1.5, z: position.z - 25 }, // Back wall
            { x: position.x, y: 1.5, z: position.z + 25 }, // Front wall
            { x: position.x - 25, y: 1.5, z: position.z }, // Left wall
            { x: position.x + 25, y: 1.5, z: position.z }  // Right wall
        ];

        wallPositions.forEach(pos => {
            const wall = new THREE.Mesh(this.wallGeometry, this.wallMaterial);
            wall.scale.set(50, 3, 1); // Scale walls to span the room
            wall.position.set(pos.x, pos.y, pos.z);
            if (pos.x !== position.x) wall.rotation.y = Math.PI / 2; // Rotate side walls
            this.game.scene.add(wall);
        });

        console.log(`Room generated at (${position.x}, ${position.z}).`);
    }
}

// Instantiate Room
const transform3 = new Transform3(); // Assume Transform3 is defined elsewhere
const game = { scene: scene }; // Mock game object for context
const room = new Room(game, transform3, floorMaterial, wallMaterial, floorGeometry, wallGeometry);

// Transition Logic
function checkRoomTransition() {
    const roomCenterX = room.roomOffset.x;
    const roomCenterZ = room.roomOffset.z;
    const roomSize = 25; // Half the size of the room

    if (camera.position.z < roomCenterZ - roomSize || camera.position.z > roomCenterZ + roomSize ||
        camera.position.x < roomCenterX - roomSize || camera.position.x > roomCenterX + roomSize) {

        const newRoomPosition = {
            x: Math.round(camera.position.x / 50) * 50,
            z: Math.round(camera.position.z / 50) * 50
        };

        room.generate(newRoomPosition);
    }
}