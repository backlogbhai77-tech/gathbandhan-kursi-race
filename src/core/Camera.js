import * as THREE from 'three';
export class CameraRig {
  constructor(camera) {
    this.camera = camera;
    this.target = new THREE.Vector3(0, 1.2, 0);
    this.camera.position.set(0, 13.5, 21);
    this.camera.lookAt(this.target);
  }
  setTargets(a, b) { this.a = a; this.b = b; }
  update(dt) {
    if (!this.a || !this.b) return;
    const mid = new THREE.Vector3().addVectors(this.a.position, this.b.position).multiplyScalar(.5);
    const spread = Math.abs(this.a.position.z - this.b.position.z);
    const desired = new THREE.Vector3(mid.x * .12, 13.2 + Math.min(spread*.08,1.3), 21.5 + Math.min(spread*.12,2));
    this.camera.position.lerp(desired, 1 - Math.exp(-dt * 1.8));
    this.target.lerp(new THREE.Vector3(mid.x*.2, 1.3, mid.z*.12), 1 - Math.exp(-dt*2.4));
    this.camera.lookAt(this.target);
  }
}
