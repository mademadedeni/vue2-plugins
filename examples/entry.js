import Vue from 'vue';
import app from './app';
import VueRouter from 'vue-router';
import Element from '../src/index.js';
import routes from './routes.js';

import '../packages/theme-chalk/src/index.scss';

Vue.use(Element);
Vue.use(VueRouter);

const router = new VueRouter({
  mode: 'hash',
  base: __dirname,
  routes
});

new Vue({ // eslint-disable-line
  ...app,
  router
}).$mount('#app');
