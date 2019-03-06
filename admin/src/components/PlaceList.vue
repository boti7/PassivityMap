<template>
  <div>
    <div class="search-box">
      <b-form-input v-model="search" type="text" placeholder="Keresés" @input="searchPlaces" />
    </div>
    <div v-if="filteredPlaces.length">
      <b-pagination align="center" :total-rows="filteredPlaces.length" v-model="currentPage" :per-page="50" :limit="10" />
      <place-card v-for="place in placesToShow" :key="place.placeId" :place="place" @click="onSelect(place)" />
      <b-pagination align="center" :total-rows="filteredPlaces.length" v-model="currentPage" :per-page="50" :limit="10" />
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import PlaceCard from '@/components/PlaceCard'

const toLower = text => {
  return text.toString().toLowerCase()
}

const searchByName = (items, term) => {
  if (term) {
    return items.filter(item => toLower(item.title).includes(toLower(term)) ||
      toLower(item.address).includes(toLower(term)) ||
      toLower(item.date).includes(toLower(term)))
  }

  return items
}

export default {
  name: 'PlaceList',
  components: {
    PlaceCard
  },
  data: () => ({
    search: null
  }),
  computed: {
    ...mapState([
      'filteredPlaces'
    ]),
    currentPage: {
      get () {return this.$store.state.currentPage},
      set (val) {this.$store.state.currentPage = val}
    },
    placesToShow () {
      let startIndex = (this.currentPage - 1) * 50
      return this.filteredPlaces.slice(startIndex, startIndex + 50)
    }
  },
  methods: {
    onSelect (item) {
      this.$router.push({name: 'EditPlace', params: {id: item.placeId}})
    },
    searchPlaces () {
      this.$store.state.filteredPlaces = searchByName(this.$store.state.places, this.search)
      this.currentPage = 1
    }
  }
}
</script>

<style scoped>
.pagination {
  margin-top: 20px;
}
.search-box {
  width: calc(100% - 20px);
  margin: 10px;
}
</style>
