<template>
  <div
    class="case letter"
    :class="[value.dashed ? `dash-${value.dashed}` : '', value.available ? '' : 'found']"
    :style="`color: ${value.color}`"
    :title="value.player"
  >
    {{ value.available ? '' : value.value }}
  </div>
</template>

<script>
export default {
  name: 'LetterCase',
  props: ['value'],
  components: {
  },
  data() {
    return {
    };
  },
  created() {
  },
  mounted() {
  },
  computed: {
  },
  methods: {
  },
}
</script>

<style>
.case.letter {
  z-index: 1;
  font-family: monospace;
  font-size: 25px;
  background-color: rgba(255, 255, 255, 1);
  z-index: 1;
}
.case.letter.found {
  background-color: rgba(255, 255, 255, 0.5);
  z-index: 10;
}
.case.dash-1 {
  border-bottom: 1px dashed lightgray;
}
.case.dash-2 {
  border-right: 1px dashed darkgray;
}
</style>
