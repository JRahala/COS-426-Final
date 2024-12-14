import { OBJLoader } from "../pacman3d/loaders/OBJLoader.js";

export class Ghost {
  constructor(scene, modelPath, r, c, dr, dc, tr, tc, str, stc, color) {
    this.scene = scene;
    this.modelPath = modelPath;

    this.r = r; // row position
    this.c = c; // column position
    this.dr = dr; // delta row (direction)
    this.dc = dc; // delta column (direction)
    this.tr = tr; // target row (chase mode)
    this.tc = tc; // target column (chase mode)

    this.position = new THREE.Vector2(r, c);
    this.orientation = 0;

    this.nextPos = new THREE.Vector2(r, c);
    this.nextDir = new THREE.Vector2(dr, dc);

    this.ro = r; // original row
    this.co = c; // original column

    this.state = 0; // 0 = scatter, 1 = chase, 2 = frightened

    this.str = str; // scatter target row
    this.stc = stc; // scatter target column

    this.color = color; // unique color for this ghost
    this.manequin = null; // 3D model reference
    this.floatDir = 1;
    this.maxy = 1.5;
    this.miny = 0.5;

    this.loadModel();
  }

  loadModel() {
    const loader = new OBJLoader();
    loader.load(
      this.modelPath,
      (obj) => {
        this.manequin = obj;
        this.manequin.position.set(this.c, this.maxy, this.r);
        this.manequin.scale.set(10, 10, 10);
        this.manequin.rotation.x = -Math.PI / 2;

        obj.traverse((child) => {
          if (child.isMesh) {
            child.material = new THREE.MeshStandardMaterial({
              color: this.color,
              emissive: this.color,
              emissiveIntensity: 1.45,
              roughness: 0.5,
              metalness: 0.3,
            });
          }
        });

        this.scene.add(this.manequin);
        this.float();
        console.log("Ghost model loaded and added to scene.");
      },
      undefined,
      (error) => {
        console.error("Failed to load ghost model.", error);
      }
    );
  }

  reset() {
    this.r = this.ro;
    this.c = this.co;
    this.dr = 0;
    this.dc = 0;

    this.position = new THREE.Vector2(this.r, this.c);
    this.orientation = 0;
    this.nextPos = new THREE.Vector2(this.r, this.c);
    this.nextDir = new THREE.Vector2(this.dr, this.dc);
  }

  float() {
    if (this.manequin == null) {
      requestAnimationFrame(() => this.float());
      return;
    }

    this.manequin.position.y += 0.05 * this.floatDir;

    if (this.manequin.position.y >= this.maxy) {
      this.floatDir = -1;
    } else if (this.manequin.position.y <= this.miny) {
      this.floatDir = 1;
    }

    requestAnimationFrame(() => this.float());
  }

  frightenedChoice(moves) {
    const prefs = [
      [0, 1],
      [1, 0],
      [0, -1],
      [-1, 0],
    ];
    let index = Math.floor(Math.random() * 4 - 0.0001);
    for (let i = 0; i < 4; i++) {
      let j = (index + i) % 4;
      if (
        moves.get(prefs[j].toString()) &&
        !(prefs[j][0] == -this.dr && prefs[j][1] == -this.dc)
      )
        return [
          [prefs[j][0] + this.r, prefs[j][1] + this.c],
          prefs[j],
        ];
    }
    return [[this.r, this.c], [0, 0]];
  }

  nextPosition(maze) {
    const moves = new Map();
    moves.set([0, 1].toString(), maze[this.r][this.c + 1] != 1);
    moves.set([1, 0].toString(), maze[this.r + 1][this.c] != 1);
    moves.set([0, -1].toString(), maze[this.r][this.c - 1] != 1);
    moves.set([-1, 0].toString(), maze[this.r - 1][this.c] != 1);

    if (this.state == 2) {
      return this.frightenedChoice(moves);
    }

    if (
      !moves.get([this.dr, this.dc].toString()) ||
      (this.dr == 0 &&
        (moves.get([1, 0].toString()) || moves.get([-1, 0].toString()))) ||
      (this.dc == 0 &&
        (moves.get([0, 1].toString()) || moves.get([0, -1].toString())))
    ) {
      let bestDirection = [0, 0];
      let bestDistance = 1e10;

      [[0, 1], [1, 0], [0, -1], [-1, 0]].forEach((key) => {
        if (moves.get(key.toString()) && !(key[0] == -this.dr && key[1] == -this.dc)) {
          let tempDist = 1e9;
          if (this.state == 0)
            tempDist =
              (key[0] + this.r - this.str) ** 2 +
              (key[1] + this.c - this.stc) ** 2;
          if (this.state == 1)
            tempDist =
              (key[0] + this.r - this.tr) ** 2 +
              (key[1] + this.c - this.tc) ** 2;

          if (tempDist < bestDistance) {
            bestDirection = key;
            bestDistance = tempDist;
          }
        }
      });
      return [
        [bestDirection[0] + this.r, bestDirection[1] + this.c],
        bestDirection,
      ];
    } else {
      return [[this.dr + this.r, this.dc + this.c], [this.dr, this.dc]];
    }
  }

  forcedReversal() {
    this.dr *= -1;
    this.dc *= -1;
  }
}

