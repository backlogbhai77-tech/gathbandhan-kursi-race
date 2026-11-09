export class MobileControls {
  constructor(keys){
    const map={up:'KeyW',down:'KeyS',left:'KeyA',right:'KeyD'};
    document.querySelectorAll('[data-key]').forEach(btn=>{
      const code=map[btn.dataset.key];
      const on=e=>{e.preventDefault();keys[code]=true;};
      const off=e=>{e.preventDefault();keys[code]=false;};
      btn.addEventListener('pointerdown',on);btn.addEventListener('pointerup',off);btn.addEventListener('pointerleave',off);btn.addEventListener('pointercancel',off);
    });
  }
}
