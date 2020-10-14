<template>
  <div class="playarea">
    <div class="gameInfo">
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
import tools from '../utils/tools'
import GridManager from '../utils/GridManager'
import CaseDescription from './Cases/Description'
import CaseEmpty from './Cases/Empty'
import CaseLetter from './Cases/Letter'

export default {
  name: 'grid',
  components: {
    CaseDescription,
    CaseEmpty,
    CaseLetter,
  },
  data() {
    return {
      guess: '',
      gm: null,
      grid: null,

      remaining: 0,
      elapsedRaw: 0,
    };
  },
  created() {
    this.gm = new GridManager();

    this.gm.retreiveAndParseGrid(16, (grid) => {
      if (grid == null) {
        // If an error occurs, exit
        console.error('[ERROR] Cannot retreive grid. Abort server.');
      } else {
        this.refreshGrid();
        setInterval(() => { this.elapsedRaw++ }, 1000)
      }
    });
  },
  mounted() {
    console.log('grid rendered');
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
        this.checkWord('streamer', guess, args.idx);
    },
    checkWord(player, guess, idx) {
      guess = tools.slugify(guess).toUpperCase();
      console.log(`checking ${guess} at place ${idx}`)
      let wordObj = {
        word: guess,
        axis: 0,
        start: idx,
      }
      let points = this.gm.checkPlayerWord(wordObj);
      if(points > 0) {
        // Word guessed !!
        this.refreshGrid();
        // TODO Emit won signal
        return;
      }
      // Not guessed, try vertical
      wordObj.axis = 1;
      points = this.gm.checkPlayerWord(wordObj);
      if(points > 0) {
        // Word guessed !!
        this.refreshGrid();
        // TODO Emit won signal
        return;
      }
    }
  },
}
</script>

<style>
.playarea {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.gameInfo {
  margin-bottom: 10px;
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
