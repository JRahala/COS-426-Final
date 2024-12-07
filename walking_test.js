class CameraController{
    constructor(camera, domElement){
        this.camera = camera;
        this.domElement = domElement;

        this.speed = 0.5;
        this.mouseSensitivity = 0.1;

        this.keysPressed = {};
        this.isDragging = false;
        this.previousMousePosition = {x:0, y:0};

        this.initControls();
        this.startUpdateLoop();
    }
    
    initControls(){
        window.addEventListener("keydown", (event) => {
            this.keysPressed[event.key.toLowerCase()] = true;
        });
        
        window.addEventListener("keyup", (event) => {
            this.keysPressed[event.key.toLowerCase()] = false;
        });

        this.domElement.addEventListener("mousedown", (event) => {
            this.isDragging = true;
            this.previousMousePosition.x = event.clientX;
            this.previousMousePosition.y = event.clientY;
        });

        this.domElement.addEventListener("mousemove", (event) => {
            if (this.isDragging){
                const dx = event.clientX - this.previousMousePosition.x;
                const dy = event.clientY - this.previousMousePosition.y;

                this.camera.rotation.y -= dx * this.mouseSensitivity * 0.01;
                this.camera.rotation.x -= dy * this.mouseSensitivity * 0.01;
                
                this.camera.rotation.x = Math.max(
                    -Math.PI/2,
                    Math.min(Math.PI/2, this.camera.rotation.x)
                );

                this.previousMousePosition.x = event.clientX;
                this.previousMousePosition.y = event.clientY;
            }
        });

        this.domElement.addEventListener("mouseup", () => {
            this.isDragging = false;
        });
    }

    startUpdateLoop() {
        const update = () => {
            const moveStep = this.speed;
            const forward = new THREE.Vector3();
            this.camera.getWorldDirection(forward);
            const right = new THREE.Vector3();
            right.crossVectors(forward, this.camera.up).normalize();
            const up = this.camera.up.clone();

            if (this.keysPressed["w"]) this.camera.position.add(forward.multiplyScalar(moveStep));
            if (this.keysPressed["s"]) this.camera.position.add(forward.multiplyScalar(-moveStep));
            if (this.keysPressed["a"]) this.camera.position.add(right.multiplyScalar(-moveStep));
            if (this.keysPressed["d"]) this.camera.position.add(right.multiplyScalar(moveStep));
            if (this.keysPressed["arrowup"]) this.camera.position.add(up.multiplyScalar(moveStep));
            if (this.keysPressed["arrowdown"]) this.camera.position.add(up.multiplyScalar(-moveStep));

            requestAnimationFrame(update);
        };

        update();
    }
}

class Transform{
    constructor(){
        this.pos = new THREE.Vector3(0,0,0);
        this.vel = new THREE.Vector3(0,0,0);

        this.mass = 5e3;
        this.inv_mass = 1/this.mass;
        this.net_force = new THREE.Vector3(0,0,0);
    }

    reset_force(){
        this.net_force = new THREE.Vector3(0,0,0);
    }

    add_force(force){
        this.net_force.add(force);
    }

    integrate(deltaTime) {
        if (this.inv_mass > 0) {
            const acceleration = this.net_force.clone().multiplyScalar(this.inv_mass);
            this.vel.add(acceleration.multiplyScalar(deltaTime));
            this.pos.add(this.vel.clone().multiplyScalar(deltaTime));
        }
    }
}


class PlayerPlanetTransform{

    MAX_V = 100;

    constructor(planet) {
        this.planet = planet;
        this.pos = new THREE.Vector2(0,0);
        this.rotation = 0;
        this.vel = new THREE.Vector2(0,0);
        this.net_force = new THREE.Vector2(0,0);
        this.mass = 1;
        this.inv_mass = 1 / this.mass;
    }

    integrate(deltaTime) {
        const acceleration = this.net_force.clone().multiplyScalar(this.inv_mass);

        this.vel.add(acceleration.multiplyScalar(deltaTime));

        if (this.vel.length() > this.MAX_V) {
            this.vel.normalize().multiplyScalar(this.MAX_V);
        }

        this.pos.add(this.vel.clone().multiplyScalar(deltaTime));

        this.reset_force();
    }

    add_force(force){
        this.net_force.add(force);
    }
    reset_force(){
        this.net_force = new THREE.Vector2(0,0);
    }

    to_global() {
        let x = this.planet.geometry.parameters.radius * Math.sin(this.pos.x) * Math.cos(this.pos.y);
        let y = this.planet.geometry.parameters.radius * Math.sin(this.pos.x) * Math.sin(this.pos.y);
        let z = this.planet.geometry.parameters.radius * Math.cos(this.pos.x);
        let vec = new THREE.Vector3(x, y, z);
        return vec.add(this.planet.transform.pos);
    }
}

class PlayerController {

    constructor(planet){
        this.playerPlanetTransform = new PlayerPlanetTransform(planet);

        this.speed = 0.05;
        this.keysPressed = {};

        this.initControls();
        this.startUpdateLoop();

        this.geometry = new THREE.SphereGeometry(1, 32, 16);
        this.material = new THREE.MeshStandardMaterial({
            color: 0xff0000,
            metalness: 0.3,
            roughness: 0.7,
        });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        console.log(this.playerPlanetTransform);
        console.log(this.playerPlanetTransform.to_global());
        this.mesh.position.copy(this.playerPlanetTransform.to_global());
    }
    
    initControls(){
        window.addEventListener("keydown", (event) => {
            this.keysPressed[event.key.toLowerCase()] = true;
        });
        
        window.addEventListener("keyup", (event) => {
            this.keysPressed[event.key.toLowerCase()] = false;
        });
    }

    startUpdateLoop() {
        const update = () => {
            const moveStep = this.speed;
            const forward = new THREE.Vector2();
            forward.x = Math.cos(this.playerPlanetTransform.rotation);
            forward.y = Math.sin(this.playerPlanetTransform.rotation);

            if (this.keysPressed["t"]) this.playerPlanetTransform.pos.add(forward.multiplyScalar(moveStep));
            if (this.keysPressed["g"]) this.playerPlanetTransform.pos.add(forward.multiplyScalar(-moveStep));
            if (this.keysPressed["f"]) this.playerPlanetTransform.rotation -= moveStep;
            if (this.keysPressed["h"]) this.playerPlanetTransform.rotation += moveStep;

            requestAnimationFrame(update);
        };

        update();
    }

    syncTransformToMesh() {
        this.mesh.position.copy(this.playerPlanetTransform.to_global());
    }

    update(deltaTime) {
        this.playerPlanetTransform.integrate(deltaTime);
        this.syncTransformToMesh();
    }
}

class Astronaut{
    constructor(planet){
        this.planet = planet;
    }
}

class Planet{
    constructor(position, size){
        this.transform = new Transform();
        this.transform.pos.copy(position);

        this.geometry = new THREE.SphereGeometry(size, 32, 16);
        this.material = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            metalness: 0.3,
            roughness: 0.7,
        });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.position.copy(position);

        const wireframe = new THREE.WireframeGeometry(this.geometry);
        this.wireframe = new THREE.LineSegments(wireframe, new THREE.LineBasicMaterial({color: 0x000000}));
        this.mesh.add(this.wireframe);
    }

    syncTransformToMesh() {
        this.mesh.position.copy(this.transform.pos);
    }

    update(deltaTime) {
        this.transform.integrate(deltaTime);
        this.transform.reset_force();
        this.syncTransformToMesh();
    }
}

class Model{
    constructor(){
        this.scene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
        this.cameraController = new CameraController(this.camera, this.renderer.domElement);

        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });

        this.planets = [];
        this.astronaut = null;

        /* TODO: Hard coded light for now */
        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(0,0,1);
        this.scene.add(light);
        
        const am_light = new THREE.AmbientLight( 0x404040 ); // soft white light
        this.scene.add(am_light);
        this.camera.position.z = 100;
        this.camera.position.y = 30;

        // Add axis and grid lines
        const gridHelper = new THREE.GridHelper(1000, 100); // Grid of size 1000 units with 100 divisions
        this.scene.add(gridHelper);

        const axesHelper = new THREE.AxesHelper(500); // Axes spanning 500 units in each direction
        this.scene.add(axesHelper);

        // Add space background
        const loader = new THREE.TextureLoader();
        loader.load(
            "https://cdn.pixabay.com/photo/2016/09/08/12/00/stars-1654074_960_720.jpg", // A free-to-use space texture
            (texture) => {
                this.scene.background = texture;
            }
        );
    }

    setup_controller(currentPlanet) {
        this.controller = new PlayerController(currentPlanet);
        this.scene.add(this.controller.mesh);
    }

    set_current_planet(planet){
        this.currentPlanet = planet; // unsure if this works
    }

    add_planet(planet){
        this.planets.push(planet);
        this.scene.add(planet.mesh);
    }

    planets_step(deltaTime) {
        for (const planet of this.planets) {
            for (const other_planet of this.planets) {
                if (planet === other_planet) continue;
                const direction = other_planet.transform.pos
                    .clone()
                    .sub(planet.transform.pos)
                    .normalize();
                const r_sqr = planet.transform.pos.distanceToSquared(other_planet.transform.pos);
                const G = 1;
                const F = G * planet.transform.mass * other_planet.transform.mass / r_sqr;
                direction.multiplyScalar(F);
                planet.transform.add_force(direction);
            }
        }

        this.controller.update(deltaTime);
        for (const planet of this.planets) {
            planet.update(deltaTime);
        }
    }

    startAnimationLoop() {
        const clock = new THREE.Clock();
        const animate = () => {
            const deltaTime = clock.getDelta();
            this.planets_step(deltaTime);
            this.renderer.render(this.scene, this.camera);
            requestAnimationFrame(animate);
        };
        animate();
    }
}

const Mod = new Model();
const P1 = new Planet(new THREE.Vector3(0,20,-20), 10);
Mod.add_planet(P1);
Mod.set_current_planet(P1);
Mod.setup_controller(P1);
Mod.startAnimationLoop();