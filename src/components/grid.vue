<template>
  <div class="playarea" ref="playarea">
    <div class="gameInfo">
      <strong class="error" v-show="error">{{ error }}</strong>
      <span>Temps écoulé <strong>{{ elapsed }}</strong></span>
      <span>Mots restants <strong>{{ remaining }}</strong></span>
    </div>
    <div
      v-if="grid"
      id="grille"
      :style="getGridStyle"
    >
      <template v-for="cell in grid.cases">
        <case-letter v-if="cell.type === 2" :value="cell" :key="`case-${cell.pos}`"></case-letter>
        <case-description v-if="cell.type === 3" :value="cell" :grid="grid" :key="`case-${cell.pos}`" @guess="tryGuess"></case-description>
        <case-empty v-if="cell.type === 4" :key="`case-${cell.pos}`"></case-empty>
      </template>
    </div>
  </div>
</template>

<script>
import panzoom from 'panzoom'

import tools from '../utils/tools'
import GridManager from '../utils/GridManager'
import CaseDescription from './Cases/Description'
import CaseEmpty from './Cases/Empty'
import CaseLetter from './Cases/Letter'

export default {
  name: 'grid',
  props: ['grid_id', 'player'],
  components: {
    CaseDescription,
    CaseEmpty,
    CaseLetter,
  },
  data() {
    return {
      error: '',
      guess: '',
      gm: null,
      grid: null,

      remaining: 0,
      elapsedRaw: 0,
      startedAt: null,
      panzoom: null,
    };
  },
  created() {
    if(this.grid_id) {
      this.gm = new GridManager();
      this.gm.retreiveAndParseGrid(this.grid_id, (grid) => {
        if (grid == null) {
          // If an error occurs, exit
          this.error = 'La grille n\'a pas pu être récupérée';
          console.error('[ERROR] Cannot retreive grid.');
        } else {
          this.refreshGrid();

          this.$nextTick(() => {
            let area = document.getElementById('grille');
            this.panzoom = panzoom(area, { autocenter: false, bounds: true });
          })

          this.startedAt = Date.now();
          setInterval(() => {
            this.elapsedRaw = Math.floor((Date.now() - this.startedAt) / 1000);
          }, 200);
        }
      });
    }
  },
  mounted() {
  },
  computed: {
    elapsed() {
      let seconds = this.elapsedRaw % 60;
      let minutes = Math.floor(this.elapsedRaw / 60);
      minutes = ('0' + minutes.toString(10)).slice(-2);
      seconds = ('0' + seconds.toString(10)).slice(-2);
      return `${minutes}:${seconds}`;
    },
    getGridStyle() {
      if(!this.grid) {
        return {}
      }
      return {
        'grid-template-columns': `repeat(${this.grid.nbColumns}, 50px)`,
        'grid-template-rows': `repeat(${this.grid.nbLines}, 50px)`,
      }
    }
  },
  methods: {
    refreshGrid() {
      this.grid = this.gm.getGrid();
      this.remaining = this.gm.getNbRemainingWords();
    },
    tryGuess(args) {
      let guess = prompt(args.def);
      if(guess)
        this.checkWord(this.player, guess, args.idx, '#ffffff');
    },
    checkWord(player, guess, idx, color) {
      guess = tools.slugify(guess).toUpperCase();
      console.log(`checking ${guess} at place ${idx}`)
      let wordObj = {
        word: guess,
        axis: 0,
        start: idx,
      }
      let points = this.gm.checkPlayerWord(wordObj, color, player);
      if(points > 0) {
        // Word guessed !!
        this.refreshGrid();
        this.$emit('wordfound', {player, points, color});
        return;
      }
      // Not guessed, try vertical
      wordObj.axis = 1;
      points = this.gm.checkPlayerWord(wordObj, color, player);
      if(points > 0) {
        // Word guessed !!
        this.refreshGrid();
        this.$emit('wordfound', {player, points, color});
        return;
      }
    }
  },
  destroyed() {
    if(this.panzoom) {
      this.panzoom.dispose();
    }
  }
}
</script>

<style>
.error {
  color: red;
}

.playarea {
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
}

.gameInfo {
  margin-bottom: 10px;
  z-index: 20;
}

.gameInfo span {
  margin: 0 10px;
}

#grille {
  display: grid;
  line-height: 50px;
  text-align: center;
}

.case {
  border: 1px solid #bbb;
}
</style>
