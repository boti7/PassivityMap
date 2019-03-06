<template>
  <div id="app" class="page-container" v-if="user">
    <navbar/>

    <loading-indicator/>

    <router-view/>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import Navbar from '@/components/Navbar'
import LoadingIndicator from '@/components/LoadingIndicator'

export default {
  name: 'App',
  components: {
    Navbar,
    LoadingIndicator
  },
  computed: {
    ...mapState([
      'user'
    ])
  }
}
</script>
