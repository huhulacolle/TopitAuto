<template>
  <br>
  <div class="text-center h1">
    <p>Topit'Auto</p>
  </div>
  <div class="container">
    <router-view />
  </div>
</template>

<script>
import update from '@/services/update'

export default {
    created() {
    // Prevent blank screen in Electron builds
    this.$router.push('/');
    update.getUpdate();
  }
}
</script>

<style>
body {
  user-select: none;
  color: white !important;
  background-color: rgba(15, 15, 15, 0.884) !important;
}
</style>