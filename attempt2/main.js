import { Transform3 } from "./Transform3.js";
import { Renderable } from "./Renderable.js";
import { Player } from "./Player.js";
import { Game } from "./Game.js";
import { addHeads } from "./Ghost.js";

console.log("Hello world!");

const G = new Game();
G.initRenderer();
G.initControls();

const t3 = new Transform3(new THREE.Vector3(0,10,-100), 1);
const geo = new THREE.SphereGeometry(10, 10, 10);
const P = new Player(G, t3, null);

const TempBoxTransform = new Transform3(new THREE.Vector3(0,1,-100), 1);
const TempBoxGeometry = new THREE.BoxGeometry(500,1,500);
const TempBox = new Renderable(G, TempBoxTransform, TempBoxGeometry);

// Create the player
const playerTransform = new Transform3(new THREE.Vector3(0, 1.5, 0), 1);
const player = new Player(G, playerTransform);
G.addPlayer(player);

// Initialize RoomManager
const roomManager = new RoomManager(G, player, roomTemplate);

// Game loops
G.initRenderLoop();
G.initPhysicsLoop();
G.initControlLoop();
G.addPlayer(P);

const gridHelper = new THREE.GridHelper(5000, 100);
G.scene.add(gridHelper);


const ghost = addHeads(scene, "./head/head.obj", 0, 0, 0);
const powerup = Powerup(1, 0x00ff00);