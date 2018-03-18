import { Store } from 'svelte/store';
import { createHistory } from 'svelte-routing';

import App from './App.html';

const store = new Store({
  projectList: fetch('/api/projects', {
    credentials: 'same-origin',
  }).then(res => res.json()),
  breadcrumb: null,
});
window.store = store; // TK only for dev

createHistory('browser');
const app = new App({
  target: document.body,
  store,
});

export default app;
