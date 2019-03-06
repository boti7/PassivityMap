import auth0 from "auth0-js"
import { AUTH_CONFIG } from "./auth0-variables"
import EventEmitter from "eventemitter3"
import jwtDecode from "jwt-decode"

export default class AuthService {
  constructor() {
    this.auth0 = new auth0.WebAuth({
      domain: AUTH_CONFIG.domain,
      clientID: AUTH_CONFIG.clientId,
      redirectUri: AUTH_CONFIG.callbackUrl,
      audience: AUTH_CONFIG.audience,
      responseType: "token id_token",
      scope: "openid profile email"
    })

    this.tokenRenewalTimeout = null
    this.scheduleRenewal()
  }

  login() {
    this.auth0.authorize()
  }

  handleAuthentication() {
    let obj = this

    return new Promise((resolve, reject) => {
      obj.auth0.parseHash(function (err, authResult) {
        if (authResult && authResult.accessToken && authResult.idToken) {
          window.location.hash = ''
          obj.setSession(authResult)
          resolve(true)
        } else if (!err && !authResult) {
          resolve(false)
        } else if (err) {
          reject(err)
        }
      })
    })
  }

  setSession(authResult) {
    let expiresAt = JSON.stringify(authResult.expiresIn * 1000 + new Date().getTime())

    localStorage.setItem("access_token", authResult.accessToken)
    localStorage.setItem("id_token", authResult.idToken)
    localStorage.setItem("expires_at", expiresAt)

    this.scheduleRenewal()
  }

  renewToken() {
    this.auth0.checkSession({}, (err, result) => {
      if (err) {
        console.error(err)
        return
      }
      this.setSession(result)
    })
  }

  scheduleRenewal() {
    let expiresAt = JSON.parse(localStorage.getItem("expires_at"))
    let delay = expiresAt - Date.now()
    if (delay > 0) {
      delay -= 60000
      this.tokenRenewalTimeout = setTimeout(() => {
        this.renewToken()
      }, delay < 0 ? 0 : delay)
    }
  }

  logout() {
    localStorage.removeItem("access_token")
    localStorage.removeItem("id_token")
    localStorage.removeItem("expires_at")

    this.userProfile = null

    this.login()
  }

  isAuthenticated() {
    let expiresAt = JSON.parse(localStorage.getItem("expires_at"))

    return new Date().getTime() < expiresAt
  }

  getUser() {
    try {
      return jwtDecode(localStorage.getItem("id_token"))
    } catch (e) {
      if (e.name === "InvalidTokenError") this.login()
    }
  }

  getProfile() {
    let obj = this

    return new Promise((resolve, reject) => {
      if (!this.userProfile) {
        let accessToken = localStorage.getItem('access_token')

        if (!accessToken)
          reject()

        obj.auth0.client.userInfo(accessToken, function(err, profile) {
          if (profile) {
            obj.userProfile = profile
            resolve(obj.userProfile)
          }
          else if (err) {
            reject(err)
          }
        })
      } else {
        resolve(obj.userProfile)
      }
    })
  }
}
