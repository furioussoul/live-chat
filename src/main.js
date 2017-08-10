import Vue from 'vue';
import App from './app.vue';
import store from './store';

Vue.config.devtools = true;

new Vue({
    el: 'body',
    components: { App },
    store: store
});
