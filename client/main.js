import { Store } from 'svelte/store';
import { createHistory } from 'svelte-routing';

// import App from './App.html';
import Recorder from './Recorder.html';

const store = new Store({
  projectList: fetch('/api/projects').then(res => res.json()),
});
window.store = store; // TK only for dev

createHistory('browser');
const app = new Recorder({
  target: document.body,
  store,
});

export default app;
