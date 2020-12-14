<template>
  <div class="playarea" ref="playarea">
    <div class="gameInfo">
      <strong class="error" v-show="error">{{ error }}</strong>
      <span>Temps écoulé <strong>{{ elapsed }}</strong></span>
      <span>Lettres restantes <strong>{{ nbLetters }}</strong></span>
      <button @click="resetZoom">🔎</button>
      <span>Force <strong>{{ metadata.force }}</strong></span>
      <span v-show="metadata.isThemed">Thème : <strong>{{ metadata.theme }}</strong></span>
    </div>
    <div v-show="loading" class="loading">
      <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="margin:auto;background:#fff;display:block;" width="200px" height="200px" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid">
        <g transform="translate(80,50)">
        <g transform="rotate(0)">
        <circle cx="0" cy="0" r="6" fill="#fecaca" fill-opacity="1">
          <animateTransform attributeName="transform" type="scale" begin="-0.875s" values="1.5 1.5;1 1" keyTimes="0;1" dur="1s" repeatCount="indefinite"></animateTransform>
          <animate attributeName="fill-opacity" keyTimes="0;1" dur="1s" repeatCount="indefinite" values="1;0" begin="-0.875s"></animate>
        </circle>
        </g>
        </g><g transform="translate(71.21320343559643,71.21320343559643)">
        <g transform="rotate(45)">
        <circle cx="0" cy="0" r="6" fill="#fecaca" fill-opacity="0.875">
          <animateTransform attributeName="transform" type="scale" begin="-0.75s" values="1.5 1.5;1 1" keyTimes="0;1" dur="1s" repeatCount="indefinite"></animateTransform>
          <animate attributeName="fill-opacity" keyTimes="0;1" dur="1s" repeatCount="indefinite" values="1;0" begin="-0.75s"></animate>
        </circle>
        </g>
        </g><g transform="translate(50,80)">
        <g transform="rotate(90)">
        <circle cx="0" cy="0" r="6" fill="#fecaca" fill-opacity="0.75">
          <animateTransform attributeName="transform" type="scale" begin="-0.625s" values="1.5 1.5;1 1" keyTimes="0;1" dur="1s" repeatCount="indefinite"></animateTransform>
          <animate attributeName="fill-opacity" keyTimes="0;1" dur="1s" repeatCount="indefinite" values="1;0" begin="-0.625s"></animate>
        </circle>
        </g>
        </g><g transform="translate(28.786796564403577,71.21320343559643)">
        <g transform="rotate(135)">
        <circle cx="0" cy="0" r="6" fill="#fecaca" fill-opacity="0.625">
          <animateTransform attributeName="transform" type="scale" begin="-0.5s" values="1.5 1.5;1 1" keyTimes="0;1" dur="1s" repeatCount="indefinite"></animateTransform>
          <animate attributeName="fill-opacity" keyTimes="0;1" dur="1s" repeatCount="indefinite" values="1;0" begin="-0.5s"></animate>
        </circle>
        </g>
        </g><g transform="translate(20,50.00000000000001)">
        <g transform="rotate(180)">
        <circle cx="0" cy="0" r="6" fill="#fecaca" fill-opacity="0.5">
          <animateTransform attributeName="transform" type="scale" begin="-0.375s" values="1.5 1.5;1 1" keyTimes="0;1" dur="1s" repeatCount="indefinite"></animateTransform>
          <animate attributeName="fill-opacity" keyTimes="0;1" dur="1s" repeatCount="indefinite" values="1;0" begin="-0.375s"></animate>
        </circle>
        </g>
        </g><g transform="translate(28.78679656440357,28.786796564403577)">
        <g transform="rotate(225)">
        <circle cx="0" cy="0" r="6" fill="#fecaca" fill-opacity="0.375">
          <animateTransform attributeName="transform" type="scale" begin="-0.25s" values="1.5 1.5;1 1" keyTimes="0;1" dur="1s" repeatCount="indefinite"></animateTransform>
          <animate attributeName="fill-opacity" keyTimes="0;1" dur="1s" repeatCount="indefinite" values="1;0" begin="-0.25s"></animate>
        </circle>
        </g>
        </g><g transform="translate(49.99999999999999,20)">
        <g transform="rotate(270)">
        <circle cx="0" cy="0" r="6" fill="#fecaca" fill-opacity="0.25">
          <animateTransform attributeName="transform" type="scale" begin="-0.125s" values="1.5 1.5;1 1" keyTimes="0;1" dur="1s" repeatCount="indefinite"></animateTransform>
          <animate attributeName="fill-opacity" keyTimes="0;1" dur="1s" repeatCount="indefinite" values="1;0" begin="-0.125s"></animate>
        </circle>
        </g>
        </g><g transform="translate(71.21320343559643,28.78679656440357)">
        <g transform="rotate(315)">
        <circle cx="0" cy="0" r="6" fill="#fecaca" fill-opacity="0.125">
          <animateTransform attributeName="transform" type="scale" begin="0s" values="1.5 1.5;1 1" keyTimes="0;1" dur="1s" repeatCount="indefinite"></animateTransform>
          <animate attributeName="fill-opacity" keyTimes="0;1" dur="1s" repeatCount="indefinite" values="1;0" begin="0s"></animate>
        </circle>
        </g>
        </g>
      </svg>
    </div>
    <div
      v-if="grid"
      id="grille"
      :style="getGridStyle"
    >
      <template v-for="cell in grid.cases">
        <case-letter v-if="cell.type === 2" :value="cell" :key="`case-${cell.pos}`"></case-letter>
        <case-description v-if="cell.type === 3" :value="cell" :grid="grid" :key="`case-${cell.pos}`" @guess="promptGuess"></case-description>
        <case-empty v-if="cell.type === 4" :key="`case-${cell.pos}`"></case-empty>
      </template>
    </div>
    <div class="modal guess" v-show="guess.show" @click="guess.show = false">
      <div class="inner" @click.stop="">
        <p>{{ guess.prompt }}</p>
        <input ref="guessInput" type="text" v-model="guess.input" @keyup.enter="tryGuess">
      </div>
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
      loading: true,
      error: '',
      guess: {
        show: false,
        input: '',
        position: 0,
        prompt: '',
      },
      gm: null,
      grid: null,

      remaining: 0,
      nbLetters: 0,
      elapsedRaw: 0,
      startedAt: null,
      panzoom: null,

      metadata: {
        force: 0,
        isThemed: false,
        isGiant: false,
        theme: '',
        provider: '',
        gridId: 0,
      },
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
          this.loading = false;

          let meta = this.gm.getGridMetadata();

          this.metadata.force = meta.force;
          this.metadata.isThemed = meta.isThemed;
          this.metadata.isGiant = meta.isGiant;
          this.metadata.theme = meta.theme;
          this.metadata.provider = meta.provider;
          this.metadata.gridId = meta.gridId;

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
    konami() {
      // Cheat code to reveal all first letter
      if(!this.grid)
        return;
      let positions = document.getElementsByClassName('cellId');
      positions.forEach(pos => {
        this.gm.forceReveal(parseInt(pos.textContent), '#000000');
      });
      this.grid = this.gm.getGrid();
    },
    refreshGrid() {
      this.grid = this.gm.getGrid();
      this.remaining = this.gm.getNbRemainingWords();
      this.nbLetters = this.gm.getNbRemainingLetters();
    },
    promptGuess(args) {
      this.guess.prompt = args.def;
      this.guess.input = '';
      this.guess.position = args.idx;
      this.guess.show = true;
      this.$nextTick(() => {
        this.$refs.guessInput.focus();
      });
    },
    tryGuess() {
      this.checkWord(this.player, this.guess.input, this.guess.position, '#7F7F7F');
      this.guess.show = false;
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
    },
    resetZoom() {
      this.panzoom.moveTo(0, 0);
      this.panzoom.zoomAbs(0, 0, 1);
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
.loading {
  height: 100%;
  display: flex;
  justify-content: center;
  align-content: center;
}

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
  border: 1px solid #ff0000;
}

.modal.guess {
  background: rgba(0, 0, 0, 0.1);
}
.modal.guess .inner {
  width: 20%;
  margin: auto;
  padding: 20px 30px;
  background: #ddd;
}
</style>
