import Vue from 'vue'
import BootstrapVue from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import store from './store'
import router from './router'
import Api from './api'
import Authentication from './auth/Authentication'
import App from './App.vue'

Vue.config.productionTip = false

Vue.use(BootstrapVue)
Vue.use(Authentication)
Vue.use(Api)

const vue = new Vue({
  store,
  router,
  render: h => h(App)
}).$mount('#app')

function getUserProfile() {
  vue.$auth.getProfile()
    .then(profile => vue.$store.commit('login', profile))
    .catch(err => console.error(err))
}

function loginUser() {
  if (vue.$router.currentRoute) {
    console.log(vue.$router.currentRoute)
    window.sessionStorage.setItem('routeAfterLogin', vue.$router.currentRoute.path)
  }
  vue.$auth.login()
}

if (window.location.hash && window.location.hash.match('access_token')) {
  vue.$auth.handleAuthentication()
    .then(status => {
      if (status) {
        getUserProfile()
        const routeAfterLogin = window.sessionStorage.getItem('routeAfterLogin')
        if (routeAfterLogin) {
          vue.$router.replace(routeAfterLogin)
          window.sessionStorage.removeItem('routeAfterLogin')
        }
        else {
          vue.$router.replace('/')
        }
      }
      else {
        loginUser()
      }
    })
    .catch(err => console.error(err))
}
else if (vue.$auth.isAuthenticated()) {
  getUserProfile()
}
else {
  loginUser()
}
