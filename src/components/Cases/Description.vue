<template>
  <div class="case description">
    <div
      v-for="arrow in value.arrow"
      :key="`${value.pos}-${arrow}`"
      :class="`arrow arrow-${arrow}`"
    >
      <span class="cellId">{{ getIdx(value.pos, arrow) }}</span>
    </div>
    <div class="def">
      <span
        v-for="(def, idx) in value.desc"
        :key="`${value.pos}-def-${idx}`"
        v-html="def"
        :class="`defsize-${value.nbLines} ${(value.themed & (idx + 1)) ? 'themed': ''}`"
        @click="triggerGuess(idx)"
      >
      </span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DescriptionCase',
  props: ['value', 'grid'],
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
    triggerGuess(idx) {
      let prompt = this.value.desc[idx].replaceAll('–<br/>', '').replaceAll('–', '').replaceAll('<br/>', ' ');
      this.$emit('guess', {def: prompt, idx: this.getIdx(this.value.pos, this.value.arrow[idx])});
    },
    getIdx(pos, direction) {
      if((direction === 0) || (direction === 1) || (direction === 4)) {
        return pos + 1;
      }
      else if((direction === 2) || (direction === 3)) {
        return pos + this.grid.nbColumns;
      }
      return 0;
    }
  },
}
</script>

<style>
.case.description {
  background: #fecaca;
  position: relative;
}

.def .themed {
  background: #cacafe;
}

.def {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  text-align: center;
  font-size: 8px;
}
.def span:hover {
  background: #ff6666;
  cursor: pointer;
  z-index: 5;
}
.def span + span {
  border-top: solid 1px #ff0000;
}
.defsize-1 {
  line-height: 48px;
}
.defsize-2 {
  line-height: 24px;
}
.defsize-3 {
  line-height: 16px;
}
.defsize-4 {
  line-height: 12px;
}
.defsize-5 {
  line-height: 9px;
}

.cellId {
  /* position: absolute; */
  /* padding: 4px; */
  /* text-align: left; */
  font-size: 11px;
  color: #666;
  line-height: normal;
  align-self: center;
}

.arrow {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 2;
  font-size: 16px;
  color: #ff0000;
  display: flex;
  align-items: flex-start;
}

.arrow-0 {
  left: calc(100% + 2px);
  justify-content: center;
}
.arrow-0::after {
  position: absolute;
  left: -2px;
  content: '→';
  line-height: normal;
}

.arrow-1 {
  left: calc(100% + 2px);;
  justify-content: center;
}
.arrow-1::after {
  position: absolute;
  left: -4px;
  content: '↴';
  line-height: normal;
}

.arrow-2 {
  top: calc(100% + 2px);
}
.arrow-2 .cellId {
  width: 100%;
  text-align: center;
}
.arrow-2::after {
  content: '↓';
  line-height: normal;
  width: 100%;
  text-align: center;
  line-height: 12px;
  top: -1px;
  position: absolute;
}

.arrow-3 {
  top: calc(100% + 2px);
}
.arrow-3 .cellId {
  width: 100%;
  text-align: center;
}
.arrow-3::after {
  content: '↳';
  line-height: normal;
  width: 100%;
  text-align: center;
  line-height: 12px;
  top: -1px;
  position: absolute;
}

.arrow-4 {
  left: calc(100% + 2px);
  justify-content: center;
}
.arrow-4::after {
  position: absolute;
  left: -2px;
  content: '→';
  line-height: normal;
}
</style>
