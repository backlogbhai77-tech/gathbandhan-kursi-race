import './styles/main.css';
import { Game } from './core/Game.js';
import { OrientationGuide } from './ui/OrientationGuide.js';

const game = new Game(document.querySelector('#game-root'));
game.init();
new OrientationGuide();
