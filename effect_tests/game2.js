    // Set up the scene, camera, and renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Add OrbitControls to allow user to move the camera
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    camera.position.z = 5;

    // Create a glowing particle system
    const particlesGeometry = new THREE.BufferGeometry();
    const particleCount = 10000;
    const positions = [];
    const colors = [];
    for (let i = 0; i < particleCount; i++) {
        positions.push(Math.random() * 10 - 5, Math.random() * 10 - 5, Math.random() * 10 - 5);
        colors.push(Math.random(), Math.random(), Math.random());
    }
    particlesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
        size: 0.05,
        vertexColors: true,
        map: new THREE.TextureLoader().load('https://threejsfundamentals.org/threejs/resources/images/star.png'),
        transparent: true
    });
    const particles = new THREE.Points(particlesGeometry, particleMaterial);
    scene.add(particles);

    // Add a rotating cube to the scene
    const cubeGeometry = new THREE.BoxGeometry();
    const cubeMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    scene.add(cube);

    // Set up lighting (ambient and point light)
    const ambientLight = new THREE.AmbientLight(0x404040, 1);  // Soft white light
    scene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(0xff0000, 1, 100);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);

        // Rotate the cube for a cool effect
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;

        // Make the particles rotate and animate
        particles.rotation.x += 0.001;
        particles.rotation.y += 0.001;

        // Update the controls (camera movement)
        controls.update();

        // Render the scene
        renderer.render(scene, camera);
    }

    animate();

    // Handle resizing of the window
    window.addEventListener('resize', () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    });