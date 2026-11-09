import * as THREE from 'three';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function makeCharacter(color, accent, isHuman) {
  const group = new THREE.Group();
  const cloth = new THREE.MeshStandardMaterial({color, roughness:.66});
  const trim = new THREE.MeshStandardMaterial({color:accent, metalness:.25, roughness:.4});
  const skin = new THREE.MeshStandardMaterial({color:'#bd8968', roughness:.8});
  const hair = new THREE.MeshStandardMaterial({color:'#201b18', roughness:.9});
  const dark = new THREE.MeshStandardMaterial({color:'#202b27', roughness:.8});
  const add=(geo,mat,pos,scale,rot)=>{const m=new THREE.Mesh(geo,mat);m.position.set(...pos);if(scale)m.scale.set(...scale);if(rot)m.rotation.set(...rot);m.castShadow=true;m.receiveShadow=true;group.add(m);return m;};
  add(new THREE.CapsuleGeometry(.43,.72,6,12),cloth,[0,1.35,0]);
  add(new THREE.SphereGeometry(.32,20,16),skin,[0,2.12,0]);
  add(new THREE.SphereGeometry(.335,18,10,0,Math.PI*2,0,Math.PI*.56),hair,[0,2.23,0]);
  add(new THREE.BoxGeometry(.52,.12,.12),trim,[0,1.73,.34]);
  add(new THREE.CapsuleGeometry(.14,.55,5,8),dark,[-.2,.48,0]);
  add(new THREE.CapsuleGeometry(.14,.55,5,8),dark,[.2,.48,0]);
  const armL=add(new THREE.CapsuleGeometry(.13,.55,5,8),cloth,[-.53,1.38,0],null,[0,0,-.2]);
  const armR=add(new THREE.CapsuleGeometry(.13,.55,5,8),cloth,[.53,1.38,0],null,[0,0,.2]);
  add(new THREE.BoxGeometry(.36,.12,.24),dark,[-.2,.12,.08]);
  add(new THREE.BoxGeometry(.36,.12,.24),dark,[.2,.12,.08]);
  // Small shoulder panels and belt make the silhouettes more readable.
  add(new THREE.SphereGeometry(.2,12,10),trim,[-.42,1.68,0],[1,.65,1]);
  add(new THREE.SphereGeometry(.2,12,10),trim,[.42,1.68,0],[1,.65,1]);
  const shadowRing=add(new THREE.TorusGeometry(.57,.025,8,32),new THREE.MeshBasicMaterial({color}),[0,.045,0],null,[Math.PI/2,0,0]);
  const badge=add(new THREE.CircleGeometry(.13,20),trim,[0,1.38,.42],null,[0,0,0]);
  group.userData.parts={armL,armR};
  group.userData.shadowRing=shadowRing;
  group.userData.human=isHuman;
  return group;
}
export class Player {
  constructor(name,x,z,color,human) {
    this.name=name; this.human=human; this.group=makeCharacter(color,human?'#f0d58b':'#f5c27c',human);
    this.group.position.set(x,0,z); this.velocity=new THREE.Vector3(); this.cooldown=0; this.pushFlash=0;
    this.captureBlend=0; this.walkTime=0; this.color=color;
  }
  reset(x,z) { this.group.position.set(x,0,z); this.velocity.set(0,0,0); this.cooldown=0; this.captureBlend=0; }
  update(dt,keys,opponent,isOwner=false) {
    const dir=new THREE.Vector3();
    if(keys.KeyA||keys.ArrowLeft)dir.x-=1;if(keys.KeyD||keys.ArrowRight)dir.x+=1;
    if(keys.KeyW||keys.ArrowUp)dir.z-=1;if(keys.KeyS||keys.ArrowDown)dir.z+=1;
    if(dir.lengthSq())dir.normalize();
    const dash=keys.ShiftLeft||keys.ShiftRight;
    const speed=dash?8.1:4.9;
    this.velocity.x=THREE.MathUtils.damp(this.velocity.x,dir.x*speed,10,dt);
    this.velocity.z=THREE.MathUtils.damp(this.velocity.z,dir.z*speed,10,dt);
    this.group.position.x=clamp(this.group.position.x+this.velocity.x*dt,-7.1,7.1);
    this.group.position.z=clamp(this.group.position.z+this.velocity.z*dt,-8.2,8.2);
    if(dir.lengthSq())this.group.rotation.y=Math.atan2(dir.x,dir.z);
    this.cooldown=Math.max(0,this.cooldown-dt);
    if(keys.Space&&this.cooldown===0){this.push(opponent);this.cooldown=.8;}
    this.animate(dt,dir.length(),isOwner);
  }
  updateAI(dt,opponent,match) {
    const p=this.group.position,o=opponent,dist=Math.hypot(o.x-p.x,o.z-p.z);
    let tx=0,tz=0;
    if(match.owner===1){tx=0;tz=-1.9;}
    else if(dist<3.3){tx=o.x;tz=o.z+Math.sign(p.z-o.z)*1.15;}
    else {tx=0;tz=1.2;}
    const dir=new THREE.Vector3(tx-p.x,0,tz-p.z);if(dir.length()>.12)dir.normalize();
    const speed=dist<2.2?4.35:3.75;
    this.velocity.x=THREE.MathUtils.damp(this.velocity.x,dir.x*speed,5,dt);
    this.velocity.z=THREE.MathUtils.damp(this.velocity.z,dir.z*speed,5,dt);
    p.x=clamp(p.x+this.velocity.x*dt,-7.1,7.1);p.z=clamp(p.z+this.velocity.z*dt,-8.2,8.2);
    if(dist<1.7&&this.cooldown<=0){this.push(opponent);this.cooldown=1.15;}
    this.cooldown=Math.max(0,this.cooldown-dt);
    if(dir.lengthSq())this.group.rotation.y=Math.atan2(dir.x,dir.z);
    this.animate(dt,dir.length(),match.owner===1);
  }
  animate(dt,moving,isOwner) {
    this.walkTime+=dt*(moving>.1?10:3);
    this.captureBlend=THREE.MathUtils.damp(this.captureBlend,isOwner?1:0,5,dt);
    const seated=this.captureBlend;
    this.group.position.y=Math.sin(this.walkTime)*.035*(1-seated);
    const parts=this.group.userData.parts;
    parts.armL.rotation.z=-.2-Math.sin(this.walkTime)*.16*(1-seated);
    parts.armR.rotation.z=.2+Math.sin(this.walkTime)*.16*(1-seated);
    // Stylized sit/capture pose: lower body, lean back and settle facing the VIP seat.
    this.group.position.y=THREE.MathUtils.lerp(this.group.position.y,-.22,seated);
    this.group.rotation.x=THREE.MathUtils.lerp(0,-.16,seated);
    parts.armL.rotation.z=THREE.MathUtils.lerp(parts.armL.rotation.z,-.8,seated);
    parts.armR.rotation.z=THREE.MathUtils.lerp(parts.armR.rotation.z,.8,seated);
  }
  push(opponent) {
    const a=this.group.position,b=opponent,len=Math.hypot(b.x-a.x,b.z-a.z);
    if(len<2.45&&len>.001){b.x=clamp(b.x+(b.x-a.x)/len*1.7,-7.1,7.1);b.z=clamp(b.z+(b.z-a.z)/len*1.7,-8.2,8.2);}
  }
}
