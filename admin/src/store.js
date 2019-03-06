import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    isLoading: false,
    currentMap: {},
    selectedPlace: null,
    currentPage: 1,
    places: [],
    filteredPlaces: [],
    user: null
  },
  mutations: {
    setMap (state, value) {
      state.currentMap = value
    },
    loading (state, value) {
      state.isLoading = value
    },
    selectPlace (state, value) {
      state.selectedPlace = Vue.util.extend({}, value)
    },
    deselectPlace (state) {
      state.selectedPlace = null
    },
    updatePlaceCoordinates (state, value) {
      if (!state.selectedPlace)
        state.selectedPlace = {}
      state.selectedPlace = {...state.selectedPlace, coordinates: value}
    },
    login (state, profile) {
      state.user = profile
    }
  }
})
