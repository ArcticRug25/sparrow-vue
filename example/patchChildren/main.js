// vue3
import {
  createApp
} from '../../lib/sparrow-vue.esm.js';
import App from './App.js';

const rootContainer = document.querySelector("#root");
createApp(App).mount(rootContainer);
