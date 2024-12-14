
export class  cubeCluster{
    constructor(cubeSize, color) {
        this.cubeSize =1;
        this.color = 0x00ff00;
        const material = new THREE.MeshStandardMaterial({color : this.color});
        const centerCube = new THREE.Mesh(new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize), material)
        const lCube = new THREE.Mesh(new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize), material);
        lCube.position.set(-cubeSize/2, 0,0);
        const rCube = new THREE.Mesh(new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize), material);
        rCube.position.set(cubeSize/2, 0,0);
        this.group = new THREE.Group();
        this.group.add(centerCube);
        this.group.add(lCube);
        this.group.add(rCube);
        this.cubes = [centerCube, lCube, rCube];
        this.group.position.set(0,0,0);
        this.floatDir = 0;
        this.miny = 1;
        this.maxy = 1;
    }
    
    getMesh() {
        return this.group;
    }
        


    colorChange(){
       for ( const cube of this.cubes) {
            cube.material.color.setHex(Math.random()*0x00ff00)
        }
    }
    float(){
       
        this.group.position.y += 0.01*this.floatDir

        if (this.group.position.y >= this.maxy)
            this.floatDir =-1;
            //move down greater than ... you've reached maxed height
       else if (headmesh.position.y <= this.miny )
            this.floatDir = 1;
       requestAnimationFrame(()=> this.float());
    }
}