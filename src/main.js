import './styles/main.css';
import { Game } from './core/Game.js';

const game = new Game(document.querySelector('#game-root'));
game.init();
