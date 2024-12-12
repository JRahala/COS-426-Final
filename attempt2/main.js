import { Room } from "./Room.js";
import { Player } from "./Player.js";
import { RoomManager } from "./RoomManager.js";
import {Game} from "./"
// Initialize the game
const G = new Game();
G.initRenderer();
G.initControls();

// Create a sample room template
const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });
const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x303030 });
const floorGeometry = new THREE.PlaneGeometry(50, 50);
const wallGeometry = new THREE.BoxGeometry(1, 3, 50);
const roomTemplate = new Room(G, new Transform3(new THREE.Vector3(0, 0, 0), 1), floorMaterial, wallMaterial, floorGeometry, wallGeometry);

// Create the player
const playerTransform = new Transform3(new THREE.Vector3(0, 1.5, 0), 1);
const player = new Player(G, playerTransform);
G.addPlayer(player);

// Initialize RoomManager
const roomManager = new RoomManager(G, player, roomTemplate);

// Game loops
G.initRenderLoop();
G.initPhysicsLoop();
G.gameLoop();
