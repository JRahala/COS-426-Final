import { OBJLoader } from "../pacman3d/loaders/OBJLoader.js";

export class addHeads{
  constructor(scene, modelPath, x, y,z) {
      this.scene = scene;
      this.modelPath = modelPath;
      this.x = x;
      this.y = y;
      this.z = z;
      this.manequin = null;
      this.floatDir = 1;
      this.maxy = y + 1;
      this.miny = y - 1;
      this.loadModel();
  }
 
  loadModel() {
      const loader = new OBJLoader();
      loader.load(this.modelPath, (obj) => {
          this.manequin = obj;
          this.manequin.position.set(this.x,-this.y,this.z);
          this.manequin.scale.set(10, 10, 10);  
          this.manequin.rotation.x = -Math.PI/2;
          this.scene.add(this.manequin);

          console.log("model loaded and added to scene")
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
      this.manequin.position.y += 0.05*this.floatDir


      if (this.manequin.position.y >= this.maxy)
          this.floatDir =-1;
          //move down greater than ... you've reached maxed height
     else if (this.manequin.position.y <= this.miny )
          this.floatDir = 1;
     requestAnimationFrame(()=> this.float());
  }
}


