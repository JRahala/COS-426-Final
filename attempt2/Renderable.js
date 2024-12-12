import { Transform3 } from "./Transform3.js";

export class Renderable{
    constructor(game, transform3, geometry, material=null, axisSize=20){
        this.transform3 = transform3;
        this.geometry = geometry;
        this.material = material === null ? new THREE.MeshStandardMaterial() : material;
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.game = game;

        this.forwardAxis = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), this.transform3.pos, 50, 0xff0000);
        this.upAxis = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), this.transform3.pos, 50, 0x00ff00);
        this.rightAxis = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), this.transform3.pos, 50, 0x0000ff);
        this.initSyncTransformToMesh();

        // Automatically add to scene
        this.game.scene.add(this.mesh);
        this.game.scene.add(this.forwardAxis);
        this.game.scene.add(this.upAxis);
        this.game.scene.add(this.rightAxis);
    }

    initSyncTransformToMesh(){
        const syncTransformToMesh = () => {
            const {forward, up, right} = this.transform3.getGlobalOrientation();
            
            this.mesh.position.copy(this.transform3.pos);
            this.mesh.quaternion.copy(this.transform3.rot);

            this.forwardAxis.position.copy(this.transform3.pos);
            this.upAxis.position.copy(this.transform3.pos);
            this.rightAxis.position.copy(this.transform3.pos);

            this.forwardAxis.setDirection(forward);
            this.upAxis.setDirection(up);
            this.rightAxis.setDirection(right);

            requestAnimationFrame(syncTransformToMesh);
        }
        syncTransformToMesh();
    }
}