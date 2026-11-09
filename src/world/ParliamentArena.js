import * as THREE from 'three';
const material=(color,roughness=.78,metalness=0)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
export function createArena(scene){
  const root=new THREE.Group();scene.add(root);
  const floor=new THREE.Mesh(new THREE.CylinderGeometry(11.5,11.5,.55,80),material('#1d3429'));floor.position.y=-.38;floor.receiveShadow=true;root.add(floor);
  const play=new THREE.Mesh(new THREE.CylinderGeometry(8.8,8.8,.09,80),material('#365c42'));play.position.y=-.07;play.receiveShadow=true;root.add(play);
  const edge=new THREE.Mesh(new THREE.TorusGeometry(9.15,.13,12,100),material('#c8a45e',.28,.72));edge.rotation.x=Math.PI/2;edge.position.y=.02;root.add(edge);
  const outer=new THREE.Mesh(new THREE.CylinderGeometry(12.2,12.2,3.8,80,1,true),new THREE.MeshStandardMaterial({color:'#14271f',roughness:.95,side:THREE.DoubleSide}));outer.position.y=1.45;root.add(outer);
  // Raised gallery tiers around the circular chamber.
  for(let tier=0;tier<3;tier++){
    const r=9.7+tier*.65;
    const rail=new THREE.Mesh(new THREE.TorusGeometry(r,.085,8,100),material(tier===1?'#8e7447':'#354b3b',.45,.45));rail.rotation.x=Math.PI/2;rail.position.y=.9+tier*.68;root.add(rail);
    for(let i=0;i<44;i++){
      const a=i/44*Math.PI*2,x=Math.cos(a)*r,z=Math.sin(a)*r;
      const seat=new THREE.Mesh(new THREE.BoxGeometry(.48,.38,.38),material((i+tier)%3===0?'#8b503b':'#344f40'));
      seat.position.set(x,.72+tier*.68,z);seat.lookAt(0,seat.position.y,0);root.add(seat);
      const head=new THREE.Mesh(new THREE.SphereGeometry(.13,10,8),material(i%2?'#b47e5e':'#d3a17a'));
      head.position.set(x,.98+tier*.68,z);root.add(head);
    }
  }
  // Tall ceremonial pillars, gold caps and alternating party-colour banners.
  for(let i=0;i<24;i++){
    const a=i/24*Math.PI*2,x=Math.cos(a)*10.15,z=Math.sin(a)*10.15;
    const pillar=new THREE.Mesh(new THREE.CylinderGeometry(.19,.29,3.9,12),material('#b49a69',.35,.55));pillar.position.set(x,1.55,z);pillar.castShadow=true;root.add(pillar);
    const cap=new THREE.Mesh(new THREE.SphereGeometry(.22,12,10),material('#e5c77d',.25,.6));cap.position.set(x,3.55,z);root.add(cap);
    if(i%2===0){
      const flag=new THREE.Mesh(new THREE.PlaneGeometry(.85,.55),new THREE.MeshStandardMaterial({color:i%4===0?'#27794f':'#c76e32',side:THREE.DoubleSide,roughness:.8}));
      flag.position.set(x+Math.cos(a)*.48,2.85,z+Math.sin(a)*.48);flag.rotation.y=-a;root.add(flag);
    }
  }
  // Stage lighting.
  scene.add(new THREE.HemisphereLight('#d9f5e4','#17241d',2.15));
  const key=new THREE.DirectionalLight('#ffe5bd',3.3);key.position.set(-7,15,9);key.castShadow=true;key.shadow.mapSize.set(2048,2048);key.shadow.camera.left=-16;key.shadow.camera.right=16;key.shadow.camera.top=16;key.shadow.camera.bottom=-16;scene.add(key);
  for(let i=0;i<6;i++){const a=i/6*Math.PI*2;const spot=new THREE.SpotLight(i%2?'#f7c57d':'#8be6bd',65,23,.42,.55,1.4);spot.position.set(Math.cos(a)*8,8,Math.sin(a)*8);spot.target.position.set(0,0,0);scene.add(spot,spot.target);}
  const green=new THREE.PointLight('#3be99b',30,18);green.position.set(-6,4,-5);scene.add(green);
  const amber=new THREE.PointLight('#ffae5d',28,18);amber.position.set(6,4,5);scene.add(amber);
  return root;
}
