class Transform3{
	static globalDamping = 0.90;
	static G = 1;

	constructor(pos, vel, mass){
		this.pos = pos;
		this.vel = vel;
        this.orientation = new THREE.Quaternion();

		this.netForce = new THREE.Vector3(0.0,0.0,0.0);
		this.mass = mass;
		if (this.mass == 0) this.invMass = 1e-12;
		else this.invMass = 1/this.mass;
	}

	resetForce(){
		this.netForce = new THREE.Vector3(0.0,0.0,0.0);
	}

	applyForce(newForce){
		this.netForce.add(newForce);
	}

	integrate(dt){
		const acc = this.netForce.clone().multiplyScalar(this.invMass);
		this.vel.addScaledVector(acc, dt);
		this.pos.addScaledVector(this.vel, dt);
		this.vel.multiplyScalar(Transform3.globalDamping); //- apply this when I figure out how to incorporate dt inexpensively
	}

	calculateGravity(other){
		const distanceVector = new THREE.Vector3().subVectors(other.pos, this.pos);
		const distanceSquared = distanceVector.lengthSq();
		if (distanceSquared < 1e-12) return new THREE.Vector3(0, 0, 0);
		const forceMagnitude = (Transform3.G * this.mass * other.mass) / distanceSquared;
		const force = distanceVector.normalize().multiplyScalar(forceMagnitude);
		console.log(force);
		return force;
	}

    getOrientationVectors(){
        const forward = new THREE.Vector3(0,0,1);
        const up = new THREE.Vector3(0,1,0);
        const right = new THREE.Vector3(1,0,0);

        forward.applyQuaternion(this.orientation);
        up.applyQuaternion(this.orientation);
        right.applyQuaternion(this.orientation);

        return {forward, up, right};
    }
	
    changeUpDirection(newUp){
        newUp.normalize();
        const rotationAxis = new THREE.Vector3().crossVectors(this.getOrientationVectors().up, newUp);
        if (rotationAxis.lengthSq() === 0) return;
        rotationAxis.normalize();
        
        const angle = Math.acos(this.getOrientationVectors().up.dot(newUp));
        const rotationQuaternion = new THREE.Quaternion();
        rotationQuaternion.setFromAxisAngle(rotationAxis, angle);
        this.orientation.multiply(rotationQuaternion);
    }

    applyLocalForce(localForce){
        const globalForce = localForce.clone().applyQuaternion(this.orientation);
        this.applyForce(globalForce);
    }
}


class Renderable{
	constructor(scene, transform3, geometry, material){
		this.scene = scene;
		this.transform3 = transform3;

		this.geometry = geometry;
		this.material = material;
		this.mesh = new THREE.Mesh(this.geometry, this.material);
		this.syncTransformToMesh();
	}

	syncTransformToMesh(){
		const sync = () => {
			this.mesh.position.copy(this.transform3.pos);
			this.mesh.quaternion.copy(this.transform3.orientation);
			requestAnimationFrame(sync);
		};
		sync();	
	}

	addToScene(){
		this.scene.add(this.mesh);
	}

	removeFromScene(){
		this.scene.remove(this.mesh);
	}

	static checkEdgeSphereIntersection(v1, v2, center, radius) {
		const edge = new THREE.Vector3().subVectors(v2, v1);
		const sphereToEdgeStart = new THREE.Vector3().subVectors(v1, center);
		const projectionLength = sphereToEdgeStart.dot(edge) / edge.length();
		const closestPointOnEdge = sphereToEdgeStart.add(edge.normalize().multiplyScalar(projectionLength));
		return closestPointOnEdge.length() <= radius;
	}

	checkSphereFaceIntersection(sphere) {
		const facesInside = [];
		const vertex = new THREE.Vector3();
		const sphereCenter = sphere.mesh.position;
		const sphereRadius = sphere.geometry.parameters.radius;
		const positionAttribute = this.geometry.attributes.position;
		const indexAttribute = this.geometry.index;
	
		for (let i = 0; i < indexAttribute.count; i += 3) {
			const v0 = new THREE.Vector3().fromBufferAttribute(positionAttribute, indexAttribute.getX(i + 0)).applyMatrix4(this.mesh.matrixWorld);
			const v1 = new THREE.Vector3().fromBufferAttribute(positionAttribute, indexAttribute.getX(i + 1)).applyMatrix4(this.mesh.matrixWorld);
			const v2 = new THREE.Vector3().fromBufferAttribute(positionAttribute, indexAttribute.getX(i + 2)).applyMatrix4(this.mesh.matrixWorld);

			const vertexInside = 
				v0.distanceTo(sphereCenter) <= sphereRadius ||
				v1.distanceTo(sphereCenter) <= sphereRadius ||
				v2.distanceTo(sphereCenter) <= sphereRadius;
	
			const edgeIntersect = 
				Renderable.checkEdgeSphereIntersection(v0, v1, sphereCenter, sphereRadius) ||
				Renderable.checkEdgeSphereIntersection(v1, v2, sphereCenter, sphereRadius) ||
				Renderable.checkEdgeSphereIntersection(v2, v0, sphereCenter, sphereRadius);
	
			if (vertexInside || edgeIntersect) {
				facesInside.push([v0, v1, v2]);
			}
		}
		return facesInside;
	}
}


class Game{
	constructor(){
        this.scene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
		console.log("The camera is set at ", this.camera.position);

		// Game objects
		this.planets = []
		this.astronaut = null;

		// Rendered updates
		this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
		
		// Keyboard strokes
		this.keysPressed = {};
	
		// TODO: REMOVE HARD CODED LIGHT
		const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(0,0,1);
        this.scene.add(light);
        
        const am_light = new THREE.AmbientLight( 0x404040 );
        this.scene.add(am_light);
	}

	initControls(){
		window.addEventListener("keydown", (event) =>{
			this.keysPressed[event.key.toLowerCase()] = true;
		});

		window.addEventListener("keyup", (event) => {
			this.keysPressed[event.key.toLowerCase()] = false;
		});
	}

	addPlanet(planet){
		this.planets.push(planet);
		planet.addToScene();
	}

	addAstronaut(astronaut){
		this.astronaut = astronaut;
		astronaut.addToScene();
		astronaut.interactionSphere.addToScene();
	}

	startRenderLoop(){
		const clock = new THREE.Clock();
		const render = () => {
			const dt = clock.getDelta();
			this.renderer.render(this.scene, this.camera);
			requestAnimationFrame(render);
		};
		render();
	}

	startPhysicsLoop(){
		const clock = new THREE.Clock();
		const physics = () => {
			const dt = clock.getDelta();

			for (const planet of this.planets){
				// gravity between planets
				for (const other_planet of this.planets){
					if (planet === other_planet) continue;
					else planet.transform3.applyForce(planet.transform3.calculateGravity(other_planet.transform3));
				}
				// gravity between planets and astronaut
				this.astronaut.transform3.applyForce(this.astronaut.transform3.calculateGravity(planet.transform3));
			}

			if (this.planets.length > 0) { // Ensure there are planets in the array
				for (const planet of this.planets) {
					planet.transform3.integrate(dt);
					planet.transform3.resetForce();
			
					// Check for intersections between astronaut and planet surface
					const intersectionFaces = planet.checkSphereFaceIntersection(this.astronaut.interactionSphere);
					const buoyancyConstant = 200;   // Controls the spring-like effect strength
					const desiredDistance = 10.0; // Desired distance from the surface
					const dampingFactor = 0.5;      // Controls proximity-based damping strength
			
					for (let i = 0; i < intersectionFaces.length; i++) {
						const [v0, v1, v2] = intersectionFaces[i];
			
						// Calculate the normal of the face
						const edge1 = new THREE.Vector3().subVectors(v1, v0);
						const edge2 = new THREE.Vector3().subVectors(v2, v0);
						const normal = new THREE.Vector3().crossVectors(edge1, edge2).normalize();
			
						// Find the centroid of the face
						const centroid = new THREE.Vector3().add(v0).add(v1).add(v2).divideScalar(3);
			
						// Calculate the distance from the astronaut to the face plane
						const astronautToCentroid = new THREE.Vector3().subVectors(this.astronaut.transform3.pos, centroid);
						const distanceToPlane = astronautToCentroid.dot(normal);
			
						// Calculate spring-like force using Hooke's law
						const springForceMagnitude = -buoyancyConstant * (Math.abs(distanceToPlane) - desiredDistance);
						const springForce = normal.clone().multiplyScalar(springForceMagnitude);
			
						// Apply proximity-based damping
						if (Math.abs(distanceToPlane) < desiredDistance) { // Within the damping region
							const damping = astronautToCentroid.clone().multiplyScalar(-dampingFactor * dt);
							springForce.add(damping); // Add damping force to slow the astronaut
						}
			
						// Apply the calculated force to the astronaut
						this.astronaut.transform3.applyForce(springForce);
					}
				}
			}
			

			if (this.astronaut){
				this.astronaut.transform3.integrate(dt);
				this.astronaut.transform3.resetForce();
			}

			requestAnimationFrame(physics);
		};
		physics();
	}
}

class Planet extends Renderable{
	static randomizeTexture() {
		const textures = ['COS-426-Final/textures/water.jpg', 'COS-426-Final/textures/adam.jpg']
		const randomIndex = Math.floor(Math.random() * textures.length);
		return textures[randomIndex];
	}
	constructor(game, pos, radius, mass){
		const transform3 = new Transform3(pos, new THREE.Vector3(0,0,0), mass);
		const geometry = new THREE.SphereGeometry(radius, 32, 16);
		const material = new THREE.MeshStandardMaterial();
		super(game.scene, transform3, geometry, material);
		this.game = game;
	}
}


class Astronaut extends Renderable{
    static radius = 5;
    static interactionSphereRadius = 50;
    
    constructor(game, pos, mass){
        const transform3 = new Transform3(pos, new THREE.Vector3(0,0,0), mass);
        const geometry = new THREE.SphereGeometry(Astronaut.radius);
        const material = new THREE.MeshStandardMaterial({color: 0xff0000});
        super(game.scene, transform3, geometry, material);

        this.game = game;
        this.onPlanet = false;
        this.currentPlanet = null;

        // interaction sphere for debug purposes
        const interactionSphereGeometry = new THREE.SphereGeometry(Astronaut.interactionSphereRadius);
        const interactionSphereMaterial = new THREE.MeshBasicMaterial( { color: 0x0000ff, transparent: true, opacity: 0.5 } );
        this.interactionSphere = new Renderable(game.scene, transform3, interactionSphereGeometry, interactionSphereMaterial);

		const normalSph = new THREE.SphereGeometry(3);
		const normalSpMat = new THREE.MeshBasicMaterial( { color: 0xffff00, transparent: false} );
		this.normalTrans = new Transform3(new THREE.Vector3(0,0,0), new THREE.Vector3(0,0,0), 0);
		this.normalSph = new Renderable(game.scene, this.normalTrans, normalSph, normalSpMat);
		this.normalSph.addToScene(game.scene);
    }

    controlHandler(dt){
        const moveSpeed = 10000; // Movement speed in local coordinates
        const rotateSpeed = dt * 0.5 * Math.PI; // Rotation speed in radians per second

        // Move forward (W key) or backward (S key) in the local forward direction
        if (this.game.keysPressed["w"]) {
            const forward = this.transform3.getOrientationVectors().forward; // Get the forward direction
            const movement = forward.clone().multiplyScalar(moveSpeed);
            this.transform3.applyForce(movement); // Apply the movement force
        }
        if (this.game.keysPressed["s"]) {
            const forward = this.transform3.getOrientationVectors().forward; // Get the forward direction
            const movement = forward.clone().multiplyScalar(-moveSpeed);
            this.transform3.applyForce(movement); // Apply the movement force
        }

        // Rotate left (A key) or right (D key) around the up direction (Y-axis)
        if (this.game.keysPressed["a"]) {
            const rotation = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), rotateSpeed * dt);
            this.transform3.orientation.multiply(rotation);
        }
        if (this.game.keysPressed["d"]) {
            const rotation = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -rotateSpeed * dt);
            this.transform3.orientation.multiply(rotation);
        }

        // Try to adjust the up to be at the normal of the surface if on a planet        
        if (this.onPlanet){
            const normalToPlanet = new THREE.Vector3().subVectors(this.currentPlanet.transform3.pos, this.transform3.pos);
            normalToPlanet.normalize();
            this.transform3.changeUpDirection(normalToPlanet);
        }

		this.normalTrans.pos = new THREE.Vector3().addVectors(this.transform3.pos, this.transform3.getOrientationVectors().up);
		this.normalSph.transform3 = this.normalTrans;
	}



    startControlLoop(){
        const clock = new THREE.Clock();
        const control = () => {
            const dt = clock.getDelta();
            this.controlHandler(dt);
            requestAnimationFrame(control);
        };
        control();
    }
}



/* Questions

STOP FOCUSSING ON KEEPING GETTING FORWARD TO BE THE SAME, 
JUST MAKE SURE THAT THE CAMERA DIRECTION IS STEADY AND LERP SLOWLY NOT IMMEDIATELY

*/

console.log("Hello world");
const G = new Game();
const A = new Astronaut(G, new THREE.Vector3(0,80,-200), 10);

const P1 = new Planet(G, new THREE.Vector3(0,-100,-200), 150, 1e5);
//const P2 = new Planet(G, new THREE.Vector3(40,10,-150), 10, 10);

// Add renderables to scene
G.addPlanet(P1);
//G.addPlanet(P2);
G.addAstronaut(A);

A.onPlanet = true;
A.currentPlanet = P1;

// Start rendering
G.startRenderLoop();

// Start listening for keyboard inputs and move astronaut accordingly
G.initControls();
A.startControlLoop();

// console.log(P1.checkSphereIntersection(A.interactionSphere));

// Temporarily game loop
G.startPhysicsLoop();