export class GameHUD {
  constructor(match) {
    this.match = match;
    this.timer = document.querySelector('#timer');
    this.one = document.querySelector('#score-one');
    this.two = document.querySelector('#score-two');
    this.m1 = document.querySelector('#meter-one');
    this.m2 = document.querySelector('#meter-two');
  }
  update() {
    const m = this.match;
    if (this.timer) this.timer.textContent = Math.ceil(m.time);
    const a = Math.floor(m.scores[0]), b = Math.floor(m.scores[1]);
    if (this.one) this.one.textContent = a + '%';
    if (this.two) this.two.textContent = b + '%';
    if (this.m1) this.m1.style.width = a + '%';
    if (this.m2) this.m2.style.width = b + '%';
  }
  showResult(scores) {
    document.querySelector('#hud')?.classList.add('hidden');
    document.querySelector('#result')?.classList.remove('hidden');
    const winner = scores[0] === scores[1] ? -1 : scores[0] > scores[1] ? 0 : 1;
    const title = document.querySelector('#result-title');
    const copy = document.querySelector('#result-copy');
    if (title) title.textContent = winner < 0 ? 'DRAW' : winner === 0 ? 'MITRAMAN WINS' : 'YATRA BOY WINS';
    if (copy) copy.textContent = `${Math.floor(scores[0])}%  —  ${Math.floor(scores[1])}%`;
  }
}
