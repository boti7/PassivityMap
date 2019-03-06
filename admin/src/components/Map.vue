<template>
  <l-map ref="map" :options="options.map" @click="mapClick">
    <l-tile-layer :url="options.tileLayer.url" :attribution="options.tileLayer.attribution"/>
    <l-control-zoom position="bottomright"/>
    <l-geosearch :options="options.geosearch"/>

    <template v-if="selectedPlace">
      <l-marker v-if="selectedPlaceCoordinates" draggable :lat-lng="selectedPlaceCoordinates" v-on:update:latLng="mapClick"/>

      <l-marker v-for="place in filteredPlaces" v-if="place.placeId != selectedPlace.placeId"
          :key="'1' + place.placeId" :lat-lng="place.coordinates" :icon="getIcon(place)">
        <l-tooltip :content="place.title" :options="options.tooltip"/>
      </l-marker>
    </template>
    <template v-else>
      <l-marker-cluster :options="options.cluster">
        <l-marker v-for="place in filteredPlaces" v-if="!place.featured" :icon="getIcon(place)"
            :key="'0' + place.placeId" :lat-lng="place.coordinates" @click="markerClick(place)">
          <l-tooltip :content="place.title" :options="options.tooltip"/>
        </l-marker>
      </l-marker-cluster>

      <l-marker v-for="place in filteredPlaces" v-if="place.featured"
          :key="place.placeId" :lat-lng="place.coordinates" @click="markerClick(place)" :icon="getIcon(place)">
        <l-tooltip :content="place.title" :options="options.tooltip"/>
      </l-marker>
    </template>
  </l-map>
</template>

<script>
import Vue from 'vue'
import { mapState } from 'vuex'
import { LMap, LTileLayer, LControlZoom, LMarker, LTooltip, LPopup } from 'vue2-leaflet'
import Vue2LeafletMarkerCluster from 'vue2-leaflet-markercluster'
import { OpenStreetMapProvider } from 'leaflet-geosearch'
import LGeosearch from 'vue2-leaflet-geosearch'
import 'leaflet-geosearch/assets/css/leaflet.css'

import MarkerIcon_Akcio from '@/assets/MKKP_ikon_akciok.svg'
import MarkerIcon_Gerillakert from '@/assets/MKKP_ikon_gerillakerteszkedes.svg'
import MarkerIcon_Streetart from '@/assets/MKKP_ikon_streetart.svg'
import MarkerIcon_Varos from '@/assets/MKKP_ikon_varosfelujitas.svg'

delete L.Icon.Default.prototype._getIconUrl

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
})

const boundsOfHungary = [
  [45.737128, 16.1138866],
  [48.585257, 22.8977094]
]

const PlaceMarkerIcon = L.Icon.extend({
  options: {
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -10]
  }
})

const MARKERS = {
  'akcio': new PlaceMarkerIcon({iconUrl: MarkerIcon_Akcio}),
  'gerillakert': new PlaceMarkerIcon({iconUrl: MarkerIcon_Gerillakert}),
  'streetart': new PlaceMarkerIcon({iconUrl: MarkerIcon_Streetart}),
  'varos': new PlaceMarkerIcon({iconUrl: MarkerIcon_Varos})
}

export default {
  name: 'home',
  components: {
    LMap,
    LTileLayer,
    LControlZoom,
    LMarker,
    LPopup,
    LTooltip,
    LGeosearch,
    'l-marker-cluster': Vue2LeafletMarkerCluster
  },
  data: () => ({
    options: {
      map: {
        zoom: 7,
        zoomControl: false
      },
      tileLayer: {
        url: process.env.VUE_APP_OSM_URL,
        attribution: '<a href="https://www.maptiler.com/license/maps/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>'
      },
      cluster: {
        showCoverageOnHover: false,
        maxClusterRadius: 35
      },
      tooltip: {
        direction:'top'
      },
      geosearch: {
        provider: new OpenStreetMapProvider({
          params: {
            countrycodes: 'hu'
          }
        }),
        style: 'bar',
        showMarker: false,
        autoClose: true,
        keepResult: false
      }
    },
    marker: null
  }),
  computed: {
    ...mapState([
      'filteredPlaces',
      'selectedPlace'
    ]),
    selectedPlaceCoordinates () {
      return this.selectedPlace && this.selectedPlace.coordinates ? this.selectedPlace.coordinates : null
    }
  },
  methods: {
    getIcon (place) {
      return MARKERS[place.category] || new L.Icon.Default()
    },
    mapClick (evt) {
      if (!this.selectedPlace)
        return

      this.$store.commit('updatePlaceCoordinates', evt.latlng || evt)
    },
    markerClick (item) {
      this.$router.push({name: 'EditPlace', params: {id: item.placeId}})
    }
  },
  mounted () {
    this.$refs.map.mapObject.invalidateSize()
    this.$refs.map.mapObject.fitBounds(boundsOfHungary)

    this.$store.watch(state => this.$store.state.selectedPlace,
      (newValue, oldValue) => {
        if (!this.$refs.map || (newValue && oldValue && newValue.coordinates && oldValue.coordinates))
          return

        if (newValue && newValue.coordinates) {
          this.$refs.map.mapObject.setView(newValue.coordinates, 15)
        }
        else {
          this.$refs.map.mapObject.fitBounds(boundsOfHungary)
        }
    })
  },
}
</script>

<style lang="scss" scoped>
@import "~leaflet.markercluster/dist/MarkerCluster.css";
@import "~leaflet.markercluster/dist/MarkerCluster.Default.css";

.leaflet-container {
  z-index: 0;
  height: calc(100vh - 60px) !important;
}
</style>
