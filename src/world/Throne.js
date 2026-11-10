import * as THREE from 'three';
export function createThrone(scene){
 const g=new THREE.Group();scene.add(g);
 const gold=new THREE.MeshStandardMaterial({color:'#d8b66f',metalness:.78,roughness:.2});const pale=new THREE.MeshStandardMaterial({color:'#f0d99b',metalness:.55,roughness:.24});const velvet=new THREE.MeshStandardMaterial({color:'#0d5a3b',roughness:.48});const dark=new THREE.MeshStandardMaterial({color:'#102c20',roughness:.62});const gem=new THREE.MeshStandardMaterial({color:'#8cf0b2',emissive:'#1a8c54',emissiveIntensity:1.1,metalness:.35,roughness:.2});
 const add=(geo,mat,pos,scale,rot)=>{const m=new THREE.Mesh(geo,mat);m.position.set(...pos);if(scale)m.scale.set(...scale);if(rot)m.rotation.set(...rot);m.castShadow=true;m.receiveShadow=true;g.add(m);return m;};
 // Monumental stepped plinth.
 add(new THREE.CylinderGeometry(1.95,2.15,.3,64),gold,[0,.05,0]);add(new THREE.CylinderGeometry(1.72,1.82,.22,64),dark,[0,.29,0]);add(new THREE.CylinderGeometry(1.48,1.6,.16,64),pale,[0,.48,0]);
 add(new THREE.BoxGeometry(2.0,.42,1.55),gold,[0,.78,-.08]);add(new THREE.BoxGeometry(1.78,.2,1.36),velvet,[0,1.02,-.08]);
 // Deep upholstered back and sculpted outer frame.
 add(new THREE.BoxGeometry(1.92,2.35,.32),gold,[0,2.16,-.67]);add(new THREE.BoxGeometry(1.58,1.98,.14),velvet,[0,2.18,-.47]);
 add(new THREE.BoxGeometry(.13,2.12,.2),pale,[-.82,2.17,-.42]);add(new THREE.BoxGeometry(.13,2.12,.2),pale,[.82,2.17,-.42]);
 add(new THREE.BoxGeometry(1.5,.12,.08),pale,[0,3.25,-.42]);
 // Arm rests, turned balusters, carved finials.
 for(const x of [-.88,.88]){add(new THREE.BoxGeometry(.32,.22,1.4),gold,[x,1.43,.04]);add(new THREE.CylinderGeometry(.11,.15,.78,16),pale,[x,1.08,.48]);add(new THREE.SphereGeometry(.22,20,14),gold,[x,1.62,-.58]);add(new THREE.SphereGeometry(.12,16,12),gem,[x,1.63,-.58]);}
 // Crown-shaped crest with arched filigree and jewel points.
 const arch=add(new THREE.TorusGeometry(.82,.095,12,64,Math.PI),gold,[0,3.36,-.55]);arch.rotation.z=Math.PI;
 for(let i=0;i<7;i++){const a=Math.PI*(i/6);const x=Math.cos(a)*.82,y=3.36+Math.sin(a)*.82;add(new THREE.SphereGeometry(.105,12,10),pale,[x,y,-.55]);}
 add(new THREE.OctahedronGeometry(.27),gem,[0,4.15,-.55],[1,1.2,.7]);
 // Backrest emblem medallion and side ornament diamonds.
 add(new THREE.CircleGeometry(.34,8),gold,[0,2.55,-.385],[1,1,1],[0,0,0]);add(new THREE.OctahedronGeometry(.22),gem,[0,2.55,-.29]);
 for(const x of [-.58,.58])for(const y of [1.55,2.0,2.45,2.9])add(new THREE.OctahedronGeometry(.075),pale,[x,y,-.37]);
 const halo=add(new THREE.TorusGeometry(2.55,.045,10,100),new THREE.MeshBasicMaterial({color:'#e7c77b',transparent:true,opacity:.7}),[0,.14,0]);halo.rotation.x=Math.PI/2;
 const inner=add(new THREE.TorusGeometry(2.28,.018,8,100),new THREE.MeshBasicMaterial({color:'#9fe8a9',transparent:true,opacity:.65}),[0,.16,0]);inner.rotation.x=Math.PI/2;
 const light=new THREE.PointLight('#e8c57b',42,12);light.position.set(0,3.7,0);g.add(light);
 g.userData.update=(dt,owner,contested)=>{halo.rotation.z+=dt*.14;inner.rotation.z-=dt*.22;halo.material.opacity=contested?.2:owner===-1?.55:.95;light.color.set(contested?'#ffffff':owner===0?'#55e99d':owner===1?'#ff9d4a':'#f0c875');};
 return g;
}
