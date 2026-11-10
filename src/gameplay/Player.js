import * as THREE from 'three';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const mat=(color,roughness=.62,metalness=0)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
function makeCharacter(team,accent,isHuman){
  const root=new THREE.Group();
  const cloth=mat(team,.58), clothDark=mat(new THREE.Color(team).multiplyScalar(.58),.72), trim=mat(accent,.28,.48), skin=mat('#b97855',.82), skinLight=mat('#d4936b',.8), hair=mat('#171714',.9), shoe=mat('#171d1a',.82), white=mat('#f2e8d4',.5), black=mat('#171a18',.4);
  const add=(parent,geo,material,pos,scale,rot)=>{const m=new THREE.Mesh(geo,material);m.position.set(...pos);if(scale)m.scale.set(...scale);if(rot)m.rotation.set(...rot);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;};
  const torso=new THREE.Group();torso.position.y=1.22;root.add(torso);
  // Tailored kurta torso with layered shoulder panels and hem.
  add(torso,new THREE.CapsuleGeometry(.43,.67,8,18),cloth,[0,.17,0],[1.02,1.08,.76]);
  add(torso,new THREE.CylinderGeometry(.39,.46,.18,24),clothDark,[0,-.34,0]);
  add(torso,new THREE.BoxGeometry(.12,.72,.035),trim,[0,.12,.39]);
  add(torso,new THREE.SphereGeometry(.075,16,12),trim,[0,.36,.405]);
  // Collar, sash and waist belt.
  add(torso,new THREE.TorusGeometry(.19,.035,8,24),trim,[0,.49,.04],[1,1,.75],[Math.PI/2,0,0]);
  const sash=add(torso,new THREE.BoxGeometry(.22,.83,.045),trim,[.25,.06,.36],[1,1,1],[0,0,-.34]);
  add(torso,new THREE.TorusGeometry(.37,.045,8,32),trim,[0,-.18,0],[1,1,.78],[Math.PI/2,0,0]);
  // Neck and expressive head.
  add(torso,new THREE.CylinderGeometry(.13,.15,.2,16),skin,[0,.61,0]);
  const head=new THREE.Group();head.position.set(0,.91,.02);torso.add(head);
  add(head,new THREE.SphereGeometry(.31,28,22),skin,[0,0,0],[.9,1.08,.88]);
  add(head,new THREE.SphereGeometry(.305,24,16,0,Math.PI*2,0,Math.PI*.52),hair,[0,.12,-.005],[.98,1,.94]);
  // Hairline side locks, ears, brows, eyes and nose.
  for(const s of [-1,1]){
    add(head,new THREE.SphereGeometry(.075,12,10),skinLight,[s*.28,-.015,0],[.65,1,.7]);
    add(head,new THREE.BoxGeometry(.105,.035,.035),hair,[s*.115,.065,.266],[1,1,1],[0,0,s*.08]);
    add(head,new THREE.SphereGeometry(.035,12,10),white,[s*.11,.005,.274],[1,1,.55]);
    add(head,new THREE.SphereGeometry(.018,10,8),black,[s*.11,.005,.293]);
  }
  add(head,new THREE.ConeGeometry(.055,.16,10),skinLight,[0,-.04,.29],[.7,1,.8],[Math.PI/2,0,0]);
  add(head,new THREE.TorusGeometry(.085,.012,6,18,Math.PI),mat('#5b3025'),[0,-.13,.258],[1,.55,1],[0,0,Math.PI]);
  // Arms with shoulder pads and pivot joints.
  const arms=[];
  for(const s of [-1,1]){
    const arm=new THREE.Group();arm.position.set(s*.48,.43,0);torso.add(arm);
    add(arm,new THREE.SphereGeometry(.19,16,12),trim,[0,0,0],[1,.82,1]);
    add(arm,new THREE.CapsuleGeometry(.125,.46,6,12),cloth,[s*.015,-.32,.015],[1,1,1],[0,0,-s*.08]);
    add(arm,new THREE.SphereGeometry(.13,14,12),skin,[s*.015,-.64,.05]);
    add(arm,new THREE.TorusGeometry(.13,.025,6,18),trim,[s*.015,-.56,.02],[1,1,.8],[Math.PI/2,0,0]);
    arms.push(arm);
  }
  // Articulated legs, trousers and shoes.
  const legs=[];
  for(const s of [-1,1]){
    const leg=new THREE.Group();leg.position.set(s*.2,.77,0);root.add(leg);
    add(leg,new THREE.CapsuleGeometry(.145,.53,6,12),clothDark,[0,-.35,0]);
    add(leg,new THREE.SphereGeometry(.15,12,10),clothDark,[0,-.65,.01]);
    add(leg,new THREE.BoxGeometry(.34,.15,.48),shoe,[0,-.77,.13]);
    add(leg,new THREE.BoxGeometry(.23,.035,.02),trim,[0,-.73,.37]);
    legs.push(leg);
  }
  // Original team emblem on the chest.
  const emblem=add(torso,new THREE.CircleGeometry(.105,6),trim,[-.18,.19,.405]);
  emblem.rotation.z=Math.PI/6;
  const ring=add(root,new THREE.TorusGeometry(.58,.025,8,36),new THREE.MeshBasicMaterial({color:accent,transparent:true,opacity:.72}),[0,.04,0]);ring.rotation.x=Math.PI/2;
  root.userData={torso,head,arms,legs,ring,isHuman,team,accent};
  return root;
}
export class Player{
  constructor(name,x,z,color,human){this.name=name;this.human=human;this.group=makeCharacter(color,human?'#d8f6a0':'#ffd08a',human);this.group.position.set(x,0,z);this.velocity=new THREE.Vector3();this.cooldown=0;this.stun=0;this.walkTime=0;this.color=color;this.knockback=new THREE.Vector3();this.captureBlend=0;}
  reset(x,z){this.group.position.set(x,0,z);this.velocity.set(0,0,0);this.knockback.set(0,0,0);this.cooldown=0;this.stun=0;this.captureBlend=0;this.group.rotation.set(0,0,0);}
  update(dt,keys,opponent,isOwner=false){
    const dir=new THREE.Vector3();if(keys.KeyA||keys.ArrowLeft)dir.x--;if(keys.KeyD||keys.ArrowRight)dir.x++;if(keys.KeyW||keys.ArrowUp)dir.z--;if(keys.KeyS||keys.ArrowDown)dir.z++;
    if(dir.lengthSq())dir.normalize();const dash=keys.ShiftLeft||keys.ShiftRight;const speed=dash?8.8:5.2;
    if(this.stun>0){this.stun=Math.max(0,this.stun-dt);dir.set(0,0,0);}
    this.velocity.x=THREE.MathUtils.damp(this.velocity.x,dir.x*speed,9,dt);this.velocity.z=THREE.MathUtils.damp(this.velocity.z,dir.z*speed,9,dt);
    this.group.position.x=clamp(this.group.position.x+(this.velocity.x+this.knockback.x)*dt,-8.2,8.2);this.group.position.z=clamp(this.group.position.z+(this.velocity.z+this.knockback.z)*dt,-8.6,8.6);
    if(isOwner){dir.set(0,0,0);this.velocity.multiplyScalar(.12);this.group.position.x=THREE.MathUtils.damp(this.group.position.x,0,7,dt);this.group.position.z=THREE.MathUtils.damp(this.group.position.z,.92,7,dt);this.group.rotation.y=THREE.MathUtils.damp(this.group.rotation.y,Math.PI,5,dt);}
    this.knockback.multiplyScalar(Math.exp(-5.2*dt));if(dir.lengthSq())this.group.rotation.y=Math.atan2(dir.x,dir.z);
    this.cooldown=Math.max(0,this.cooldown-dt);if(keys.Space&&this.cooldown===0){this.push(opponent);this.cooldown=.9;}
    this.animate(dt,dir.length(),isOwner);
  }
  updateAI(dt,opponent,match){
    const p=this.group.position,o=opponent.group.position,dist=Math.hypot(o.x-p.x,o.z-p.z);let tx=0,tz=0;
    if(match.owner===1||match.captureProgress[1]>.45){tx=0;tz=.92;}else if(dist<3.8){tx=o.x;tz=o.z+Math.sign(p.z-o.z)*1.05;}else{tx=0;tz=1.0;}
    const dir=new THREE.Vector3(tx-p.x,0,tz-p.z);if(dir.length()>.12)dir.normalize();
    const speed=dist<2.2?4.6:4.0;this.velocity.x=THREE.MathUtils.damp(this.velocity.x,dir.x*speed,5,dt);this.velocity.z=THREE.MathUtils.damp(this.velocity.z,dir.z*speed,5,dt);
    if(this.stun>0){this.stun=Math.max(0,this.stun-dt);this.velocity.multiplyScalar(.3);}
    p.x=clamp(p.x+(this.velocity.x+this.knockback.x)*dt,-8.2,8.2);p.z=clamp(p.z+(this.velocity.z+this.knockback.z)*dt,-8.6,8.6);if(match.owner===1){this.velocity.multiplyScalar(.12);p.x=THREE.MathUtils.damp(p.x,0,7,dt);p.z=THREE.MathUtils.damp(p.z,.92,7,dt);this.group.rotation.y=THREE.MathUtils.damp(this.group.rotation.y,Math.PI,5,dt);}this.knockback.multiplyScalar(Math.exp(-5.2*dt));
    if(dist<1.8&&this.cooldown<=0){this.push(opponent);this.cooldown=1.2;}this.cooldown=Math.max(0,this.cooldown-dt);if(dir.lengthSq())this.group.rotation.y=Math.atan2(dir.x,dir.z);this.animate(dt,dir.length(),match.owner===1);
  }
  animate(dt,moving,isOwner){this.walkTime+=dt*(moving>.1?12:2.4);const u=this.group.userData;this.captureBlend=THREE.MathUtils.damp(this.captureBlend,isOwner?1:0,4.5,dt);const seated=this.captureBlend;
    u.legs[0].rotation.x=Math.sin(this.walkTime)*.62*(moving>.1?1:0)*(1-seated);u.legs[1].rotation.x=-Math.sin(this.walkTime)*.62*(moving>.1?1:0)*(1-seated);
    u.arms[0].rotation.x=-Math.sin(this.walkTime)*.42*(moving>.1?1:0)*(1-seated);u.arms[1].rotation.x=Math.sin(this.walkTime)*.42*(moving>.1?1:0)*(1-seated);
    u.torso.rotation.x=THREE.MathUtils.lerp(Math.sin(this.walkTime*2)*.035*(moving>.1?1:0),-.22,seated);u.head.rotation.x=-u.torso.rotation.x*.4;
    u.legs[0].rotation.x=THREE.MathUtils.lerp(u.legs[0].rotation.x,-1.18,seated);u.legs[1].rotation.x=THREE.MathUtils.lerp(u.legs[1].rotation.x,-1.18,seated);
    u.arms[0].rotation.x=THREE.MathUtils.lerp(u.arms[0].rotation.x,-.8,seated);u.arms[1].rotation.x=THREE.MathUtils.lerp(u.arms[1].rotation.x,-.8,seated);
    this.group.position.y=Math.sin(this.walkTime*2)*.025*(moving>.1?1:0)-.12*seated;u.ring.material.opacity=.55+.2*Math.sin(this.walkTime*3);
  }
  push(opponent){const a=this.group.position,b=opponent.group?opponent.group.position:opponent,len=Math.hypot(b.x-a.x,b.z-a.z);if(len<2.65&&len>.001){const nx=(b.x-a.x)/len,nz=(b.z-a.z)/len;opponent.knockback?.set(nx*11.5,0,nz*11.5);if(opponent.group)opponent.stun=.55;else{b.x=clamp(b.x+nx*1.6,-8.2,8.2);b.z=clamp(b.z+nz*1.6,-8.6,8.6);}}}
}
