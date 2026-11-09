import * as THREE from 'three';
export class CameraRig {
  constructor(camera) { this.camera = camera; this.target = new THREE.Vector3(0, 0, 0); this.camera.position.set(0, 12, 19); this.camera.lookAt(0, 0, 0); }
  setTargets(a,b) { this.a=a; this.b=b; }
  update(dt) {
    if (!this.a || !this.b) return;
    const mid = new THREE.Vector3().addVectors(this.a.position, this.b.position).multiplyScalar(.5);
    const desired = new THREE.Vector3(mid.x * .18, 12.8, 19.5 + Math.abs(this.a.position.z-this.b.position.z)*.12);
    this.camera.position.lerp(desired, 1-Math.exp(-dt*2.2));
    this.target.lerp(new THREE.Vector3(mid.x*.22, 1.4, mid.z*.18), 1-Math.exp(-dt*3));
    this.camera.lookAt(this.target);
  }
}
