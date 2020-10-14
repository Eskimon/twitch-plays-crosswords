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
        :class="`defsize-${value.nbLines}`"
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
      console.log(this.value.desc[idx]);
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
  border-top: solid 1px #333;
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
  position: absolute;
  top: -30%;
  left: -25%;
  width: 100%;
  height: 100%;
  text-align: center;
  font-size: 12px;
  color: #666;
}

.arrow-2 .cellId, .arrow-3 .cellId {
  top: 70%;
}

.arrow {
  position: absolute;
  width: 100%;
  z-index: 2;
  font-size: 16px;
  color: darkgray;
}

.arrow-0 {
  left: 100%;
  text-align: left;
}
.arrow-0::before {
  content: '→';
}

.arrow-1 {
  left: 100%;
  text-align: left;
}
.arrow-1::before {
  content: '↴';
}

.arrow-2 {
  top: calc(50% + 7px);
  text-align: center;
}
.arrow-2::before {
  content: '↓';
}

.arrow-3 {
  top: calc(50% + 7px);
  text-align: center;
}
.arrow-3::before {
  content: '↳';
}

.arrow-4 {
  left: 100%;
  text-align: left;
}
.arrow-4::before {
  content: '→';
}
</style>
