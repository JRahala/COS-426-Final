import { Transform3 } from "./Transform3.js";
import { Renderable } from "./Renderable.js";

export class Game{
    constructor(){
        this.scene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer({antialias: true});
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);

        this.camera.position.set(0, 50, 300); 
        this.camera.lookAt(0, 0, 0);
        console.log("Camera set at", this.camera.position);
        this.keys = {};  
        
        // TODO: Remove hardcoded light
        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(0, 0, 1);
        this.scene.add(light);

        const am_light = new THREE.AmbientLight(0x404040);
        this.scene.add(am_light);
    }

    initRenderer(){
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);
        window.addEventListener("resize", () => {
            this.camera.aspect = window.innerWidth/window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    initControls(){
        window.addEventListener("keydown", (event) => {
            this.keys[event.key.toLowerCase()] = true;
        });

        window.addEventListener("keyup", (event) => {
            this.keys[event.key.toLowerCase()] = false;
        });
    }

    initRenderLoop(){
        const clock = new THREE.Clock();
        const renderLoop = () => {
            const dt = clock.getDelta();
            this.renderer.render(this.scene, this.camera);
            requestAnimationFrame(renderLoop);
        }
        renderLoop();
    }

    initPhysicsLoop(){
        const clock = new THREE.Clock();
        const physicsLoop = () => {
            const dt = clock.getDelta();
            requestAnimationFrame(physicsLoop);
        }
        physicsLoop();
    }
}