<template>
  <div>
    <div id="grille" :style="getGridStyle">
      <template v-for="y in size.v">
        <template v-for="x in size.h">
          <div
            :key="`y${y}-x${x}`"
            class="cell"
            :class="(solution[y-1][0][x-1] === 'x') ? 'empty' : ''"
          >
            {{ solution[y-1][0][x-1] }}
          </div>
        </template>
      </template>
    </div>
</div>
</template>

<script>

export default {
  name: 'grid',
  components: {
  },
  data() {
    return {
      words: {
        h: [],
        v: [],
      },
      size: {
        h: 0,
        v: 0,
      },
      definitions: {
        h: [],
        v: [],
      },
      solution: [],
    };
  },
  created() {
    this.size.h = window.gamedata.nbcaseslargeur;
    this.size.v = window.gamedata.nbcaseshauteur;
    this.solution = window.gamedata.grille;
  },
  mounted() {
    console.log('grid rendered')
  },
  computed: {
    getGridStyle() {
      return {
        'grid-template-columns': `repeat(${this.size.h}, 50px)`,
        'grid-template-rows': `repeat(${this.size.v}, 50px)`,
      }
    }
  },
  methods: {

  },
}
</script>

<style>
#grille {
  display: grid;
  line-height: 50px;
  text-align: center;
}

.cell {
  border: 1px solid black;
}

.cell.empty {
  background: black;
  cursor: not-allowed;
}
</style>
