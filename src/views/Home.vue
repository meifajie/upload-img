<template>
  <div class="home">    
    <List msg="Welcome to Your Vue.js App"/>
  </div>
</template>

<script>
// @ is an alias to /src
import List from '@/components/List.vue'
import '@/assets/css/reset.css' 
export default {
  name: 'home',
  components: {
    List
  }
}
</script>
<style scoped>
.home{width:100%; height:100%;}
</style>
