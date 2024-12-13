<<<<<<< HEAD
import { Transform3 } from "./Transform3.js";
import { Renderable } from "./Renderable.js";
import { Player } from "./Player.js";
import { Game } from "./Game.js";

console.log("Hello world!");

=======
import { Room } from "./Room.js";
import { Player } from "./Player.js";
import { RoomManager } from "./RoomManager.js";
import {Game} from "./"
// Initialize the game
>>>>>>> c05e72e207c00ee66ac9a74255a8003a36ca8685
const G = new Game();
G.initRenderer();
G.initControls();

<<<<<<< HEAD
const t3 = new Transform3(new THREE.Vector3(0,10,-100), 1);
const geo = new THREE.SphereGeometry(10, 10, 10);
const P = new Player(G, t3, null);

const TempBoxTransform = new Transform3(new THREE.Vector3(0,1,-100), 1);
const TempBoxGeometry = new THREE.BoxGeometry(500,1,500);
const TempBox = new Renderable(G, TempBoxTransform, TempBoxGeometry);
=======
// Create a sample room template
const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });
const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x303030 });
const floorGeometry = new THREE.PlaneGeometry(50, 50);
const wallGeometry = new THREE.BoxGeometry(1, 3, 50);
const roomTemplate = new Room(G, new Transform3(new THREE.Vector3(0, 0, 0), 1), floorMaterial, wallMaterial, floorGeometry, wallGeometry);
>>>>>>> c05e72e207c00ee66ac9a74255a8003a36ca8685

// Create the player
const playerTransform = new Transform3(new THREE.Vector3(0, 1.5, 0), 1);
const player = new Player(G, playerTransform);
G.addPlayer(player);

// Initialize RoomManager
const roomManager = new RoomManager(G, player, roomTemplate);

// Game loops
G.initRenderLoop();
G.initPhysicsLoop();
<<<<<<< HEAD
G.initControlLoop();
G.addPlayer(P);

const gridHelper = new THREE.GridHelper(5000, 100);
G.scene.add(gridHelper);
=======
G.gameLoop();
>>>>>>> c05e72e207c00ee66ac9a74255a8003a36ca8685
