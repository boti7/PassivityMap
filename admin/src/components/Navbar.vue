<template>
  <b-navbar toggleable="lg" variant="light">
    <router-link to="/">
      <b-navbar-brand>Minden amit csináltunk</b-navbar-brand>
    </router-link>

    <b-navbar-toggle target="nav_collapse" />

    <b-collapse is-nav id="nav_collapse">
      <b-button variant="primary" @click="$router.push({name: 'NewPlace'})">
        <i class="fas fa-plus"></i> Új helyszín
      </b-button>

      <!-- Right aligned nav items -->
      <b-navbar-nav class="ml-auto">
        <b-nav-item-dropdown :text="user.name" right class="ml-auto">
          <b-dropdown-item @click="$auth.logout()">Kijelentkezés</b-dropdown-item>
        </b-nav-item-dropdown>
      </b-navbar-nav>
    </b-collapse>
  </b-navbar>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'Navbar',
  computed: {
    ...mapState([
      'user'
    ])
  }
}
</script>
