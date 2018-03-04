import { Store } from 'svelte/store';
import { createHistory } from 'svelte-routing';

import App from './App.html';

const store = new Store({
  projectList: fetch('/api/projects').then(res => res.json()),
});
window.store = store; // TK only for dev

createHistory('browser');
const app = new App({
  target: document.getElementById('wrapper'),
  store,
});

export default app;
