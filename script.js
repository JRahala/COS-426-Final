// SOMETHING IS ****NOT**** GOING WRONG IN THE INTEGRATE FUNCTION 

class Transform3{
	static globalDamping = 0.99;
	static G = 100;

	constructor(pos, vel, mass){
		this.pos = pos;
		this.vel = vel;

		const quaternion = new THREE.Quaternion();
		quaternion.setFromAxisAngle(new THREE.Vector3(0,1,0), Math.PI/2);
		this.orientation = quaternion;

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
		//this.vec.multiplyScalar(this.globalDamping); - apply this when I figure out how to incorporate dt inexpensively
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

		// NO MOUSE INPUT YET - because I want to work out if I want this time based or not, think
		// about the effects of dragging without time based approach - possible animationLop type approach
	
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

		/*
		this.renderer.domElement.addEventListener("mousedown", (event) => {
			this.prevMousePosition = this.currMousePosition;
			this.currMousePosition = {x: event.clientX, y: event.clientY};
		});

		this.renderer.domElement.addEventListener("mouseup", (event) => {
			this.prevMousePosition = this.currMousePosition;
			this.currMousePosition = {x: event.clientX, y: event.clientY};
		})

		this.renderer.domElement.addEventListener("mousemove", (event) => {
			this.prevMousePosition = this.currMousePosition;
			this.currMousePosition = {x: event.clientX, y: event.clientY};
		})
		*/
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

			if (this.planets != []){
				for (const planet of this.planets){
					planet.transform3.integrate(dt);
					planet.transform3.resetForce();

					// TODO: this should be generalized to all meshes later - CHECK FOR ASTRONAUT COLLISION
					const intersectionFaces = planet.checkSphereFaceIntersection(this.astronaut.interactionSphere);
					const buyouncy = 200;
					const desiredDistance = 1.0; // Desired distance from the surface
					
					for (let i = 0; i < intersectionFaces.length; i++) {
						const [v0, v1, v2] = intersectionFaces[i];
						const edge1 = new THREE.Vector3().subVectors(v1, v0);
						const edge2 = new THREE.Vector3().subVectors(v2, v0);
						const normal = new THREE.Vector3().crossVectors(edge1, edge2).normalize();
						
						// Calculate the centroid of the face (for the plane equation)
						const centroid = new THREE.Vector3().add(v0).add(v1).add(v2).divideScalar(3);
						
						// Vector from the astronaut's position to the centroid of the face
						const astronautToCentroid = new THREE.Vector3().subVectors(this.astronaut.transform3.pos, centroid);
						
						// Project the astronaut's position onto the plane of the triangle
						const distanceToPlane = astronautToCentroid.dot(normal); // Distance along the normal
					
						// Apply spring force proportional to the distance
						const springForceMagnitude = -buyouncy * (Math.abs(distanceToPlane) - desiredDistance); // Hooke's law
						
						// Ensure the force points towards the surface (towards the centroid)
						const springForce = normal.clone().multiplyScalar(springForceMagnitude);
					
						// Apply the calculated spring force to the astronaut
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
  static radius = 1;
  static interactionSphereRadius = 1.5;

  constructor(game, pos, mass){
    const transform3 = new Transform3(pos, new THREE.Vector3(0,0,0), mass);
    const geometry = new THREE.SphereGeometry(Astronaut.radius);
    const material = new THREE.MeshStandardMaterial({color: 0xff0000});
    super(game.scene, transform3, geometry, material);

    this.game = game;
    this.onPlanet = false;
    this.currentPlanet = null;

    this.up = new THREE.Vector3(0,1,0);
    this.forward = new THREE.Vector3(0,0,-1);

    // interaction sphere for debug purposes
    const interactionSphereGeometry = new THREE.SphereGeometry(Astronaut.interactionSphereRadius);
    const interactionSphereMaterial = new THREE.MeshBasicMaterial( { color: 0x0000ff, transparent: true, opacity: 0.5 } );
    this.interactionSphere = new Renderable(game.scene, transform3, interactionSphereGeometry, interactionSphereMaterial);

    // Forward direction indicator
    const indicatorGeometry = new THREE.ConeGeometry(1, 2, 12);
    const indicatorMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    this.forwardIndicator = new THREE.Mesh(indicatorGeometry, indicatorMaterial);
    this.forwardIndicator.position.set(0, 0, Astronaut.radius + 0.6); // Position it slightly ahead of the sphere
    this.forwardIndicator.rotation.x = Math.PI / 2; // Align cone with the forward vector
    this.mesh.add(this.forwardIndicator); // Attach to the astronaut's mesh
	
  }

  controlHandler(dt){
    const up = this.up;
    const forward = this.forward;
    const side = new THREE.Vector3().crossVectors(forward, up);

    console.log(forward);

    const moveAngle = dt * 150 * Math.PI / 180;
    const turnAngle = dt * 250 * Math.PI / 180;

    if (this.game.keysPressed["w"]) this.adjustPosition(new THREE.Quaternion().setFromAxisAngle(side, moveAngle));
    if (this.game.keysPressed["s"]) this.adjustPosition(new THREE.Quaternion().setFromAxisAngle(side, -moveAngle));

    if (this.game.keysPressed["a"]) this.forward.copy(forward.applyQuaternion(new THREE.Quaternion().setFromAxisAngle(up, turnAngle))); 
    if (this.game.keysPressed["d"]) this.forward.copy(forward.applyQuaternion(new THREE.Quaternion().setFromAxisAngle(up, -turnAngle)));

    if (this.game.keysPressed["ArrowUp"]) console.log("up");
    if (this.game.keysPressed["ArrowDown"]) console.log("down");

		this.setOrientation();
  }

  adjustPosition(quaternion) {
    if (this.onPlanet) {
      quaternion.normalize();
      const offset = this.transform3.pos.clone().sub(this.currentPlanet.transform3.pos).applyQuaternion(quaternion);
      this.transform3.pos = new THREE.Vector3().addVectors(this.currentPlanet.transform3.pos, offset)

      this.up.applyQuaternion(quaternion);
      this.forward.applyQuaternion(quaternion);
    } 
  }

	setOrientation() {
		const lookAtQuaternion = new THREE.Quaternion();
		const lookAtMatrix = new THREE.Matrix4();
		lookAtMatrix.lookAt(new THREE.Vector3(0, 0, 0), this.forward, this.up);
		lookAtQuaternion.setFromRotationMatrix(lookAtMatrix);
		this.transform3.orientation = lookAtQuaternion;
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

Perhaps we have to generate a new mesh any time we wish to change the radius of  planet, which could be annoying

- Steps

- add controls for Astronaut to move in space
- add hit box detection for when astronaut is close to a planet
- we should make child transforms as well so that when we rotate a planet, we can rotate all children objects easily?


we want a global geometry of the astronaut, then we have a local transform that
after each jump fixes its upwards direction on the normal of what planet its on

we can just lerp the normals to the intersection normals of the meshes - for now, lets do this and register the collisions with the sphere mesh

INCORPORATE LOCAL ROTATIONS SO THAT THE ASTRONAUT GOES FORWARD IN THE WAY THAT THEY ARE ORIENTED!!!
ALSO APPLY THIS TO THE MESH

*/

console.log("Hello world");
const G = new Game();
const A = new Astronaut(G, new THREE.Vector3(-20,31,-100), 10);

const P1 = new Planet(G, new THREE.Vector3(-20,20,-100), 10, 10);
const P2 = new Planet(G, new THREE.Vector3(40,10,-150), 10, 10);

// Add renderables to scene
G.addPlanet(P1);
G.addPlanet(P2);
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