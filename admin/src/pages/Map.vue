<template>
  <b-container fluid style="padding: 0;">
    <b-row no-gutters>
      <b-col cols="12" sm="auto">
        <div class="place-list bg-light">
          <router-view/>
        </div>
      </b-col>
      <b-col>
        <Map/>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import Map from '@/components/Map.vue'

export default {
  name: 'MapPage',
  components: {
    Map
  },
  methods: {
    updateData () {
      this.$store.commit('loading', true)
      this.$api.getPlaces()
        .then(places => {
          places.sort((a, b) => a.title.localeCompare(b.title))

          this.$store.state.places = places
          this.$store.state.filteredPlaces = places

          this.$store.commit('loading', false)
        })
        .catch(err => console.error(err))
    },
    logout () {
      this.$auth.logout()
    }
  },
  mounted() {
    this.updateData()
  },
  beforeRouteUpdate (to, from, next) {
    document.getElementsByClassName('place-list')[0].scrollTo(0,0)

    this.updateData()
    next()
  },
}
</script>

<style scoped>
.place-list {
  width: 550px;
  height: calc(100vh - 60px);
  max-width: 550px;
  overflow-y: scroll;
}
</style>
