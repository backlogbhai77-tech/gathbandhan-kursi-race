import * as THREE from 'three';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function capsule(color) {
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({color, roughness:.62});
  const dark = new THREE.MeshStandardMaterial({color:'#18231f',roughness:.8});
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(.48,.85,5,10),mat); torso.position.y=1.35; torso.castShadow=true; g.add(torso);
  const head = new THREE.Mesh(new THREE.SphereGeometry(.34,16,12),new THREE.MeshStandardMaterial({color:'#bd8c68'})); head.position.y=2.23; head.castShadow=true; g.add(head);
  const hair = new THREE.Mesh(new THREE.SphereGeometry(.35,16,8,0,Math.PI*2,0,Math.PI*.52),dark); hair.position.y=2.34; g.add(hair);
  for (const x of [-.22,.22]) { const leg=new THREE.Mesh(new THREE.CapsuleGeometry(.16,.62,4,8),dark); leg.position.set(x,.48,0); leg.castShadow=true; g.add(leg); }
  for (const x of [-.55,.55]) { const arm=new THREE.Mesh(new THREE.CapsuleGeometry(.14,.58,4,8),mat); arm.position.set(x,1.42,0); arm.rotation.z=x*.5; arm.castShadow=true; g.add(arm); }
  const ring = new THREE.Mesh(new THREE.TorusGeometry(.65,.035,8,28),new THREE.MeshBasicMaterial({color})); ring.rotation.x=Math.PI/2; ring.position.y=.08; g.add(ring);
  return g;
}
export class Player {
  constructor(name,x,z,color,human) {
    this.name=name; this.human=human; this.group=capsule(color); this.group.position.set(x,0,z); this.velocity=new THREE.Vector3(); this.cooldown=0; this.pushTime=0; this.baseColor=color;
    this.group.userData.name=name;
  }
  reset(x,z) { this.group.position.set(x,0,z); this.velocity.set(0,0,0); this.cooldown=0; }
  update(dt,keys,opponent) {
    const dir=new THREE.Vector3();
    if(keys.KeyA||keys.ArrowLeft) dir.x-=1; if(keys.KeyD||keys.ArrowRight) dir.x+=1;
    if(keys.KeyW||keys.ArrowUp) dir.z-=1; if(keys.KeyS||keys.ArrowDown) dir.z+=1;
    if(dir.lengthSq()) dir.normalize();
    const dash=keys.ShiftLeft||keys.ShiftRight;
    const speed=dash?8.5:5.1;
    this.velocity.x=THREE.MathUtils.damp(this.velocity.x,dir.x*speed,10,dt);
    this.velocity.z=THREE.MathUtils.damp(this.velocity.z,dir.z*speed,10,dt);
    this.group.position.x=clamp(this.group.position.x+this.velocity.x*dt,-7.2,7.2);
    this.group.position.z=clamp(this.group.position.z+this.velocity.z*dt,-8.5,8.5);
    if(dir.lengthSq()) this.group.rotation.y=Math.atan2(dir.x,dir.z);
    this.cooldown=Math.max(0,this.cooldown-dt);
    if(keys.Space && this.cooldown===0) { this.push(opponent); this.cooldown=.85; }
    this.group.position.y=Math.sin(performance.now()*.006+(this.human?0:1))*.035;
  }
  updateAI(dt,opponent,match) {
    const p=this.group.position, o=opponent;
    const targetZ=match.owner===1 ? -1.9 : 0;
    const dx=o.x-p.x, dz=o.z-p.z, dist=Math.hypot(dx,dz);
    let tx=0,tz=targetZ;
    if(match.owner===1 || dist<2.8) { tx=o.x; tz=o.z+Math.sign(p.z-o.z)*1.1; }
    else { tx=0; tz=targetZ; }
    const dir=new THREE.Vector3(tx-p.x,0,tz-p.z); if(dir.length()>0.1) dir.normalize();
    const speed=dist<2.1?4.5:3.65;
    this.velocity.x=THREE.MathUtils.damp(this.velocity.x,dir.x*speed,5,dt);
    this.velocity.z=THREE.MathUtils.damp(this.velocity.z,dir.z*speed,5,dt);
    p.x=clamp(p.x+this.velocity.x*dt,-7.2,7.2); p.z=clamp(p.z+this.velocity.z*dt,-8.5,8.5);
    if(dist<1.65 && this.cooldown<=0) { this.push(opponent); this.cooldown=1.25; }
    this.cooldown=Math.max(0,this.cooldown-dt);
    if(dir.lengthSq()) this.group.rotation.y=Math.atan2(dir.x,dir.z);
    p.y=Math.sin(performance.now()*.006+1)*.035;
  }
  push(opponent) {
    const a=this.group.position,b=opponent;
    const dx=b.x-a.x,dz=b.z-a.z,len=Math.hypot(dx,dz);
    if(len<2.35 && len>.001) { b.x=clamp(b.x+dx/len*1.65,-7.2,7.2); b.z=clamp(b.z+dz/len*1.65,-8.5,8.5); }
  }
}
