export class GameHUD{
  constructor(match){this.match=match;this.timer=document.querySelector('#timer');this.one=document.querySelector('#score-one');this.two=document.querySelector('#score-two');this.m1=document.querySelector('#meter-one');this.m2=document.querySelector('#meter-two');this.status=document.querySelector('#status');this.ticker=document.querySelector('#ticker');}
  update(){
    const m=this.match;this.timer.textContent=Math.ceil(m.time);
    const a=Math.floor(m.scores[0]),b=Math.floor(m.scores[1]);this.one.textContent=a+'%';this.two.textContent=b+'%';this.m1.style.width=a+'%';this.m2.style.width=b+'%';
    this.status.textContent=m.contested?'KURSI PAR TAKKAR!':m.owner===0?'MITRAMAN HAS THE KURSI':m.owner===1?'YATRA BOY IN POWER':'THE HOUSE IS OPEN';
    this.ticker.textContent=m.contested?'GATHBANDHAN TOOT GAYA — CAPTURE CONTESTED':m.owner===0?'KURSI PAR KABZA! MITRAMAN LEADS THE HOUSE':m.owner===1?'SARKAR KHATRE MEIN! YATRA BOY IS RISING':'THE RACE FOR THE KURSI BEGINS';
  }
  showResult(scores){
    document.querySelector('#hud').classList.add('hidden');document.querySelector('#result').classList.remove('hidden');
    const winner=scores[0]===scores[1]?-1:scores[0]>scores[1]?0:1;
    document.querySelector('#result-title').textContent=winner<0?'HUNG PARLIAMENT':winner===0?'MITRAMAN WINS THE MANDATE':'YATRA BOY WINS THE MANDATE';
    document.querySelector('#result-copy').textContent=`Final coalition score — Mitraman ${Math.floor(scores[0])}% · Yatra Boy ${Math.floor(scores[1])}%.`;
  }
}
