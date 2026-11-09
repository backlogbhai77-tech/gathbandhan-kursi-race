import * as THREE from 'three';
import { createArena } from '../world/ParliamentArena.js';
import { createThrone } from '../world/Throne.js';
import { Player } from '../gameplay/Player.js';
import { MatchManager } from '../gameplay/MatchManager.js';
import { GameHUD } from '../ui/GameHUD.js';
import { MobileControls } from '../ui/MobileControls.js';
import { CameraRig } from './Camera.js';

export class Game {
  constructor(root) {
    this.root = root;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#091713');
    this.scene.fog = new THREE.Fog('#091713', 19, 42);
    this.camera = new THREE.PerspectiveCamera(43, 1, 0.1, 100);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    root.appendChild(this.renderer.domElement);
    this.clock = new THREE.Clock();
    this.keys = {};
    this.running = false;
    this.paused = false;
    this.cameraRig = new CameraRig(this.camera);
    this.buildWorld();
    this.bind();
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.loop();
  }
  buildWorld() {
    const world = createArena(this.scene);
    this.throne = createThrone(this.scene);
    this.player = new Player('Mitraman', 0, -5.4, '#39dc8c', true);
    this.cpu = new Player('Yatra Boy', 0, 5.4, '#ff9c45', false);
    this.scene.add(this.player.group, this.cpu.group);
    this.players = [this.player, this.cpu];
    this.match = new MatchManager(this.players, this.throne);
    this.hud = new GameHUD(this.match);
    this.mobile = new MobileControls(this.keys);
    this.cameraRig.setTargets(this.player.group, this.cpu.group);
    this.worldDecor = world;
  }
  bind() {
    window.addEventListener('keydown', e => { this.keys[e.code] = true; if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault(); });
    window.addEventListener('keyup', e => this.keys[e.code] = false);
    document.querySelector('#start-btn').addEventListener('click', () => this.start());
    document.querySelector('#again-btn').addEventListener('click', () => this.reset());
    document.querySelector('#pause-btn').addEventListener('click', () => this.pause());
    document.querySelector('#resume-btn').addEventListener('click', () => this.pause(false));
    document.querySelector('#push-btn').addEventListener('pointerdown', () => this.keys.Space = true);
    document.querySelector('#push-btn').addEventListener('pointerup', () => this.keys.Space = false);
    document.querySelector('#dash-btn').addEventListener('pointerdown', () => this.keys.ShiftLeft = true);
    document.querySelector('#dash-btn').addEventListener('pointerup', () => this.keys.ShiftLeft = false);
  }
  start() {
    document.querySelector('#overlay').classList.add('hidden');
    document.querySelector('#hud').classList.remove('hidden');
    this.running = true; this.paused = false; this.match.start();
  }
  reset() {
    document.querySelector('#result').classList.add('hidden');
    this.player.reset(0, -5.4); this.cpu.reset(0, 5.4);
    this.match.reset(); this.start();
  }
  pause(value = !this.paused) {
    if (!this.running) return;
    this.paused = value;
    document.querySelector('#pause-overlay').classList.toggle('hidden', !value);
  }
  resize() {
    const w = this.root.clientWidth || innerWidth, h = this.root.clientHeight || innerHeight;
    this.camera.aspect = w / h; this.camera.updateProjectionMatrix(); this.renderer.setSize(w, h);
  }
  loop() {
    requestAnimationFrame(() => this.loop());
    const dt = Math.min(this.clock.getDelta(), 0.04);
    if (this.running && !this.paused && !this.match.finished) {
      this.player.update(dt, this.keys, this.cpu.group.position);
      this.cpu.updateAI(dt, this.player.group.position, this.match);
      this.match.update(dt);
      this.hud.update();
      if (this.match.finished) this.hud.showResult(this.match.scores);
    }
    this.cameraRig.update(dt);
    this.throne.userData.update?.(dt, this.match?.owner);
    this.renderer.render(this.scene, this.camera);
  }
  init() {
    document.querySelector('#loading').classList.add('hidden');
  }
}
