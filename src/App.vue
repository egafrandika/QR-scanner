<script setup>
import HomeView from './views/HomeView.vue';
</script>

<template>
  <notifications />
  <RouterView>
    <HomeView />
  </RouterView>
</template>
