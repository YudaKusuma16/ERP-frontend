<template>
  <div class="min-h-screen bg-slate-50">
    <Sidebar />
    <div class="ml-60">
      <TopBar />
      <main class="p-6">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import Sidebar from './Sidebar.vue'
import TopBar from './TopBar.vue'
</script>