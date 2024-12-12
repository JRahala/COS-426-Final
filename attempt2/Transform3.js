export class Transform3{
    constructor(pos, mass){
        this.pos = pos;
        this.vel = new THREE.Vector3();
        this.rot = new THREE.Quaternion();

        this.mass = mass;
        this.invMass = this.mass === 0 ? 1e-12 : 1 / this.mass;
        this.netForce = new THREE.Vector3();
    }

    resetForce(){
        this.netForce = new THREE.Vector3();
    }

    integrate(dt){
        const acc = this.netForce.clone().multiplyScalar(this.invMass);
        this.vel.addScaledVector(acc, dt);
        this.pos.addScaledVector(this.vel, dt);
    }

    // Returns the global vectors that represent a local orientation to the transform
    getGlobalOrientation(){
        const forward = new THREE.Vector3(0, 0, 1);
        const up = new THREE.Vector3(0, 1, 0);
        const right = new THREE.Vector3(1, 0, 0);

        forward.applyQuaternion(this.rot);
        up.applyQuaternion(this.rot);
        right.applyQuaternion(this.rot);

        return { forward, up, right };
    }

    // Apply a force in the global orientation space
    applyGlobalForce(globalForce){
        this.netForce.add(globalForce);
    }

    // Apply a force in the local orientation space
    applyLocalForce(localForce){
        const globalForce = localForce.clone().applyQuaternion(this.rot);
        this.applyGlobalForce(globalForce);
    }

    // Rotate the transform such that old up becomes new up along the plane of rotation defined by those two vectors
    changeUpDirection(newUp) {
        newUp.normalize();
        const rotationAxis = new THREE.Vector3().crossVectors(this.getGlobalOrientation().up, newUp);
        if (rotationAxis.lengthSq() === 0) return;
        rotationAxis.normalize();

        const angle = Math.acos(this.getGlobalOrientation().up.dot(newUp));
        const rotationQuaternion = new THREE.Quaternion();
        rotationQuaternion.setFromAxisAngle(rotationAxis, angle);
        this.rot.multiply(rotationQuaternion);
    }
}

