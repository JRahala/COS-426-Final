class Transform {
    constructor() {
        this.pos = new THREE.Vector3(0, 0, 0);
        this.vel = new THREE.Vector3(0, 0, 0);
        this.net_force = new THREE.Vector3(0, 0, 0);
    }

    reset_force() {
        this.net_force.set(0, 0, 0);
    }

    add_force(force) {
        this.net_force.add(force);
    }
}

class Planet {
    constructor(position, size) {
        this.geometry = new THREE.SphereGeometry(size, 32, 16);
        this.material = new THREE.MeshStandardMaterial({ color: 0x0088ff });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.position.copy(position);
    }
}

class WalkingSphere {
    constructor(planet) {
        this.planet = planet; // Reference to the planet
        this.geometry = new THREE.SphereGeometry(1, 16, 16);
        this.material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        this.mesh = new THREE.Mesh(this.geometry, this.material);

        this.transform = new Transform();
        this.transform.pos.set(planet.mesh.position.x, planet.mesh.position.y + planet.geometry.parameters.radius + 1, planet.mesh.position.z);

        this.localAxes = new THREE.Group();
        this.localAxes.add(new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), this.mesh.position, 3, 0xff0000)); // Right axis
        this.localAxes.add(new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), this.mesh.position, 3, 0x00ff00)); // Up axis
        this.localAxes.add(new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), this.mesh.position, 3, 0x0000ff)); // Forward axis
        this.mesh.add(this.localAxes);

        this.direction = new THREE.Vector3(0, 0, 1); // The direction the sphere is facing (initially pointing forward in its local space)
        this.rotationSpeed = 0.05; // Adjust this value for smoother rotation
        this.moveSpeed = 0.1; // Adjust for movement speed
    }

    moveOnSurface(direction) {
        const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(this.mesh.quaternion);
        const right = new THREE.Vector3(1, 0, 0).applyQuaternion(this.mesh.quaternion);
        const up = new THREE.Vector3(0, 1, 0).applyQuaternion(this.mesh.quaternion);

        const movement = new THREE.Vector3();

        if (direction === 'w') movement.add(forward); // Move forward
        if (direction === 's') movement.sub(forward); // Move backward
        if (direction === 'a') this.rotateSphere('left'); // Rotate left
        if (direction === 'd') this.rotateSphere('right'); // Rotate right

        movement.normalize().multiplyScalar(this.moveSpeed);

        const newPos = this.transform.pos.clone().add(movement);

        // Keep the sphere on the surface by normalizing the position to the planet's surface
        const directionToCenter = newPos.clone().sub(this.planet.mesh.position).normalize();
        newPos.copy(this.planet.mesh.position).add(directionToCenter.multiplyScalar(this.planet.geometry.parameters.radius + 1));

        this.transform.pos.copy(newPos);
        this.mesh.position.copy(newPos);
    }

    rotateSphere(direction) {
        const angle = this.rotationSpeed;
        const rotationAxis = new THREE.Vector3(0, 1, 0); // Rotate around the Y-axis (vertical axis)
        if (direction === 'left') {
            this.mesh.rotation.y += angle;
        } else if (direction === 'right') {
            this.mesh.rotation.y -= angle;
        }

        // Update local axes
        this.localAxes.rotation.set(0, this.mesh.rotation.y, 0);
    }
}

class Model {
    constructor() {
        this.scene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

        // Red Sphere POV camera
        this.povCamera = new THREE.PerspectiveCamera(75, 200 / 200, 0.1, 1000);

        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        // Second renderer for the red sphere's POV
        this.povRenderer = new THREE.WebGLRenderer();
        this.povRenderer.setSize(200, 200); // Small window for POV
        document.body.appendChild(this.povRenderer.domElement);
        this.povRenderer.domElement.style.position = 'absolute';
        this.povRenderer.domElement.style.top = '10px';
        this.povRenderer.domElement.style.left = '10px';

        window.addEventListener("resize", () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });

        this.camera.position.z = 50;

        // Lighting
        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(0, 1, 1);
        this.scene.add(light);

        const am_light = new THREE.AmbientLight(0x404040);
        this.scene.add(am_light);

        // Create a planet and the walking sphere
        this.planet = new Planet(new THREE.Vector3(0, 0, 0), 10);
        this.walkingSphere = new WalkingSphere(this.planet);

        // Add planet and sphere to the scene
        this.scene.add(this.planet.mesh);
        this.scene.add(this.walkingSphere.mesh);

        // Start the animation loop
        this.startAnimationLoop();

        // Add event listeners for WASD controls
        this.addKeyControls();
    }

    startAnimationLoop() {
        const clock = new THREE.Clock();
        const animate = () => {
            const deltaTime = clock.getDelta();

            // Update global scene
            this.renderer.render(this.scene, this.camera);

            // Update POV (Red sphere's camera)
            this.povCamera.position.copy(this.walkingSphere.mesh.position);
            this.povCamera.lookAt(this.walkingSphere.mesh.position.add(this.walkingSphere.direction)); // Make the camera look at the sphere

            this.povRenderer.render(this.scene, this.povCamera); // Render from the POV camera

            requestAnimationFrame(animate);
        };
        animate();
    }

    addKeyControls() {
        window.addEventListener("keydown", (event) => {
            if (event.key === 'w') this.walkingSphere.moveOnSurface('w');
            if (event.key === 's') this.walkingSphere.moveOnSurface('s');
            if (event.key === 'a') this.walkingSphere.moveOnSurface('a');
            if (event.key === 'd') this.walkingSphere.moveOnSurface('d');
        });
    }
}

// Initialize the model and everything in the scene
const mod = new Model();
