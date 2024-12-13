// Some weird movement might be caused by the fact that I never implemented the yellow thing.
// The maze we generate must not have dead ends? YESSSSSSS - THis is as pacman is based
// Remember that the ghosts' targets could be outside of the range of the grid

class Ghost{
  constructor(r, c, dr, dc, tr, tc, str, stc){
    this.r = r;
    this.c = c;
    this.dr = dr;
    this.dc = dc;
    this.tr = tr;
    this.tc = tc;
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
    const g1 = new Ghost(12,15,-1,0,3,7,-10,14); // red ghost
    const g2 = new Ghost(7,1,-1,0,3,7,-10,3); // pink ghost - goes infront of pacman
    const g3 = new Ghost(10,1,-1,0,0,0,20,1); // blue ghost - weird based on red
    const g4 = new Ghost(14,15,-1,0,0,0,20,15); // orange ghost - even weirder based on red
    this.playerPosition = [7,10];
    this.playerPrevDirection = [0,0]; // since this doesn't have to move all the time, just keep the last time we did
    this.ghosts = [g1, g2, g3, g4];
    this.playerPellets = 0;
    this.maze = this.resetMaze();
  }

  resetMaze(){
    this.maze = [];
    for (let row = 0; row < Game.maze.length; row++){
      const temp = [];
      for (let col = 0; col < Game.maze[row].length; col++){
        temp.push(Game.maze[row][col]);
      }
      this.maze.push(temp);
    }
    return this.maze;
  }

  movePlayer(dr, dc){
    // attempt to move in certain direction (assume player is never on the edges of the mazes)
    let [cr, cc] = this.playerPosition;
    let [nr, nc] = [cr+dr, cc+dc];
    if (this.maze[nr][nc] == 1){
      console.log("Cannot move here");
      return;
    }
    this.playerPosition = [nr, nc]; 
    if (this.maze[nr][nc] == 2){
      this.maze[nr][nc] = 0;
      this.playerPellets++;
    }
    this.playerPrevDirection = [dr, dc];
  }

  moveGhosts(){
    for (let index=0; index<G.ghosts.length; index++){
      const [nextPos, nextDir] = G.ghosts[index].nextPosition(G.maze);
      //console.log(nextPos, nextDir);
      G.ghosts[index].r = nextPos[0];
      G.ghosts[index].c = nextPos[1];
      G.ghosts[index].dr = nextDir[0];
      G.ghosts[index].dc = nextDir[1];
      renderMaze(G, pc);
    }
  } 

  updateGhostTargets(){
    // this depends on each ghost type
    
    // set red ghost to player
    G.ghosts[0].tr = this.playerPosition[0];
    G.ghosts[0].tc = this.playerPosition[1];

    // set pink ghost to ahead of player
    G.ghosts[1].tr = this.playerPosition[0] + this.playerPrevDirection[0] * 4;
    G.ghosts[1].tc = this.playerPosition[1] + this.playerPrevDirection[1] * 4;

    // set blue ghost to 2*(red to (pacman + 2direction)) + red position
    const pacTempR = this.playerPosition[0] + (this.playerPrevDirection[0] * 2);
    const pacTempC = this.playerPosition[1] + (this.playerPrevDirection[1] * 2);
    const redToPacR = pacTempR - G.ghosts[0].r;
    const redToPacC = pacTempC - G.ghosts[0].c;
    G.ghosts[2].tr = (2 * redToPacR) + G.ghosts[0].r;
    G.ghosts[2].tc = (2 * redToPacC) + G.ghosts[0].c;    

    // set orange ghost based on proximty
    const orangeDistance = (this.playerPosition[0] - G.ghosts[3].r) ** 2 + (this.playerPosition[1] - G.ghosts[3].c) ** 2;
    const redDR = this.playerPosition[0] - G.ghosts[0].r;
    const redDC = this.playerPosition[1] - G.ghosts[0].c;
    G.ghosts[3].tr = (2 * redDR) + G.ghosts[0].r;
    G.ghosts[3].tc = (2 * redDC) + G.ghosts[0].c; 
  }
}

const renderMaze = (G, canvasId) => {
  const canvas = document.getElementById(canvasId);
  if (!canvas) {
    console.error(`Canvas with id "${canvasId}" not found.`);
    return;
  }

  const context = canvas.getContext('2d');
  const cellSize = 20; // Size of each cell in pixels

  const colors = {
    0: 'black', // Empty space
    1: 'blue',  // Wall
    2: 'white', // Pellet
    3: 'yellow', // Power Pellet
    4: 'orange', // Pac-Man
    5: 'red',   // Ghost
  };

  const fillCell = (y, x, color) => {
    context.fillStyle = color;
    context.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);

    // Optionally draw outlines for cells
    context.strokeStyle = 'black';
    context.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
  }

  G.maze.forEach((row, y) => {
    row.forEach((cell, x) => {
      fillCell(y, x, colors[cell]);
    });
  });


  for (const g of G.ghosts){
    const ghostColors = {
      0: 'green', // Scatter
      1: 'red',  // Chase
      2: 'purple', // Frightened
    };
    fillCell(g.r, g.c, ghostColors[g.state]);
  }

  for (const g of G.ghosts){
    //fillCell(g.tr, g.tc, colors[6]);
  }

  fillCell(G.playerPosition[0], G.playerPosition[1], colors[4]);

};


const G = new Game();
G.movePlayer(1,0);

const pc = 'pacmanCanvas';
renderMaze(G, pc);

function tempStep(){
  G.moveGhosts();
  G.updateGhostTargets();
  renderMaze(G, pc);
}


let myInterval = window.setInterval(tempStep, 200);


window.setInterval(function(){
  for (const g of G.ghosts){
    //g.forcedReversal()
    //g.state = (g.state+1)%3;
    g.state = 1;
  }
  console.log("Ghosts are now in state: ", G.ghosts[0].state);
}, 10000)
