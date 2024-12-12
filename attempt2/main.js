import { Transform3 } from "./Transform3.js";
import { Renderable } from "./Renderable.js";
import { Game } from "./Game.js";

console.log("Hello world!");

const G = new Game();

G.initRenderer();
G.initControls();

const t3 = new Transform3(new THREE.Vector3(0,0,-100), 1);
const geo = new THREE.SphereGeometry(10, 10, 10);
const A = new Renderable(G, t3, geo, null);

G.initRenderLoop();
G.initPhysicsLoop();

console.log(A.mesh);
G.scene.add(A.mesh);

const gridHelper = new THREE.GridHelper(5000, 100);
G.scene.add(gridHelper);

G.scene.add(A.forwardAxis);
G.scene.add(A.upAxis);
G.scene.add(A.rightAxis);