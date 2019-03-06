import axios from 'axios'

class ApiClient {
  endpoint () {
    return process.env.VUE_APP_API_ENDPOINT
  }

  headers () {
    return {
      Authorization: 'Bearer ' + localStorage.getItem('access_token')
    }
  }

  getPlaces () {
    return axios.get(this.endpoint()).then(response => response.data.places || [])
  }

  getPlace (id) {
    return axios.get(this.endpoint() + '/places/' + id)
  }

  savePlace (place) {
    return axios.put(this.endpoint() + '/places/' + place.placeId,
      place,
      {
        headers: this.headers()
      })
  }
  
  deletePlace (id) {
    return axios.delete(this.endpoint() + '/places/' + id,
      {
        headers: this.headers()
      })
  }
}

export default {
  install(Vue, options) {
    Vue.prototype.$api = new ApiClient()
  }
}
