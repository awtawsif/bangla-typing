// app.js
import { App } from './AppCore.js';

document.addEventListener('DOMContentLoaded', () => {
    window.app = new App(); // Assign to window for global access if needed
    window.app.init();
});