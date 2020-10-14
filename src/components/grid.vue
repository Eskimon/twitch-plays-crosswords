<template>
  <div class="playarea">
    <div class="definitions">
      <input type="text" v-model="guess" @keyup.enter="tryWord('streamer')" ref="guessBox">
      <h4>Horizontal</h4>
      <ul class="definitions">
        <li
          v-for="def in definitions.h"
          :key="def.key"
          :style="`color: ${def.color}`"
          :class="def.found ? 'striked' : ''"
          @click="guess = def.key + ' '; guessFocus()"
        >
          {{ def.key }} : {{ def.def }}
        </li>
      </ul>
      <h4>Vertical</h4>
      <ul>
        <li
          v-for="def in definitions.v"
          :key="def.key"
          :style="`color: ${def.color}`"
          :class="def.found ? 'striked' : ''"
          @click="guess = def.key + ' '; guessFocus()"
        >
          {{ def.key }} : {{ def.def }}
        </li>
      </ul>
    </div>

    <div id="grille" :style="getGridStyle">
      <template v-for="y in size.v">
        <template v-for="x in size.h">
          <div
            :key="`y${y-1}-x${x-1}`"
            class="cell"
            :class="(solution[((y - 1) * size.h) + (x - 1)].letter === 'x') ? 'empty' : ''"
          >
            {{ solution[((y - 1) * size.h) + (x - 1)].found ? solution[((y - 1) * size.h) + (x - 1)].letter : '' }}
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
      guess: '',
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

    for(let i=0; i < window.gamedata.grille.length; i++) {
      for(let j=0; j < window.gamedata.grille[i][0].length; j++) {
        this.solution.push({
          letter: window.gamedata.grille[i][0].charAt(j),
          found: false,
        })
      }
    }

    // Fill in definitions array (horizontal)
    for(let i=0; i<this.size.v; i++) {
      let defs = window.gamedata.definitionsh[i];
      for(let j=0; j < defs.length; j++) {
        this.definitions.h.push({
          key: 'h' + (i + 1) + String.fromCharCode(97 + j),
          def: window.gamedata.definitionsh[i][j],
          found: false,
          color: '#000000',
          solution: '',
          starts_at: 0,
        })
      }
    }

    // Fill in definitions array (vertical)
    for(let i=0; i<this.size.h; i++) {
      let defs = window.gamedata.definitionsv[i];
      for(let j=0; j < defs.length; j++) {
        this.definitions.v.push({
          key: 'h' + (i + 1) + String.fromCharCode(97 + j),
          def: window.gamedata.definitionsv[i][j],
          found: false,
          color: '#000000',
          solution: '',
        })
      }
    }
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
    guessFocus() {
      this.$refs['guessBox'].focus();
    },
    tryWord(player) {
      console.log(player);
      // TODO add some feedback on action
      let answer = this.guess.toLowerCase();
      if(answer.charAt(0) != 'h' && answer.charAt(0) != 'v')
        return;
      let idx = answer.indexOf(' ');
      let key = answer.substring(0, idx);
      answer = answer.substring(idx + 1).slugify().toUpperCase();

      let isHorizontal = (key.charAt(0) === 'h');
      let key_id = parseInt(key.substr(1));  // hacky because will properly remove the a,b,c from last char
      let subid = key.substr(String(key_id).length + 1).charCodeAt(0) - 97;

      console.log(isHorizontal, key_id, subid, answer);
      let fail = false;
      if(isHorizontal) {
        // explore horizontally?
        // if subid > 0, find the start place
        let start = 0;
        if(subid > 0) {
          for(let i=1; i<this.size.h; i++) {
            let idx = ((key_id - 1) * this.size.h) + i;
            if(this.solutions[idx].letter == 'x')
              start = i;
          }
        }
        // No check if the word is right
        for(let i=0; i<answer.length; i++) {
          let idx = ((key_id - 1) * this.size.h) + i + start;
          if(this.solution[idx].letter != answer.getCharAt(i)) {
            fail = true;
            break;
          }
        }

      } else {
        // explore verticcaly

      }

      if(!fail) {
        console.log("fail");
      } else {
        console.log("not fail");
      }
    }
  },
}
</script>

<style>
.playarea {
  display: flex;
  align-items: center;
}

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

ul.definitions li {
  list-style-type: none;
  cursor: pointer;
}
</style>
