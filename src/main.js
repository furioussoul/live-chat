import Vue from 'vue';
import App from './app.vue';
import store from './js/store';
import './css/reset.css'

Vue.config.devtools = true;

new Vue({
  el: '#app',
  template: '<App/>',
  components: { App },
  store: store
})
