import { Renderable } from "./Renderable.js";


class Room extends Renderable {
    constructor(game, transform3, floorMaterial, wallMaterial, floorGeometry, wallGeometry) {
        super(game, transform3, floorGeometry, floorMaterial);
        this.wallMaterial = wallMaterial;
        this.wallGeometry = wallGeometry;
        this.objects = [];
        this.dimensions = {width:50, height:3, depth:50};
        this.roomOffset = { x: 0, z: 0 };
        this.ceilingMaterial = floorMaterial;
    }

    generate(position) {
        this.game.scene.children = this.game.scene.children.filter(obj => obj.type !== "Mesh");
        this.roomOffset = position;
        // Add Floor
        const floor = new THREE.Mesh(this.geometry, this.material);
        floor.rotation.x = -Math.PI / 2; 
        floor.position.set(position.x, 0, position.z);
        this.game.scene.add(floor);
        // Add Walls to Define the Room
        const wallPositions = [
            { x: position.x, y: 1.5, z: position.z - 25 }, // Back wall
            { x: position.x, y: 1.5, z: position.z + 25 }, // Front wall
            { x: position.x - 25, y: 1.5, z: position.z }, // Left wall
            { x: position.x + 25, y: 1.5, z: position.z }  // Right wall
        ];

        const ceiling = new THREE.Mesh(this.geometry, this.ceilingMaterial);
        ceiling.rotation.x = Math.PI/2;
        ceiling.position.set(position.x, this.dimensions.height, position.z);
        this.game.scene.add(ceiling);

        wallPositions.forEach(pos => {
            const wall = new THREE.Mesh(this.wallGeometry, this.wallMaterial);
            wall.scale.set(this.dimensions.width, this.dimensions.height, 1); 
            wall.position.set(pos.x, pos.y, pos.z);
            if (pos.x !== position.x) wall.rotation.y = Math.PI / 2; // Rotate side walls
            this.game.scene.add(wall);
        });

        console.log(`Room generated at (${position.x}, ${position.z}).`);
    }

    /**
     * Add an object to the room.
     * @param {Renderable} object - An instance of a Renderable object to add.
     */
    addObject(object) {
        this.objects.push(object);
        this.game.scene.add(object.mesh); // Add object to the scene
        console.log(`Object added to room at (${object.transform3.pos.x}, ${object.transform3.pos.z}).`);
    }

    /**
     * Remove an object from the room.
     * @param {Renderable} object - The object to remove.
     */
    removeObject(object) {
        this.objects = this.objects.filter(obj => obj !== object);
        this.game.scene.remove(object.mesh); // Remove object from the scene
        console.log(`Object removed from room.`);
    }

    /**
     * Dynamically update the room based on player position or other game logic.
     * @param {THREE.Vector3} playerPosition - Current player position.
     */
    update(playerPosition) {
        // Example: Add new room generation logic or object spawning logic here
        console.log(`Updating room relative to player position (${playerPosition.x}, ${playerPosition.z}).`);
    }
}