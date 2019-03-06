import AuthService from './AuthService'

export default {
  install(Vue, options) {
    Vue.prototype.$auth = new AuthService()
  }
}
