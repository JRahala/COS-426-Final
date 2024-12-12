import { Transform3 } from "./Transform3.js";
import { Renderable } from "./Renderable.js";

export class Player extends Renderable{
    constructor(game, transform3, axisSize=20){
        const geometry = new THREE.SphereGeometry(10, 32, 16);
        super(game, transform3, geometry, axisSize);

        const collisionGeometry = new THREE.SphereGeometry(20, 16, 16);
        const collisionSphere = new Renderable(game, transform3, collisionGeometry);
    }

    

}