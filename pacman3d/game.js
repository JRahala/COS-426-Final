class Ghost{
  constructor(r, c, dr, dc, tr, tc, str, stc){
    this.r = r;
    this.c = c;
    this.dr = dr;
    this.dc = dc;
    this.tr = tr;
    this.tc = tc;

    this.position = new THREE.Vector2(r, c);
    this.orientation = 0;

    this.nextPos = new THREE.Vector2(r, c);
    this.nextDir = new THREE.Vector2(dr, dc);

    this.state = 0; // 0 = scatter, 1 = chase, 2 = frightened
    // scatter target tiles
    this.str = str;
    this.stc = stc;
  }

  frightenedChoice(moves){
    // choose a random choice that is available
    const prefs = [[0,1],[1,0],[0,-1],[-1,0]];
    let index = Math.floor(Math.random() * 4 - 0.0001);
    for (let i=0; i<4; i++){
      let j = (index+i) % 4;
      // make sure its not opposite - this may cause a glitch if the reversal happens at the exact time before - pray this doesnt happen
      if (moves.get(prefs[j].toString()) && !(prefs[j][0] == -this.dr && prefs[j][1] == -this.dc)) return [[prefs[j][0]+this.r, prefs[j][1]+this.c], prefs[j]];
    }
    return [[this.r,this.c],[0,0]];
  }

  // return new position and direction of this movement
  nextPosition(maze){
    const moves = new Map();
    // THE ORDER OF THE BELOW IS IMPORTANT ELSE WE GET ZIG-ZAG BEHAVIOUR (NOW SET TO RDLU) MAKE SURE SAME FOR FOREACH LATER
    // This also defines the order we iterate over the keys !!!!!! MAKE SURE THIS IS CONSISTENT WHEN ITERATION ELSE CAN GET INFINITE BACK AND FORTH WITHOUT PREFERENCE
    moves.set([0,1].toString(), maze[this.r][this.c+1] != 1);
    moves.set([1,0].toString(), maze[this.r+1][this.c] != 1);
    moves.set([0,-1].toString(), maze[this.r][this.c-1] != 1);
    moves.set([-1,0].toString(), maze[this.r-1][this.c] != 1);

    // if frightened make random choice
    if (this.state == 2){
      return this.frightenedChoice(moves);
    }

    //console.log("MOVE DOWN", moves.get([1,0].toString()));
    //console.log("MOVE UP", moves.get([-1,0].toString()));
    //console.log("MOVE RIGHT", moves.get([0,1].toString()));
    //console.log("MOVE LEFT", moves.get([0,-1].toString()));
    
    // if either can't move forward
    // or can move orthogonal, reconsider choices
    if (
      !moves.get([this.dr, this.dc].toString()) || 
      (this.dr == 0 && (moves.get([1,0].toString()) || moves.get([-1,0].toString()))) || 
      (this.dc == 0 && (moves.get([0,1].toString()) || moves.get([0,-1].toString())))
    ){
      // go over all choices and choose one that takes you closest to target
      let bestDirection = [0,0];
      let bestDistance = 1e10;
      
      // FOR NOW THIS USES MANHATTAN DISTANCE, EDIT TO EUCLIDEAN IF WE WANT LATER - This is bad think about target above and going right vs down is the same
      [[0,1],[1,0],[0,-1],[-1,0]].forEach((key) => {
        // only non-wall moves and no direct backwards
        if (moves.get(key.toString()) && !(key[0] == -this.dr && key[1] == -this.dc)){
          // edit distance based on state
          let tempDist = 1e9;
          if (this.state == 0) tempDist = (key[0]+this.r-this.str)**2 + (key[1]+this.c-this.stc)**2;
          if (this.state == 1) tempDist = (key[0]+this.r-this.tr)**2 + (key[1]+this.c-this.tc)**2;

          if (tempDist < bestDistance){
            bestDirection = key;
            bestDistance = tempDist;
          }
        }
      })
      return [[bestDirection[0]+this.r, bestDirection[1]+this.c], bestDirection];
    }

    else{
      return [[this.dr+this.r, this.dc+this.c], [this.dr, this.dc]];
    }
  }

  // the original code reverses all directions on a state change - so try this later
  forcedReversal(){
    this.dr *= -1;
    this.dc *= -1;
  }

}


class Player{
    constructor(r, c, dr, dc){
        this.r = r;
        this.c = c;
        this.dr = dr;
        this.dc = dc;
        this.pellets = 0;

        this.position = new THREE.Vector2(r, c);
        this.orientation = 0;
    }
}


class Game{
    static maze = [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 1],
        [1, 2, 1, 2, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 2, 1],
        [1, 2, 1, 2, 2, 2, 2, 2, 1, 2, 1, 2, 2, 2, 2, 2, 2, 2, 1],
        [1, 2, 1, 1, 1, 3, 1, 2, 1, 2, 1, 1, 1, 3, 1, 2, 1, 2, 1],
        [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
        [1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 2, 1],
        [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
        [1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 2, 1],
        [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
        [1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 2, 1],
        [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
        [1, 2, 1, 1, 1, 3, 1, 2, 1, 2, 1, 1, 1, 3, 1, 2, 1, 2, 1],
        [1, 2, 1, 2, 2, 2, 2, 2, 1, 2, 1, 2, 2, 2, 2, 2, 2, 2, 1],
        [1, 2, 1, 2, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 2, 1],
        [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
      ];

      constructor(){
        this.resetGame();
      }

      resetGame(){
        const redGhost = new Ghost(12,15,-1,0,3,7,-10,14);
        const pinkGhost = new Ghost(7,1,-1,0,3,7,-10,3);
        const blueGhost = new Ghost(10,1,-1,0,0,0,20,1);
        const orangeGhost = new Ghost(14,15,-1,0,0,0,20,15);

        this.player = new Player(7, 10, 1, 0);
        this.ghosts = [redGhost, pinkGhost, blueGhost, orangeGhost];
        this.maze = this.resetMaze();
      }

      resetMaze(){
        this.maze = [];
        for (let r=0; r<Game.maze.length; r++){
            const temp=[];
            for (let c=0; c<Game.maze[r].length; c++) temp.push(Game.maze[r][c]);
            this.maze.push(temp);
        }
        return this.maze;
      }

      movePlayer(speed){
        // TODO: update when doing power pellets / frightened mode / etc

        let dx = speed * Math.cos(this.player.orientation);
        let dy = speed * Math.sin(this.player.orientation);

        let nx = this.player.position.x + dx;
        let ny = this.player.position.y + dy;

        let nr = Math.round(nx);
        let nc = Math.round(ny);

        if (this.maze[nr][nc] == 1) {
          if (this.maze[nr][this.player.c] != 1) {
            // can move row but not column
            dy = 0; 
            ny = this.player.position.y;
            nc = this.player.c;
          }
          else if (this.maze[this.player.r][nc] != 1) {
            // can move column but not row
            dx = 0; 
            nx = this.player.position.x;
            nr = this.player.r;
          }
          else {
            // cannot move either
            return 
          }
        }
        
        this.player.position.x = nx;
        this.player.position.y = ny;

        this.player.r = nr; 
        this.player.c = nc;
        
        if (this.maze[nr][nc] == 2){
          this.maze[nr][nc] = 0;
          this.player.pellets++;
        }

        this.player.dr = Math.round(dx);
        this.player.dc = Math.round(dy);
      }

      rotatePlayer(angle){
        this.player.orientation += angle;
      }
 
      moveGhosts(speed){
        for (const ghost of this.ghosts){

          // move a little bit toward the next pos
          ghost.position.x = ghost.position.x + speed * (ghost.nextPos.x - ghost.r);
          ghost.position.y = ghost.position.y + speed * (ghost.nextPos.y - ghost.c);

          // when done moving to the correct next pos
          if (Math.abs(ghost.position.x - ghost.nextPos.x) < speed && Math.abs(ghost.position.y - ghost.nextPos.y) < speed){

            ghost.r = Math.round(ghost.position.x); 
            ghost.c = Math.round(ghost.position.y);
  
            ghost.dr = ghost.nextDir.x; 
            ghost.dc = ghost.nextDir.y;

            ghost.orientation = Math.atan2(ghost.nextDir.x, ghost.nextDir.y); 

            // update next pos
            const [nextPos, nextDir] = ghost.nextPosition(this.maze);
            ghost.nextPos.x = nextPos[0]; ghost.nextPos.y = nextPos[1]; 
            ghost.nextDir.x = nextDir[0]; ghost.nextDir.y = nextDir[1];
          }
        }
      }

      updateGhostTargets(){
         // set red ghost to player
        this.ghosts[0].tr = this.player.r;
        this.ghosts[0].tc = this.player.c;

        // set pink ghost to ahead of player
        this.ghosts[1].tr = this.player.r + this.player.dr * 4;
        this.ghosts[1].tc = this.player.c + this.player.dc * 4;

        // set blue ghost to 2*(red to (pacman + 2direction)) + red position
        const pacTempR = this.player.r + (this.player.dr * 2);
        const pacTempC = this.player.c + (this.player.dc * 2);
        const redToPacR = pacTempR - this.ghosts[0].r;
        const redToPacC = pacTempC - this.ghosts[0].c;
        this.ghosts[2].tr = (2 * redToPacR) + this.ghosts[0].r;
        this.ghosts[2].tc = (2 * redToPacC) + this.ghosts[0].c;    

        // set orange ghost based on proximty
        const orangeDistance = (this.player.r - this.ghosts[3].r) ** 2 + (this.player.c - this.ghosts[3].c) ** 2;
        const redDR = this.player.r - this.ghosts[0].r;
        const redDC = this.player.c - this.ghosts[0].c;
        this.ghosts[3].tr = (2 * redDR) + this.ghosts[0].r;
        this.ghosts[3].tc = (2 * redDC) + this.ghosts[0].c; 
        if (orangeDistance < 64){
            this.ghosts[3].tr = this.ghosts[3].str;
            this.ghosts[3].tc = this.ghosts[3].stc;
        }
      }
}


//////////////////////////////////////////////////


// Initialize the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add a basic light
const light = new THREE.AmbientLight(0x404040, 2); // Soft white light
scene.add(light);
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 7.5);
scene.add(directionalLight);

// Create the floor
const floorGeometry = new THREE.BoxGeometry(19, 0.5, 17);
const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x222222 });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.position.y = -0.5; // Position below the game plane
floor.position.x = 19/2-1/2;
floor.position.z = 17/2-1/2;
scene.add(floor);


// Function to create walls
const createWall = (x, y, z) => {
    const wallGeometry = new THREE.BoxGeometry(1, 1, 1);
    const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x0000ff });
    const wall = new THREE.Mesh(wallGeometry, wallMaterial);
    wall.position.set(x, y, z);
    return wall;
};


// Create player and ghost placeholders
const createSphere = (color, x, y, z) => {
    const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const sphereMaterial = new THREE.MeshStandardMaterial({ color });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.set(x, y, z);
    return sphere;
};

const player = createSphere(0xffff00, 10, 0.5, 7); // Pac-Man
scene.add(player);


// Ghosts
const ghosts = [
    createSphere(0xff0000, 15, 0.5, 12), // Red ghost
    createSphere(0xffb6c1, 1, 0.5, 7),  // Pink ghost
    createSphere(0x0000ff, 1, 0.5, 10), // Blue ghost
    createSphere(0xffa500, 15, 0.5, 14) // Orange ghost
];
ghosts.forEach(ghost => scene.add(ghost));


// Function to create pellets
const createPellet = (x, z, isPowerUp = false) => {
  const size = isPowerUp ? 0.2 : 0.1; // Bigger for power-up pellets
  const color = isPowerUp ? 0xffff00 : 0xffffff; // Yellow for power-up pellets
  const geometry = new THREE.BoxGeometry(size, size, size);
  const material = new THREE.MeshStandardMaterial({ color });
  const pellet = new THREE.Mesh(geometry, material);
  pellet.quaternion.random();
  pellet.position.set(x, 0.2, z); // Slightly above the floor
  return pellet;
};

// Arrays to store pellets and power-up pellets
const pellets = [];
const powerPellets = [];



// Position the camera
// camera.position.set(19/2-1/2, 25, 25);
// camera.lookAt(19/2-1/2, 0, 0);
camera.position.set(19/2-1/2, 15, 20);
camera.lookAt(19/2-1/2, -10, 0);

// Animate the scene
const animate = () => {
    requestAnimationFrame(animate);

    const movementSpeed = 0.03;
    const rotationSpeed = 0.05;

    // Handle player movement based on key state
    if (keys.w || keys.ArrowUp) G.movePlayer(movementSpeed);
    if (keys.s || keys.ArrowDown) G.movePlayer(-movementSpeed);
    if (keys.a || keys.ArrowLeft) G.rotatePlayer(rotationSpeed);
    if (keys.d || keys.ArrowRight) G.rotatePlayer(-rotationSpeed);

    // Move the ghosts
    G.moveGhosts(movementSpeed);
    G.updateGhostTargets();

    // Rotate pellets for a dynamic effect
    pellets.forEach(pellet => pellet.rotation.y += 0.03);
    powerPellets.forEach(powerPellet => powerPellet.rotation.y += 0.03);

    // Check for pellet consumption
    const pelletConsumptionRadius = 0.7071; // allows for diagonal passes
    for (let i = pellets.length - 1; i >= 0; i--) {
        const pellet = pellets[i];
        if (Math.abs(player.position.x - pellet.position.x) < pelletConsumptionRadius &&
            Math.abs(player.position.z - pellet.position.z) < pelletConsumptionRadius) {
            scene.remove(pellet); // Remove the pellet from the scene
            pellets.splice(i, 1); // Remove it from the array
        }
    }

    for (let i = powerPellets.length - 1; i >= 0; i--) {
        const powerPellet = powerPellets[i];
        if (Math.abs(player.position.x - powerPellet.position.x) < pelletConsumptionRadius &&
            Math.abs(player.position.z - powerPellet.position.z) < pelletConsumptionRadius) {
            scene.remove(powerPellet); // Remove the power-up pellet
            powerPellets.splice(i, 1);
            // Add power-up effect here if needed
        }
    }

    // Update positions based on the game state
    player.position.set(G.player.position.y, 0, G.player.position.x);
    
    G.ghosts.forEach((g, i) => {
        ghosts[i].position.set(g.position.y, 0, g.position.x);
    });

    renderer.render(scene, camera);
};

// Track which keys are currently pressed
const keys = {
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false,
  w: false,
  s: false,
  a: false,
  d: false,
};

// Controls
window.addEventListener('keydown', (event) => {
    if (keys.hasOwnProperty(event.key)) {
        keys[event.key] = true;
    }

    if (event.key == "s"){
      console.log("Set to scattered mode")
      for (const ghost of G.ghosts){
        ghost.forcedReversal();
        ghost.state = 0;
      }
    }
    
    if (event.key == "c"){
      console.log("Set to chase mode")
      for (const ghost of G.ghosts){
        ghost.forcedReversal();
        ghost.state = 1;
      }
    }

    if (event.key == "f"){
      console.log("Set to frightened mode")
      for (const ghost of G.ghosts){
        ghost.forcedReversal();
        ghost.state = 2;
      }
    }
});

window.addEventListener('keyup', (event) => {
    if (keys.hasOwnProperty(event.key)) {
        keys[event.key] = false;
    }
});



const G = new Game();

// Generate walls and add to the scene
const maze = G.maze;
for (let r = 0; r < maze.length; r++) {
    for (let c = 0; c < maze[r].length; c++) {
        if (maze[r][c] === 1) { // Walls
            const wall = createWall(c, 0, r);
            scene.add(wall);
        }
    }
}


// Generate pellets and add them to the scene
for (let r = 0; r < maze.length; r++) {
  for (let c = 0; c < maze[r].length; c++) {
      if (maze[r][c] === 2) { // Regular pellets
          const pellet = createPellet(c, r, false);
          pellets.push(pellet);
          scene.add(pellet);
      } else if (G.maze[r][c] === 3) { // Power-up pellets
          const powerPellet = createPellet(c, r, true);
          powerPellets.push(powerPellet);
          scene.add(powerPellet);
      }
  }
}


animate();