import { Store } from 'svelte/store';
import { createHistory } from 'svelte-routing';

import App from './App.html';

const store = new Store({});
createHistory('browser');
const app = new App({
  target: document.getElementById('wrapper'),
  store,
});

window.store = store;

export default app;
