
export class Player { 
    constructor(scene, x, y, z) { 
      const geometry = new THREE.SphereGeometry(0.5, 32, 32); 
      const material = new THREE.MeshBasicMaterial({ color: 0xffff00 }); 
      this.mesh = new THREE.Mesh(geometry, material); 
      this.mesh.position.set(x, y, z); 
      scene.add(this.mesh); 
    } 
    updatePosition(delta, camera) { 
      if (moveForward) { 
        this.mesh.position.x -= delta * Math.sin(camera.rotation.y); 
        this.mesh.position.z -= delta * Math.cos(camera.rotation.y); 
      } 
      if (moveBackward) { 
        this.mesh.position.x += delta * Math.sin(camera.rotation.y); 
        this.mesh.position.z += delta * Math.cos(camera.rotation.y); 
      } 
      if (turnLeft) { 
        camera.rotation.y += delta; 
      } 
      if (turnRight) { 
        camera.rotation.y -= delta; 
      } 
      camera.position.set(this.mesh.position.x, this.mesh.position.y + 1, this.mesh.position.z); 
    } 
  } 