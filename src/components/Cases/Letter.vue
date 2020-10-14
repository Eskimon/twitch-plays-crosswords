<template>
  <div
    class="case letter"
    :class="[value.dashed ? `dash-${value.dashed}` : '', value.available ? '' : 'found']"
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
}
.found {
  background-color: rgba(255, 255, 255, 0.75);
  z-index: 10;
}
.case.dash-1 {
  border-bottom: 1px dashed lightgray;
}
.case.dash-2 {
  border-right: 1px dashed darkgray;
}
</style>
