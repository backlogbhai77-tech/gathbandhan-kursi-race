import * as THREE from 'three';
export class Atmosphere{
  constructor(scene){
    this.scene=scene;const count=180;const positions=new Float32Array(count*3);
    for(let i=0;i<count;i++){positions[i*3]=(Math.random()-.5)*21;positions[i*3+1]=Math.random()*7;positions[i*3+2]=(Math.random()-.5)*21;}
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(positions,3));
    const mat=new THREE.PointsMaterial({color:'#d5c28c',size:.045,transparent:true,opacity:.5,sizeAttenuation:true});
    this.points=new THREE.Points(geo,mat);scene.add(this.points);
  }
  update(dt){this.points.rotation.y+=dt*.012;const p=this.points.geometry.attributes.position;for(let i=1;i<p.count;i++){p.array[i*3+1]+=.003;if(p.array[i*3+1]>7)p.array[i*3+1]=0;}p.needsUpdate=true;}
}
