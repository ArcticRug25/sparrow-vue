// vue3
import {
  createApp
} from '../../lib/guide-sparrow-vue.esm.js';
import {
  App
} from './App.js';

const rootContainer = document.querySelector('#app');
createApp(App).mount(rootContainer);
