export class MatchManager {
  constructor(players,throne) { this.players=players; this.throne=throne; this.reset(); }
  start() { this.active=true; }
  reset() { this.time=30; this.scores=[0,0]; this.owner=-1; this.contested=false; this.finished=false; this.active=false; }
  update(dt) {
    if(!this.active||this.finished) return;
    this.time=Math.max(0,this.time-dt);
    const [a,b]=this.players.map(p=>p.group.position);
    const near=[a,b].map(p=>Math.hypot(p.x,p.z)<2.25);
    this.contested=near[0]&&near[1];
    if(this.contested) this.owner=-1;
    else if(near[0]) this.owner=0;
    else if(near[1]) this.owner=1;
    else this.owner=-1;
    if(this.owner>=0) this.scores[this.owner]=Math.min(100,this.scores[this.owner]+dt*4.1);
    if(this.time<=0) { this.finished=true; this.active=false; }
  }
}
