<template>
  <div id="app">
    <div class="playground">
      <grid></grid>
      <div class="score"></div>
    </div>
  </div>
</template>

<script>
import Grid from './components/mfgrid.vue'

export default {
  name: 'App',
  components: {
    Grid,
  },
  data() {
    return {
      ready: false,
    };
  },
  created() {

  },
  mounted() {

  },
  computed: {

  },
  methods: {
    /*
    loadGrid() {
      this.ready = false;
      this.loadScript('./fixtures/grille.mcj', this.parseGrid);
    },

    parseGrid() {
      console.log(window.gamedata);
      this.ready = true;
    },

    loadScript(url, callback) {
        // Adding the script tag to the head as suggested before
        var head = document.head;
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = url;

        // Then bind the event to the callback function.
        // There are several events for cross browser compatibility.
        script.onreadystatechange = callback;
        script.onload = callback;

        // Fire the loading
        head.appendChild(script);
    }
    */
  },
}
</script>

<style>
.playground {
  display: grid;
  grid-template-columns: 75% 25%;
}
</style>
