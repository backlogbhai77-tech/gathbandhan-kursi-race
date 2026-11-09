import * as THREE from 'three';
export function createThrone(scene) {
  const g=new THREE.Group(); scene.add(g);
  const gold=new THREE.MeshStandardMaterial({color:'#d8b56c',metalness:.72,roughness:.25});
  const velvet=new THREE.MeshStandardMaterial({color:'#174a37',roughness:.55});
  const base=new THREE.Mesh(new THREE.CylinderGeometry(1.35,1.55,.35,32),gold);base.position.y=.05;base.castShadow=true;g.add(base);
  const seat=new THREE.Mesh(new THREE.BoxGeometry(1.75,.38,1.25),velvet);seat.position.y=.62;seat.castShadow=true;g.add(seat);
  const back=new THREE.Mesh(new THREE.BoxGeometry(1.75,2.25,.34),gold);back.position.set(0,1.75,-.48);back.castShadow=true;g.add(back);
  const cushion=new THREE.Mesh(new THREE.BoxGeometry(1.35,1.65,.16),velvet);cushion.position.set(0,1.78,-.27);g.add(cushion);
  for(const x of [-.7,.7]){const arm=new THREE.Mesh(new THREE.BoxGeometry(.28,.85,1.2),gold);arm.position.set(x,1.02,0);g.add(arm);}
  const crown=new THREE.Mesh(new THREE.TorusGeometry(.67,.075,10,40),gold);crown.position.set(0,3.02,-.42);g.add(crown);
  const halo=new THREE.Mesh(new THREE.TorusGeometry(2.2,.035,8,64),new THREE.MeshBasicMaterial({color:'#e6c77e',transparent:true,opacity:.75}));halo.rotation.x=Math.PI/2;halo.position.y=.12;g.add(halo);
  const light=new THREE.PointLight('#f2c875',22,8);light.position.set(0,2.8,0);g.add(light);
  g.userData.update=(dt,owner)=>{halo.rotation.z+=dt*.22;halo.material.opacity=owner===-1?.55:.95;light.color.set(owner===0?'#55e89a':owner===1?'#ff9c45':'#f2c875');};
  return g;
}
