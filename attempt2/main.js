import { Transform3 } from "./Transform3.js";
import { Renderable } from "./Renderable.js";
import { Player } from "./Player.js";
import { Game } from "./Game.js";
import {addHeads} from "./Ghost.js";
import {cubeCluster} from "./Powerup.js"
console.log("Hello world!");

const G = new Game();
G.initRenderer();
G.initControls();

// Initialize RoomManager
// const roomManager = new RoomManager(G, player, roomTemplate);

// Game loops
G.initRenderLoop();
G.initPhysicsLoop();
G.initControlLoop();

const gridHelper = new THREE.GridHelper(5000, 100);
G.scene.add(gridHelper);
const powerup = new cubeCluster(1, 0x00ff00);
G.scene.add(powerup.getMesh());
