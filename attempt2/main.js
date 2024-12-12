import { Transform3 } from "./Transform3.js";
import { Renderable } from "./Renderable.js";
import { Player } from "./Player.js";
import { Game } from "./Game.js";

console.log("Hello world!");

const G = new Game();

G.initRenderer();
G.initControls();

const t3 = new Transform3(new THREE.Vector3(0,0,-100), 1);
const geo = new THREE.SphereGeometry(10, 10, 10);
const P = new Player(G, t3, null);

G.initRenderLoop();
G.initPhysicsLoop();
G.initControlLoop();

G.addPlayer(P);

const gridHelper = new THREE.GridHelper(5000, 100);
G.scene.add(gridHelper);