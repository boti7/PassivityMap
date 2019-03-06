<template>
  <div class="text-center loading-indicator" v-if="isLoading">
    <b-spinner variant="primary" label="Loading" />
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'LoadingIndicator',
  computed: {
    ...mapState([
      'isLoading'
    ])
  }
}
</script>

<style scoped>
.loading-indicator {
  position: absolute;
  width: 100%;
  top: 12px;
  left: 0
}
</style>
