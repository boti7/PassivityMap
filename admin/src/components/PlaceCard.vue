<template>
  <b-card @click="$emit('click', $event)">
    <b-card-title>{{place.title}}</b-card-title>
    <b-card-sub-title>{{place.address}}</b-card-sub-title>
    <b-card-text>
      <p class="text-truncate">{{place.description}}</p>
      <b-badge variant="light" v-if="place.date">{{formatDate(place.date)}}</b-badge>
      <b-badge variant="light" v-if="place.category">{{categoryName(place.category)}}</b-badge>
      <b-badge variant="light" v-if="place.images.length">{{place.images.length}} fénykép</b-badge>
      <b-badge variant="primary" v-if="place.featured">kiemelt</b-badge>
    </b-card-text>
  </b-card>
</template>

<script>
import Vue from 'vue'
import { mapState } from 'vuex'
import moment from 'moment'

moment.locale('hu')

export default {
  name: 'PlaceCard',
  props: ['place'],
  data: () => ({
    categoryNames: {
      'akcio': 'Akció',
      'gerillakert': 'Gerillakertészkedés',
      'streetart': 'Streetart',
      'varos': 'Városfelújítás'
    },
  }),
  methods: {
    formatDate (d) {
      return moment(d).format('LL')
    },
    categoryName (c) {
      return this.categoryNames[c] || c
    }
  },
}
</script>

<style scoped>
.card {
  margin: 10px 10px 0;
  cursor: pointer;
}
.badge {
  margin-right: 10px;
}
</style>
