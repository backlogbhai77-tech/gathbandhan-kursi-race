import * as THREE from 'three';
export class CameraRig{
 constructor(camera){this.camera=camera;this.target=new THREE.Vector3(0,1.8,0);this.camera.position.set(0,14.8,24.5);this.camera.lookAt(this.target);this.baseFov=42;}
 setTargets(a,b){this.a=a;this.b=b;}
 update(dt){if(!this.a||!this.b)return;const mid=new THREE.Vector3().addVectors(this.a.position,this.b.position).multiplyScalar(.5);const spread=Math.abs(this.a.position.x-this.b.position.x)+Math.abs(this.a.position.z-this.b.position.z)*.35;const desired=new THREE.Vector3(mid.x*.1,14.2+Math.min(spread*.08,1.1),24.2+Math.min(spread*.13,2.2));this.camera.position.lerp(desired,1-Math.exp(-dt*1.65));this.target.lerp(new THREE.Vector3(mid.x*.16,1.8,mid.z*.13),1-Math.exp(-dt*2.1));this.camera.lookAt(this.target);}
}
