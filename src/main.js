
import Vue from 'vue';

import vueCustomElement from 'vue-custom-element';
Vue.use(vueCustomElement);


import VueResource from 'vue-resource';
Vue.use(VueResource);


Vue.customElement('formater-download-stat', () => new Promise((resolve) => {
  require(['./formater-download-stat.vue'], (FormaterDownloadStat) => resolve(FormaterDownloadStat.default))
}))
  
