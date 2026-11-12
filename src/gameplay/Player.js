import * as THREE from 'three';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const mat=(color,roughness=.72,metalness=0)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
const sphere=new THREE.SphereGeometry(1,20,16);
const cyl=(r1,r2,h)=>new THREE.CylinderGeometry(r1,r2,h,18,1,false);

function makeCharacter(team,accent,isHuman,name=''){
  const root=new THREE.Group();
  const isMitraman=/mitra/i.test(name)||team==='#35d990';
  const saffron=isMitraman;
  const skin=mat(saffron?'#c98e70':'#c68d70',.84), skinHi=mat('#e0ad8d',.82), skinShade=mat('#93624f',.9);
  const cloth=mat(saffron?'#e87916':'#dedbd2',.88), clothLight=mat(saffron?'#ff9b32':'#f5f2e9',.82), clothDark=mat(saffron?'#a94b0d':'#aaa69d',.94);
  const seam=mat(saffron?'#f4a34b':'#b8b2a7',.8), hair=mat(saffron?'#d6d1c9':'#aaa9a4',.95), hairDark=mat('#777a7a',.96);
  const eyeWhite=mat('#f6eee4',.5), iris=mat('#33231d',.45), shoe=mat(saffron?'#4b4035':'#282b2e',.82), sole=mat('#b6a58c',.9);
  const gold=mat('#d6a84d',.32,.58), dark=mat('#25201e',.75);
  const add=(parent,geo,material,pos=[0,0,0],scale=null,rot=null)=>{const m=new THREE.Mesh(geo,material);m.position.set(...pos);if(scale)m.scale.set(...scale);if(rot)m.rotation.set(...rot);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;};
  const ell=(parent,material,pos,scale)=>add(parent,sphere,material,pos,scale);
  const limb=(parent,material,top,bottom,length,pos)=>{const g=new THREE.Group();g.position.set(...pos);parent.add(g);add(g,cyl(top,bottom,length),material,[0,-length/2,0]);ell(g,material,[0,-length,0],[bottom,bottom,bottom]);return g;};

  // Feet, loose trousers and articulated legs.
  const legs=[];
  for(const side of [-1,1]){
    const hip=new THREE.Group();hip.position.set(side*.205,.91,0);root.add(hip);
    ell(hip,clothDark,[0,-.10,0],[.19,.20,.18]);
    const upper=limb(hip,clothDark,.19,.145,.48,[0,-.13,0]);
    ell(upper,cloth,[0,-.22,.012],[.17,.28,.16]);
    const knee=new THREE.Group();knee.position.set(0,-.55,0);hip.add(knee);
    limb(knee,cloth,.145,.105,.42,[0,-.20,0]);
    ell(knee,clothLight,[0,-.31,.015],[.13,.19,.13]);
    // Fabric folds on the loose pajama.
    for(let i=0;i<3;i++){
      const fold=add(knee,new THREE.TorusGeometry(.112+i*.008,.008,5,16),seam,[0,-.28-i*.055,.01]);fold.rotation.x=Math.PI/2;
    }
    const foot=new THREE.Group();foot.position.set(0,-.43,.015);knee.add(foot);
    add(foot,new THREE.BoxGeometry(.24,.07,.39),shoe,[0,-.025,.105]);
    add(foot,new THREE.BoxGeometry(.245,.035,.40),sole,[0,-.066,.105]);
    // Open sandal straps.
    add(foot,new THREE.BoxGeometry(.19,.035,.045),clothLight,[0,.005,.12],[1,1,1],[0,0,-.16]);
    legs.push({hip,knee,foot});
  }

  // Kurta body: tapered cloth silhouette, hem, placket and collar.
  const torso=new THREE.Group();torso.position.y=1.40;root.add(torso);
  add(torso,cyl(.37,.48,1.02),cloth,[0,-.02,0]);
  ell(torso,cloth,[0,.43,0],[.38,.25,.29]);
  add(torso,cyl(.49,.47,.12),clothDark,[0,-.53,0]);
  add(torso,new THREE.BoxGeometry(.075,.77,.025),seam,[0,.02,.354]);
  for(let i=0;i<4;i++)ell(torso,gold,[0,.31-i*.16,.374],[.018,.018,.012]);
  // Natural shoulder and chest shaping.
  ell(torso,clothLight,[-.20,.31,.12],[.20,.22,.24]);ell(torso,clothLight,[.20,.31,.12],[.20,.22,.24]);
  add(torso,new THREE.TorusGeometry(.17,.035,8,24),clothDark,[0,.49,0],[1,1,.82],[Math.PI/2,0,0]);
  // Side seams and fabric creases.
  for(const side of [-1,1])for(let i=0;i<3;i++){
    add(torso,new THREE.BoxGeometry(.012,.43,.012),seam,[side*(.32+i*.018),-.06,.08],[1,1,1],[0,0,side*.05]);
  }

  // Neck and highly readable face silhouette.
  add(torso,cyl(.105,.12,.22),skin,[0,.61,0]);
  const head=new THREE.Group();head.position.set(0,.86,.015);torso.add(head);
  ell(head,skin,[0,0,0],[.265,.335,.245]);
  ell(head,skin,[0,-.105,.085],[.225,.19,.19]); // jaw
  ell(head,skinHi,[0,.12,.115],[.205,.19,.145]); // forehead
  for(const side of [-1,1]){
    ell(head,skin,[side*.258,-.015,0],[.062,.09,.055]);
    ell(head,skinHi,[side*.267,-.018,.035],[.028,.045,.02]);
    ell(head,skinShade,[side*.105,-.045,.219],[.075,.022,.012]);
    ell(head,eyeWhite,[side*.103,.025,.218],[.064,.038,.025]);
    ell(head,iris,[side*.103,.023,.241],[.022,.026,.012]);
    ell(head,dark,[side*.103,.023,.251],[.010,.014,.006]);
    add(head,new THREE.BoxGeometry(.12,.025,.035),hairDark,[side*.105,.092,.213],[1,1,1],[0,0,side*.08]);
  }
  // Nose bridge, nostrils, lips and cheek shading.
  ell(head,skinHi,[0,-.005,.242],[.047,.09,.045]);ell(head,skin,[0,-.055,.27],[.065,.035,.045]);
  for(const side of [-1,1])ell(head,skinShade,[side*.038,-.071,.294],[.014,.009,.008]);
  add(head,new THREE.TorusGeometry(.052,.009,6,16,Math.PI),skinShade,[0,-.145,.226],[1,.45,1],[0,0,Math.PI]);
  ell(head,skinHi,[-.15,-.07,.155],[.07,.06,.035]);ell(head,skinHi,[.15,-.07,.155],[.07,.06,.035]);
  // Character-specific hair: elderly silver side hair for Mitraman, swept grey hair for Yatra Boy.
  if(saffron){
    for(const side of [-1,1])ell(head,hair,[side*.19,.105,-.005],[.09,.17,.22]);
    ell(head,hairDark,[0,.205,-.055],[.16,.045,.17]);
  }else{
    ell(head,hair,[0,.235,-.015],[.235,.105,.23]);
    for(let i=0;i<5;i++)ell(head,hairDark,[-.16+i*.08,.26,.03],[.07,.055,.12]);
    ell(head,hair,[.19,.08,-.005],[.075,.15,.19]);
  }
  // Optional subtle spectacles on Mitraman, as in the reference image.
  if(saffron){
    for(const side of [-1,1]){const frame=add(head,new THREE.TorusGeometry(.061,.008,6,20),gold,[side*.103,.025,.25]);frame.scale.set(1,.72,1);}
    add(head,new THREE.BoxGeometry(.09,.009,.009),gold,[0,.026,.25]);
  }

  // Sleeves, forearms, articulated elbows and hands with fingers.
  const arms=[];
  for(const side of [-1,1]){
    const shoulder=new THREE.Group();shoulder.position.set(side*.39,.36,0);torso.add(shoulder);
    ell(shoulder,clothLight,[0,0,0],[.19,.20,.19]);
    limb(shoulder,cloth,.18,.135,.42,[side*.025,-.22,0]);
    const elbow=new THREE.Group();elbow.position.set(side*.025,-.43,0);shoulder.add(elbow);
    limb(elbow,clothLight,.125,.092,.36,[0,-.17,.015]);
    const hand=new THREE.Group();hand.position.set(0,-.37,.045);elbow.add(hand);
    ell(hand,skin,[0,-.045,.015],[.095,.105,.07]);
    for(let f=0;f<4;f++){
      const finger=add(hand,cyl(.018,.014,.105),skin,[-.06+f*.04,-.125,.035]);finger.rotation.z=(f-1.5)*-.08;
      ell(hand,skin,[-.06+f*.04,-.18,.035],[.018,.025,.018]);
    }
    const thumb=add(hand,cyl(.023,.017,.09),skin,[side*.105,-.075,.045]);thumb.rotation.z=-side*.75;
    arms.push({shoulder,elbow,hand});
  }

  // Back drape / shoulder cloth accent and team badge.
  add(torso,new THREE.BoxGeometry(.16,.44,.045),clothDark,[saffron?.26:-.26,-.02,-.29],[1,1,1],[0,0,saffron?-.18:.18]);
  const badge=add(torso,new THREE.CircleGeometry(.075,24),gold,[-.20,.20,.365]);badge.rotation.z=.2;
  const aura=new THREE.Mesh(new THREE.TorusGeometry(.56,.018,6,32),new THREE.MeshBasicMaterial({color:accent,transparent:true,opacity:.42,depthWrite:false}));aura.rotation.x=Math.PI/2;aura.position.y=.035;root.add(aura);
  root.userData={torso,head,arms,legs,aura,isHuman,team,accent,saffron};
  root.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
  return root;
}

export class Player{
  constructor(name,x,z,color,human){this.name=name;this.human=human;this.group=makeCharacter(color,human?'#ffad36':'#58b9ff',human,name);this.group.position.set(x,0,z);this.velocity=new THREE.Vector3();this.cooldown=0;this.stun=0;this.walkTime=0;this.color=color;this.knockback=new THREE.Vector3();this.captureBlend=0;this.attackPose=0;this.actionCooldown=0;this.actionName='';this.actionTime=0;this.hitFlash=0;}
  reset(x,z){this.group.position.set(x,0,z);this.velocity.set(0,0,0);this.knockback.set(0,0,0);this.cooldown=0;this.stun=0;this.captureBlend=0;this.actionCooldown=0;this.actionTime=0;this.actionName='';this.hitFlash=0;this.group.rotation.set(0,0,0);}
  update(dt,keys,opponent,isOwner=false){
    const dir=new THREE.Vector3();if(keys.KeyA||keys.ArrowLeft)dir.x--;if(keys.KeyD||keys.ArrowRight)dir.x++;if(keys.KeyW||keys.ArrowUp)dir.z--;if(keys.KeyS||keys.ArrowDown)dir.z++;
    if(dir.lengthSq())dir.normalize();const speed=(keys.ShiftLeft||keys.ShiftRight)?8.2:4.9;
    if(this.stun>0){this.stun=Math.max(0,this.stun-dt);dir.set(0,0,0);}
    this.velocity.x=THREE.MathUtils.damp(this.velocity.x,dir.x*speed,8,dt);this.velocity.z=THREE.MathUtils.damp(this.velocity.z,dir.z*speed,8,dt);
    this.group.position.x=clamp(this.group.position.x+(this.velocity.x+this.knockback.x)*dt,-8.2,8.2);this.group.position.z=clamp(this.group.position.z+(this.velocity.z+this.knockback.z)*dt,-8.6,8.6);
    if(isOwner){dir.set(0,0,0);this.velocity.multiplyScalar(.12);this.group.position.x=THREE.MathUtils.damp(this.group.position.x,0,7,dt);this.group.position.z=THREE.MathUtils.damp(this.group.position.z,.92,7,dt);this.group.rotation.y=THREE.MathUtils.damp(this.group.rotation.y,Math.PI,5,dt);}
    this.knockback.multiplyScalar(Math.exp(-5.2*dt));if(dir.lengthSq())this.group.rotation.y=Math.atan2(dir.x,dir.z);
    this.cooldown=Math.max(0,this.cooldown-dt);this.actionCooldown=Math.max(0,this.actionCooldown-dt);this.actionTime=Math.max(0,this.actionTime-dt);this.hitFlash=Math.max(0,this.hitFlash-dt);
    if(keys.KeyJ||keys.Space)this.tryAction('punch',opponent);if(keys.KeyK)this.tryAction('kick',opponent);if(keys.KeyL)this.tryAction('grab',opponent);if(keys.KeyI)this.tryAction('super',opponent);
    this.animate(dt,dir.length(),isOwner);
  }
  updateAI(dt,opponent,match){
    const p=this.group.position,o=opponent.group.position,dist=Math.hypot(o.x-p.x,o.z-p.z);let tx=0,tz=0;
    if(match.owner===1||match.captureProgress[1]>.45){tx=0;tz=.92;}else if(dist<3.8){tx=o.x;tz=o.z+Math.sign(p.z-o.z)*1.05;}else{tx=0;tz=1.0;}
    const dir=new THREE.Vector3(tx-p.x,0,tz-p.z);if(dir.length()>.12)dir.normalize();
    const speed=dist<2.2?4.35:3.85;this.velocity.x=THREE.MathUtils.damp(this.velocity.x,dir.x*speed,5,dt);this.velocity.z=THREE.MathUtils.damp(this.velocity.z,dir.z*speed,5,dt);
    if(this.stun>0){this.stun=Math.max(0,this.stun-dt);this.velocity.multiplyScalar(.3);}
    p.x=clamp(p.x+(this.velocity.x+this.knockback.x)*dt,-8.2,8.2);p.z=clamp(p.z+(this.velocity.z+this.knockback.z)*dt,-8.6,8.6);
    if(match.owner===1){this.velocity.multiplyScalar(.12);p.x=THREE.MathUtils.damp(p.x,0,7,dt);p.z=THREE.MathUtils.damp(p.z,.92,7,dt);this.group.rotation.y=THREE.MathUtils.damp(this.group.rotation.y,Math.PI,5,dt);}
    this.knockback.multiplyScalar(Math.exp(-5.2*dt));this.cooldown=Math.max(0,this.cooldown-dt);this.actionCooldown=Math.max(0,this.actionCooldown-dt);this.actionTime=Math.max(0,this.actionTime-dt);this.hitFlash=Math.max(0,this.hitFlash-dt);if(dist<2.35&&this.actionCooldown<=0&&Math.random()<dt*.8){this.tryAction(Math.random()<.65?'punch':'kick',opponent); }if(dir.lengthSq())this.group.rotation.y=Math.atan2(dir.x,dir.z);this.animate(dt,dir.length(),match.owner===1);
  }
  tryAction(type,opponent){
    if(this.actionCooldown>0||this.stun>0)return false;
    const target=opponent.group?opponent.group.position:opponent;const me=this.group.position;
    const dx=target.x-me.x,dz=target.z-me.z,dist=Math.hypot(dx,dz);
    const reach=type==='grab'?1.75:type==='kick'?2.75:type==='super'?3.25:2.35;
    this.actionName=type;this.actionTime=type==='super'?.62:type==='grab'?.48:.34;
    this.actionCooldown=type==='super'?4.2:type==='grab'?1.25:type==='kick'?.72:.48;
    if(dist<=reach&&dist>.001){
      const nx=dx/dist,nz=dz/dist;const force=type==='super'?15:type==='kick'?9.5:type==='grab'?6.5:7.2;
      if(opponent.group){opponent.knockback.set(nx*force,0,nz*force);opponent.stun=type==='super'?1.05:type==='grab'?.72:.48;opponent.hitFlash=.22;}
      else {target.x=clamp(target.x+nx*(type==='super'?2.4:1.15),-8.2,8.2);target.z=clamp(target.z+nz*(type==='super'?2.4:1.15),-8.6,8.6);}
    }
    return true;
  }
  animate(dt,moving,isOwner){
    this.walkTime+=dt*(moving>.1?10:2.2);const u=this.group.userData;this.captureBlend=THREE.MathUtils.damp(this.captureBlend,isOwner?1:0,4.5,dt);const seated=this.captureBlend;
    const swing=Math.sin(this.walkTime)*.48*(moving>.1?1:0)*(1-seated);
    u.legs[0].hip.rotation.x=swing;u.legs[1].hip.rotation.x=-swing;
    u.legs[0].knee.rotation.x=Math.max(0,-swing)*.45;u.legs[1].knee.rotation.x=Math.max(0,swing)*.45;
    u.arms[0].shoulder.rotation.x=-swing*.72;u.arms[1].shoulder.rotation.x=swing*.72;
    u.arms[0].elbow.rotation.x=-.12;u.arms[1].elbow.rotation.x=-.12;
    u.torso.rotation.x=THREE.MathUtils.lerp(Math.sin(this.walkTime*2)*.025*(moving>.1?1:0),-.18,seated);
    u.head.rotation.x=-u.torso.rotation.x*.35;
    for(const leg of u.legs){leg.hip.rotation.x=THREE.MathUtils.lerp(leg.hip.rotation.x,-.72,seated);leg.knee.rotation.x=THREE.MathUtils.lerp(leg.knee.rotation.x,1.12,seated);}
    for(const arm of u.arms){arm.shoulder.rotation.x=THREE.MathUtils.lerp(arm.shoulder.rotation.x,-.48,seated);arm.elbow.rotation.x=THREE.MathUtils.lerp(arm.elbow.rotation.x,-.45,seated);}
    const attack=this.actionTime>0?Math.sin((1-this.actionTime/(this.actionName==='super'?.62:this.actionName==='grab'?.48:.34))*Math.PI):0;
    if(attack>0&&!seated){const a=u.arms[1];if(this.actionName==='punch'||this.actionName==='super'){a.shoulder.rotation.x-=attack*(this.actionName==='super'?1.65:1.15);a.elbow.rotation.x-=attack*.65;}else if(this.actionName==='grab'){u.arms[0].shoulder.rotation.x-=attack*.8;u.arms[1].shoulder.rotation.x-=attack*.8;}if(this.actionName==='kick'){u.legs[1].hip.rotation.x-=attack*1.35;u.legs[1].knee.rotation.x+=attack*.35;}}
    if(this.stun>0&&!seated){u.torso.rotation.x-=.22;u.head.rotation.x+=.18;}
    this.group.position.y=Math.sin(this.walkTime*2)*.018*(moving>.1?1:0)-.08*seated;
    u.aura.material.opacity=.34+.14*Math.sin(this.walkTime*2.4);
  }
  push(opponent){const a=this.group.position,b=opponent.group?opponent.group.position:opponent,len=Math.hypot(b.x-a.x,b.z-a.z);if(len<2.65&&len>.001){const nx=(b.x-a.x)/len,nz=(b.z-a.z)/len;opponent.knockback?.set(nx*10.2,0,nz*10.2);if(opponent.group)opponent.stun=.55;else{b.x=clamp(b.x+nx*1.6,-8.2,8.2);b.z=clamp(b.z+nz*1.6,-8.6,8.6);}}}
}
