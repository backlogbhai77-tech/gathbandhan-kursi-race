import * as THREE from 'three';
export function createThrone(scene){
  const g=new THREE.Group();scene.add(g);
  const gold=new THREE.MeshStandardMaterial({color:'#d7b46b',metalness:.76,roughness:.23});
  const velvet=new THREE.MeshStandardMaterial({color:'#15543a',roughness:.5});
  const dark=new THREE.MeshStandardMaterial({color:'#18382a',roughness:.6});
  const add=(geo,mat,pos,scale)=>{const m=new THREE.Mesh(geo,mat);m.position.set(...pos);if(scale)m.scale.set(...scale);m.castShadow=true;m.receiveShadow=true;g.add(m);return m;};
  add(new THREE.CylinderGeometry(1.48,1.7,.38,48),gold,[0,.02,0]);
  add(new THREE.CylinderGeometry(1.12,1.25,.18,48),dark,[0,.28,0]);
  add(new THREE.BoxGeometry(1.82,.38,1.28),velvet,[0,.64,0]);
  add(new THREE.BoxGeometry(1.86,2.25,.34),gold,[0,1.82,-.52]);
  add(new THREE.BoxGeometry(1.48,1.78,.13),velvet,[0,1.84,-.32]);
  for(const x of [-.78,.78]){
    add(new THREE.BoxGeometry(.3,.85,1.24),gold,[x,1.02,0]);
    add(new THREE.SphereGeometry(.19,16,12),gold,[x,1.5,-.38]);
    add(new THREE.CylinderGeometry(.12,.17,.72,12),gold,[x,.38,0]);
  }
  const crown=add(new THREE.TorusGeometry(.69,.09,12,48),gold,[0,3.05,-.45]);
  const crownGem=add(new THREE.OctahedronGeometry(.2),new THREE.MeshStandardMaterial({color:'#e8d08b',metalness:.65,roughness:.2}),[0,3.12,-.45]);
  const halo=add(new THREE.TorusGeometry(2.25,.045,10,80),new THREE.MeshBasicMaterial({color:'#e7c77b',transparent:true,opacity:.75}),[0,.12,0]);halo.rotation.x=Math.PI/2;
  const inner=add(new THREE.TorusGeometry(2.02,.018,8,80),new THREE.MeshBasicMaterial({color:'#9fe8a9',transparent:true,opacity:.7}),[0,.14,0]);inner.rotation.x=Math.PI/2;
  const light=new THREE.PointLight('#f0c875',30,10);light.position.set(0,3,0);g.add(light);
  g.userData.update=(dt,owner,contested)=>{
    halo.rotation.z+=dt*.18;inner.rotation.z-=dt*.25;
    halo.material.opacity=contested?.25:owner===-1?.62:.98;
    light.color.set(contested?'#ffffff':owner===0?'#55e99d':owner===1?'#ff9d4a':'#f0c875');
    crown.rotation.y+=dt*.15;
  };
  return g;
}
