export class MatchManager{
  constructor(players,throne){this.players=players;this.throne=throne;this.captureProgress=[0,0];this.reset();}
  start(){this.active=true;}
  reset(){this.time=30;this.scores=[0,0];this.owner=-1;this.contested=false;this.finished=false;this.active=false;this.captureProgress=[0,0];}
  update(dt){if(!this.active||this.finished)return;this.time=Math.max(0,this.time-dt);const [a,b]=this.players.map(p=>p.group.position);
    const near=[a,b].map(p=>Math.hypot(p.x,p.z)<2.65);this.contested=near[0]&&near[1];
    for(let i=0;i<2;i++){if(near[i]&&!this.contested)this.captureProgress[i]=Math.min(1.15,this.captureProgress[i]+dt);else this.captureProgress[i]=Math.max(0,this.captureProgress[i]-dt*.9);}
    const ready=this.captureProgress.map(v=>v>=1.0);this.owner=this.contested?-1:ready[0]?0:ready[1]?1:-1;
    if(this.owner>=0)this.scores[this.owner]=Math.min(100,this.scores[this.owner]+dt*5.2);
    if(this.time<=0){this.finished=true;this.active=false;}
  }
}
