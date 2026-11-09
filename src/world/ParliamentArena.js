import * as THREE from 'three';
function mat(color,roughness=.8){return new THREE.MeshStandardMaterial({color,roughness});}
export function createArena(scene) {
  const group=new THREE.Group(); scene.add(group);
  const floor=new THREE.Mesh(new THREE.CylinderGeometry(11,11,.45,64),mat('#263b32')); floor.position.y=-.35; floor.receiveShadow=true; group.add(floor);
  const inner=new THREE.Mesh(new THREE.CylinderGeometry(8.8,8.8,.08,64),mat('#354c40')); inner.position.y=-.08; inner.receiveShadow=true; group.add(inner);
  const trim=new THREE.Mesh(new THREE.TorusGeometry(9.3,.12,10,80),new THREE.MeshStandardMaterial({color:'#c6a45d',metalness:.65,roughness:.3})); trim.rotation.x=Math.PI/2; trim.position.y=-.02; group.add(trim);
  const wall=new THREE.Mesh(new THREE.CylinderGeometry(12,12,3,64,1,true),new THREE.MeshStandardMaterial({color:'#172c25',side:THREE.DoubleSide,roughness:.95})); wall.position.y=1.15; group.add(wall);
  for(let i=0;i<32;i++){
    const a=i/32*Math.PI*2, x=Math.cos(a)*10.4,z=Math.sin(a)*10.4;
    const pillar=new THREE.Mesh(new THREE.CylinderGeometry(.22,.32,3.3,8),mat('#b69b68')); pillar.position.set(x,1.35,z); pillar.castShadow=true; group.add(pillar);
    const orb=new THREE.Mesh(new THREE.SphereGeometry(.17,10,8),new THREE.MeshBasicMaterial({color:'#f4d99a'})); orb.position.set(x,3.1,z); group.add(orb);
  }
  for(let i=0;i<8;i++){
    const a=i/8*Math.PI*2;
    const stand=new THREE.Mesh(new THREE.BoxGeometry(3.1,1.15,.7),mat(i%2?'#243e34':'#304b3d'));
    stand.position.set(Math.cos(a)*9.4,.45,Math.sin(a)*9.4); stand.lookAt(0,.45,0); group.add(stand);
    for(let j=0;j<4;j++){const head=new THREE.Mesh(new THREE.SphereGeometry(.16,8,8),mat(i%2?'#c68d68':'#a87559'));head.position.set(Math.cos(a)*9.2+(j-1.5)*.45,1.25,Math.sin(a)*9.2);group.add(head);}
  }
  const hemi=new THREE.HemisphereLight('#d9f4e4','#1b2822',2.0); scene.add(hemi);
  const key=new THREE.DirectionalLight('#ffe6bc',3.2); key.position.set(-5,13,8); key.castShadow=true; key.shadow.mapSize.set(2048,2048); key.shadow.camera.left=-15;key.shadow.camera.right=15;key.shadow.camera.top=15;key.shadow.camera.bottom=-15;scene.add(key);
  const rim=new THREE.PointLight('#54e6a0',35,24);rim.position.set(-7,5,-4);scene.add(rim);
  const warm=new THREE.PointLight('#f7b65c',30,22);warm.position.set(7,5,3);scene.add(warm);
  return group;
}
