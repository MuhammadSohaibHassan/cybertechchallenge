import WindowManager from './managers/WindowManager.js';
import Terminal from '../components/Terminal/Terminal.js';

// Initialize the application
const windowManager = new WindowManager();
const terminal = new Terminal();

// Make terminal available globally for task management
window.terminal = terminal; 