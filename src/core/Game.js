import * as THREE from 'three';
import { createArena } from '../world/ParliamentArena.js';
import { createThrone } from '../world/Throne.js';
import { Player } from '../gameplay/Player.js';
import { MatchManager } from '../gameplay/MatchManager.js';
import { GameHUD } from '../ui/GameHUD.js';
import { MobileControls } from '../ui/MobileControls.js';
import { CameraRig } from './Camera.js';
import { Atmosphere } from '../effects/Atmosphere.js';

export class Game {
  constructor(root) {
    this.root = root;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#07130f');
    this.scene.fog = new THREE.FogExp2('#0a1a14', 0.022);
    this.camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.35));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.18;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    root.appendChild(this.renderer.domElement);
    this.clock = new THREE.Clock();
    this.keys = {};
    this.running = false;
    this.paused = false;
    this.buildWorld();
    this.bind();
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.loop();
  }
  buildWorld() {
    createArena(this.scene);
    this.throne = createThrone(this.scene);
    this.player = new Player('Mitraman', -2.1, -6.2, '#35d990', true);
    this.cpu = new Player('Yatra Boy', 2.1, 6.2, '#ff9c45', false);
    this.scene.add(this.player.group, this.cpu.group);
    this.players = [this.player, this.cpu];
    this.match = new MatchManager(this.players, this.throne);
    this.hud = new GameHUD(this.match);
    this.mobile = new MobileControls(this.keys);
    this.cameraRig = new CameraRig(this.camera);
    this.cameraRig.setTargets(this.player.group, this.cpu.group);
    this.atmosphere = new Atmosphere(this.scene);
  }
  bind() {
    window.addEventListener('keydown', e => {
      this.keys[e.code] = true;
      if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault();
    });
    window.addEventListener('keyup', e => this.keys[e.code] = false);
    document.querySelector('#start-btn').addEventListener('click', () => this.start());
    document.querySelector('#again-btn').addEventListener('click', () => this.reset());
    document.querySelector('#pause-btn').addEventListener('click', () => this.pause());
    document.querySelector('#resume-btn').addEventListener('click', () => this.pause(false));
    const hold = (id, code) => {
      const el = document.querySelector(id);
      el.addEventListener('pointerdown', e => { e.preventDefault(); this.keys[code] = true; });
      ['pointerup','pointerleave','pointercancel'].forEach(ev => el.addEventListener(ev, () => this.keys[code] = false));
    };
    hold('#push-btn', 'Space'); hold('#dash-btn', 'ShiftLeft');
  }
  start() {
    document.querySelector('#overlay').classList.add('hidden');
    document.querySelector('#hud').classList.remove('hidden');
    this.running = true; this.paused = false; this.match.start();
  }
  reset() {
    document.querySelector('#result').classList.add('hidden');
    this.player.reset(-2.1, -6.2); this.cpu.reset(2.1, 6.2);
    this.match.reset(); this.hud.update(); this.start();
  }
  pause(value = !this.paused) {
    if (!this.running || this.match.finished) return;
    this.paused = value;
    document.querySelector('#pause-overlay').classList.toggle('hidden', !value);
  }
  resize() {
    const w = this.root.clientWidth || window.innerWidth, h = this.root.clientHeight || window.innerHeight;
    this.camera.aspect = w / h; this.camera.updateProjectionMatrix(); this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.innerWidth < 900 ? 1.1 : 1.5));
  }
  loop() {
    requestAnimationFrame(() => this.loop());
    const dt = Math.min(this.clock.getDelta(), 0.04);
    if (this.running && !this.paused && !this.match.finished) {
      this.player.update(dt, this.keys, this.cpu, this.match.owner === 0);
      this.cpu.updateAI(dt, this.player, this.match);
      this.match.update(dt);
      this.hud.update();
      if (this.match.finished) this.hud.showResult(this.match.scores);
    }
    this.cameraRig.update(dt);
    this.throne.userData.update?.(dt, this.match?.owner, this.match?.contested);
    this.atmosphere.update(dt);
    this.renderer.render(this.scene, this.camera);
  }
  init() { document.querySelector('#loading').classList.add('hidden'); }
}
