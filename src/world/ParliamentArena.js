import * as THREE from 'three';
const M=(c,r=.65,m=0)=>new THREE.MeshStandardMaterial({color:c,roughness:r,metalness:m});
function labelTexture(title,sub,color='#a7ef68'){
  const c=document.createElement('canvas');c.width=1024;c.height=256;const x=c.getContext('2d');
  x.fillStyle='#071a12';x.fillRect(0,0,1024,256);const g=x.createLinearGradient(0,0,1024,256);g.addColorStop(0,'#123b29');g.addColorStop(1,'#07140f');x.fillStyle=g;x.fillRect(0,0,1024,256);
  x.strokeStyle='#c9a86a';x.lineWidth=8;x.strokeRect(12,12,1000,232);x.textAlign='center';x.fillStyle=color;x.font='900 86px Arial';x.fillText(title,512,118);x.fillStyle='#f4e6c6';x.font='600 28px Arial';x.fillText(sub,512,177);
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;
}
function addMesh(g,geo,mat,pos,rot){const m=new THREE.Mesh(geo,mat);m.position.set(...pos);if(rot)m.rotation.set(...rot);m.castShadow=true;m.receiveShadow=true;g.add(m);return m;}
function makeFlag(g,x,y,z,color,angle){const pole=addMesh(g,new THREE.CylinderGeometry(.035,.05,2.5,10),M('#c6a76a',.3,.75),[x,y,z]);const cloth=addMesh(g,new THREE.PlaneGeometry(1.05,.68),new THREE.MeshStandardMaterial({color,side:THREE.DoubleSide,roughness:.8}),[x+.52,y+.72,z]);cloth.rotation.y=angle;cloth.rotation.z=-.08;return cloth;}
export function createArena(scene){
 const root=new THREE.Group();scene.add(root);
 const stone=M('#27372e',.82),dark=M('#101f18',.9),gold=M('#c7a568',.28,.72),goldDark=M('#80663c',.38,.62),velvet=M('#154a35',.58),floorMat=M('#31533e',.78),trim=M('#e2c58b',.3,.6);
 // Grand circular floor with concentric inlaid rings and radial sector lines.
 addMesh(root,new THREE.CylinderGeometry(15.8,16.4,.72,128),dark,[0,-.55,0]);
 addMesh(root,new THREE.CylinderGeometry(13.9,14.3,.18,128),stone,[0,-.08,0]);
 addMesh(root,new THREE.CylinderGeometry(9.1,9.1,.16,128),floorMat,[0,.02,0]);
 for(const r of [9.35,10.4,12.2,13.65]){const ring=addMesh(root,new THREE.TorusGeometry(r,.055,10,160),gold,[0,.14,0]);ring.rotation.x=Math.PI/2;}
 for(let i=0;i<32;i++){const a=i/32*Math.PI*2;const line=addMesh(root,new THREE.BoxGeometry(.035,.012,8.9),new THREE.MeshStandardMaterial({color:'#a8bd8a',transparent:true,opacity:.22}),[Math.sin(a)*4.5,.115,Math.cos(a)*4.5]);line.rotation.y=a;}
 // Outer retaining wall and architectural tiers.
 addMesh(root,new THREE.CylinderGeometry(16.1,16.1,5.6,128,1,true),new THREE.MeshStandardMaterial({color:'#111f18',roughness:.92,side:THREE.DoubleSide}),[0,2.05,0]);
 for(let tier=0;tier<4;tier++){
   const r=10.15+tier*1.27,y=1.0+tier*.86;
   const fascia=addMesh(root,new THREE.TorusGeometry(r,.18,10,160),tier%2?goldDark:gold,[0,y,0]);fascia.rotation.x=Math.PI/2;
   const ledge=addMesh(root,new THREE.TorusGeometry(r+.22,.11,8,160),dark,[0,y-.24,0]);ledge.rotation.x=Math.PI/2;
   // Dense audience rendered with instancing to keep mobile draw calls low.
   const count=56+tier*8, dummy=new THREE.Object3D();
   const seatMesh=new THREE.InstancedMesh(new THREE.BoxGeometry(.42,.16,.42),M('#273e32'),count);
   const backMesh=new THREE.InstancedMesh(new THREE.BoxGeometry(.42,.38,.12),M('#26392f'),count);
   const bodyMesh=new THREE.InstancedMesh(new THREE.CapsuleGeometry(.105,.24,3,7),M('#1e513c'),count);
   const headMesh=new THREE.InstancedMesh(new THREE.SphereGeometry(.105,10,8),M('#bd8968'),count);
   for(let i=0;i<count;i++){
     const a=i/count*Math.PI*2,x=Math.sin(a)*r,z=Math.cos(a)*r,ry=a+Math.PI;
     dummy.position.set(x,y,z);dummy.rotation.set(0,ry,0);dummy.scale.set(1,1,1);dummy.updateMatrix();seatMesh.setMatrixAt(i,dummy.matrix);seatMesh.setColorAt(i,new THREE.Color((i+tier)%5===0?'#a65e38':(i%3===0?'#245c42':'#273e32')));
     dummy.position.set(x,y+.23,z-.13*Math.cos(ry));dummy.updateMatrix();backMesh.setMatrixAt(i,dummy.matrix);
     dummy.position.set(x,y+.35,z);dummy.updateMatrix();bodyMesh.setMatrixAt(i,dummy.matrix);bodyMesh.setColorAt(i,new THREE.Color(['#1e513c','#a65f37','#d0b27b','#314e78','#5c4b35'][(i*7+tier*3)%5]));
     dummy.position.set(x,y+.59,z);dummy.updateMatrix();headMesh.setMatrixAt(i,dummy.matrix);headMesh.setColorAt(i,new THREE.Color(['#9e684d','#c18b68','#d2a17c','#87583f'][(i*3+tier)%4]));
   }
   seatMesh.instanceMatrix.needsUpdate=true;backMesh.instanceMatrix.needsUpdate=true;bodyMesh.instanceMatrix.needsUpdate=true;headMesh.instanceMatrix.needsUpdate=true;
   root.add(seatMesh,backMesh,bodyMesh,headMesh);
 }
 // Parliamentary colonnade: fluted columns, capitals, arches and party standards.
 for(let i=0;i<28;i++){
   const a=i/28*Math.PI*2,r=14.4,x=Math.sin(a)*r,z=Math.cos(a)*r;
   const col=new THREE.Group();col.position.set(x,0,z);col.rotation.y=-a;root.add(col);
   addMesh(col,new THREE.CylinderGeometry(.23,.34,5.5,20),M('#9b8a65',.34,.48),[0,2.72,0]);
   for(let f=0;f<8;f++){const fa=f/8*Math.PI*2;const rib=addMesh(col,new THREE.BoxGeometry(.035,4.9,.035),M('#d1bd8b',.32,.5),[Math.cos(fa)*.23,2.7,Math.sin(fa)*.23]);}
   addMesh(col,new THREE.CylinderGeometry(.48,.38,.24,20),gold,[0,5.48,0]);
   addMesh(col,new THREE.BoxGeometry(.78,.22,.78),goldDark,[0,5.7,0]);
   if(i%2===0)makeFlag(col,0,4.9,0,i%4===0?'#23834d':'#d87935',0);
 }
 // Rear ceremonial stage, broad stairs and a giant LED house screen.
 addMesh(root,new THREE.BoxGeometry(10,.7,2.8),dark,[0,.55,-11.5]);
 for(let i=0;i<5;i++)addMesh(root,new THREE.BoxGeometry(9.2-i*.35,.22,.55),stone,[0,.15+i*.22,-9.1-i*.52]);
 const screenMat=new THREE.MeshBasicMaterial({map:labelTexture('THE HOUSE OF THE PEOPLE','ONE THRONE • TWO ALLIANCES')});
 addMesh(root,new THREE.BoxGeometry(9.4,2.55,.28),goldDark,[0,6.2,-14]);addMesh(root,new THREE.PlaneGeometry(9.05,2.22),screenMat,[0,6.2,-13.83]);
 // Side LED ribbons and illuminated name banners.
 for(const side of [-1,1]){
   const banner= new THREE.Mesh(new THREE.PlaneGeometry(3.3,1.0),new THREE.MeshBasicMaterial({map:labelTexture(side<0?'MITRAMAN':'YATRA BOY','GATHBANDHAN KURSI RACE',side<0?'#79e9a9':'#ffb26d'),side:THREE.DoubleSide}));banner.position.set(side*10,4.9,-8);banner.rotation.y=side*.55;root.add(banner);
   for(let j=0;j<4;j++){const beam=addMesh(root,new THREE.BoxGeometry(.14,4,.14),gold,[side*(8.5+j*.65),2.5,-12.2]);}
 }
 // Decorative ceiling truss and suspended spotlights.
 const roofRing=addMesh(root,new THREE.TorusGeometry(13.5,.18,10,128),goldDark,[0,8.7,0]);roofRing.rotation.x=Math.PI/2;
 for(let i=0;i<4;i++){const a=i/4*Math.PI*2;const x=Math.sin(a)*13.5,z=Math.cos(a)*13.5;const beam=addMesh(root,new THREE.BoxGeometry(.12,1.8,.12),goldDark,[x,7.8,z]);beam.rotation.z=Math.sin(a)*.3;const lamp=new THREE.SpotLight(i%2?'#ffd69a':'#a5f5cb',18,24,.55,.7,1.4);lamp.position.set(x,8.2,z);lamp.target.position.set(0,0,0);scene.add(lamp,lamp.target);}
 // Lighting rig: cinematic key, fill, rim and local stage pools.
 scene.add(new THREE.HemisphereLight('#d8f1df','#15251c',0.85));
 const key=new THREE.DirectionalLight('#fff0d1',1.65);key.position.set(-8,17,11);key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-19;key.shadow.camera.right=19;key.shadow.camera.top=19;key.shadow.camera.bottom=-19;key.shadow.bias=-.00015;scene.add(key);
 const rim=new THREE.DirectionalLight('#79dca7',0.65);rim.position.set(9,8,-13);scene.add(rim);
 const amber=new THREE.PointLight('#ffb66e',10,18);amber.position.set(7,5,3);scene.add(amber);const green=new THREE.PointLight('#66efad',10,18);green.position.set(-7,5,-3);scene.add(green);
 return root;
}
