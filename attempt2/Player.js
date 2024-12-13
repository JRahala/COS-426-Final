import { Renderable } from "./Renderable.js";

export class Player extends Renderable{
    constructor(game, transform3, axisSize=20){
        const geometry = new THREE.SphereGeometry(10, 32, 16);
        super(game, transform3, geometry, axisSize);

        const collisionGeometry = new THREE.SphereGeometry(20, 16, 16);
        const collisionMaterial = new THREE.MeshStandardMaterial({
            color: 0xffff00,
            transparent: true,
            opacity: 0.5,
        });
        this.collisionSphere = new Renderable(game, transform3, collisionGeometry, collisionMaterial);
        this.raycaster = new THREE.Raycaster();
    }

    updateCollisions(dt) {
        const objectsToCheck = this.game.scene.children.filter(
            (object) => object !== this.collisionSphere.mesh && object.isMesh
        );

        this.raycaster.set(this.transform3.pos, new THREE.Vector3(0, 0, 0));
        const intersections = this.raycaster.intersectObjects(objectsToCheck, true);
        intersections.forEach((intersection) => {
            console.log('Collided with face:', intersection.face);
            console.log('Intersection details:', intersection);
        });
    }

<<<<<<< HEAD
    controlHandler(dt){
        if (this.game.keys["w"]) console.log("W pressed");
        if (this.game.keys["a"]) console.log("A pressed");
        if (this.game.keys["s"]) console.log("S pressed");
        if (this.game.keys["d"]) console.log("D pressed");
    }
=======
    updateMovement(dt) {
        const speed = 10;
        const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.transform3.rot);
        if (this.game.keys['w']) this.transform3.pos.addScaledVector(forward, speed * dt);
        if (this.game.keys['s']) this.transform3.pos.addScaledVector(forward, -speed * dt);
    
        const right = new THREE.Vector3(1, 0, 0).applyQuaternion(this.transform3.rot);
        if (this.game.keys['d']) this.transform3.pos.addScaledVector(right, speed * dt);
        if (this.game.keys['a']) this.transform3.pos.addScaledVector(right, -speed * dt);
    }
    
>>>>>>> c05e72e207c00ee66ac9a74255a8003a36ca8685
}