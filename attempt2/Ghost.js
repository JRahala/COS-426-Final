import { OBJLoader } from 'https://cdn.jsdelivr.net/npm/three@0.155.0/examples/jsm/loaders/OBJLoader.js';

export class  addHeads{
  constructor(scene, modelPath, x, y,z) {
      this.scene = scene;
      this.modelPath = modelPath;
      this.x = x;
      this.y = y;
      this.z = z;
      this.manequin = null;
      this.floatDir = 1;
      this.loadModel();
  }
 
  loadModel() {
      const loader = new OBJLoader();
      loader.load(this.modelPath, (obj) => {
          this.manequin = obj.scene;
          this.mesh.position.set(this.x,this.y,this.z);
          this.scene.add(this.manequin);
          console.log ("model loaded and added to scene")


          this.float();
      },
      undefined,
      (error) =>{
          console.error("manequin hasn't loaded", error);
      }
      );
  }


 
 
 // want head to float
  float(){
      if(this.manequin == null) {
          requestAnimationFrame(()=> this.float());
          return;
      }
      this.headmesh.position.y += 0.01*this.floatDir


      if (this.manequin.position.y >= this.maxy)
          this.floatDir =-1;
          //move down greater than ... you've reached maxed height
     else if (headmesh.position.y <= this.miny )
          this.floatDir = 1;
     requestAnimationFrame(()=> this.float());
  }
}


