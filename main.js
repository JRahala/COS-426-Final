// Scene, Camera, and Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const overheadCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const mazeWidth = 45;
const mazeHeight = 45;
const centerX = Math.floor(mazeWidth / 2);
const centerY = Math.floor(mazeHeight / 2);

camera.position.set(centerX, 2, centerY);
overheadCamera.position.set(centerX, 50, centerY); // Higher view for better coverage
overheadCamera.rotation.x = -Math.PI / 2;

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

// Union-Find Data Structure
class UnionFind {
  constructor(size) {
    this.parent = new Array(size).fill(0).map((_, index) => index);
    this.rank = new Array(size).fill(1);
  }

  find(x) {
    if (this.parent[x] !== x) {
      this.parent[x] = this.find(this.parent[x]);
    }
    return this.parent[x];
  }

  union(x, y) {
    const rootX = this.find(x);
    const rootY = this.find(y);

    if (rootX !== rootY) {
      if (this.rank[rootX] > this.rank[rootY]) {
        this.parent[rootY] = rootX;
      } else if (this.rank[rootX] < this.rank[rootY]) {
        this.parent[rootX] = rootY;
      } else {
        this.parent[rootY] = rootX;
        this.rank[rootX] += 1;
      }
    }
  }
}

function generateMaze(width, height) {
  const maze = new Array(height).fill(null).map(() => new Array(width).fill(1));
  const visited = new Array(height).fill(null).map(() => new Array(width).fill(false));
  const directions = [
    [0, 2],  // Move down
    [0, -2], // Move up
    [2, 0],  // Move right
    [-2, 0], // Move left
  ];

  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  function isInBounds(x, y) {
    return x > 0 && x < width - 1 && y > 0 && y < height - 1;
  }

  function carve(x, y) {
    visited[y][x] = true;
    maze[y][x] = 0;

    // Shuffle the directions for randomized paths
    shuffle(directions);

    for (const [dx, dy] of directions) {
      const nx = x + dx;
      const ny = y + dy;

      if (isInBounds(nx, ny) && !visited[ny][nx]) {
        // Remove the wall between the current cell and the next cell
        maze[y + dy / 2][x + dx / 2] = 0;
        carve(nx, ny);
      }
    }
  }

  // Find the center of the maze
  const centerX = Math.floor(width / 2);
  const centerY = Math.floor(height / 2);

  // Ensure the starting point at the center is carved out
  carve(centerX, centerY);

  return maze;
}


function createMaze() {
  const mazeData = generateMaze(mazeWidth, mazeHeight);

  for (let i = 0; i < mazeData.length; i++) {
    for (let j = 0; j < mazeData[i].length; j++) {
      if (mazeData[i][j] === 1) {
        const wallGeometry = new THREE.BoxGeometry(1, 2, 1);
        const wallMaterial = new THREE.MeshBasicMaterial({ color: 0x808080 });
        const wallMesh = new THREE.Mesh(wallGeometry, wallMaterial);
        wallMesh.position.set(j, 1, i);
        scene.add(wallMesh);
      }
    }
  }
}

createMaze();

class Player {
  constructor(scene, x, y, z) {
    const geometry = new THREE.SphereGeometry(0.2, 32, 32);
    const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.set(x, y, z);
    scene.add(this.mesh);
  }

  updatePosition(delta, camera, walls) {
    const prevPosition = this.mesh.position.clone(); // Save previous position for collision
    if (moveForward) {
      this.mesh.position.x -= delta * Math.sin(camera.rotation.y);
      this.mesh.position.z -= delta * Math.cos(camera.rotation.y);
    }
    if (moveBackward) {
      this.mesh.position.x += delta * Math.sin(camera.rotation.y);
      this.mesh.position.z += delta * Math.cos(camera.rotation.y);
    }
    if (turnLeft) {
      camera.rotation.y += delta;
    }
    if (turnRight) {
      camera.rotation.y -= delta;
    }
    camera.position.set(this.mesh.position.x, this.mesh.position.y + 0.5, this.mesh.position.z);

    // Collision Detection
    if (checkCollisions(this, walls)) {
      this.mesh.position.copy(prevPosition); // Revert position if collision detected
    }

    // Add spheres when moving
    if (moveForward || moveBackward) {
      trail.addSphere(this.mesh.position.clone());
    }
  }
}

const player = new Player(scene, centerX, 0.5, centerY);

// First-person controls (no changes needed here)
let moveForward = false;
let moveBackward = false;
let turnLeft = false;
let turnRight = false;
let lookBack = false;
let originalRotationSet = false;
let originalRotation = camera.rotation.y;
let useFirstPersonCamera = true;

document.addEventListener('keydown', (event) => {
  switch (event.code) {
    case 'ArrowUp':
    case 'KeyW':
      moveForward = true;
      break;
    case 'ArrowDown':
    case 'KeyS':
      moveBackward = true;
      break;
    case 'ArrowLeft':
    case 'KeyA':
      turnLeft = true;
      break;
    case 'ArrowRight':
    case 'KeyD':
      turnRight = true;
      break;
    case 'KeyT':
      useFirstPersonCamera = !useFirstPersonCamera;
      break;
    case 'KeyL':
      if (!lookBack) {
        if (!originalRotationSet) {
          originalRotation = camera.rotation.y;
          originalRotationSet = true;
        }
        camera.rotation.y = originalRotation + Math.PI; // Turn the camera around
        lookBack = true;
      }
      break;
  }
});

document.addEventListener('keyup', (event) => {
  switch (event.code) {
    case 'ArrowUp':
    case 'KeyW':
      moveForward = false;
      break;
    case 'ArrowDown':
    case 'KeyS':
      moveBackward = false;
      break;
    case 'ArrowLeft':
    case 'KeyA':
      turnLeft = false;
      break;
    case 'ArrowRight':
    case 'KeyD':
      turnRight = false;
      break;
    case 'KeyL':
      if (lookBack) {
        camera.rotation.y = originalRotation; // Reset the camera rotation
        lookBack = false;
        originalRotationSet = false;
      }
      break;
  }
});

function update(dt) {
  const moveSpeed = dt * 10;
  player.updatePosition(moveSpeed, camera, walls);
  trail.update(dt); // Update trail spheres
}

function animate() {
  requestAnimationFrame(animate);
  update(dt);
  const activeCamera = useFirstPersonCamera ? camera : overheadCamera;
  renderer.render(scene, activeCamera);
}

animate();
