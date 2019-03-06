<template>
  <div class="container">
    <div class="text-center">
      <h2 class="title">Nincs jogosultságod ennek az alkalmazásnak a használatához!</h2>
      <b-button @click.native="$auth.login()">Bejelentkezés</b-button>
    </div>
  </div>
</template>
