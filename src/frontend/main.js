import Vue from 'vue';
import App from './app.vue';
import store from './js/store';
import './css/reset.css'
import './css/main.less'

Vue.config.devtools = true;

new Vue({
  el: '#app',
  template: '<App/>',
  components: { App },
  store: store
})
