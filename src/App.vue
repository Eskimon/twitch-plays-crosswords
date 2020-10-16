<template>
  <div id="app">
    <div class="playground">
      <grid
        ref="grid"
        @wordfound="updateScore"
        :grid_id="gridKey"
        :player="channel"
        :key="`grid-${gridKey}`"
      ></grid>
      <div class="score">
        <ul>
          <li
            v-for="player in getScoreList"
            :key="`score-${player[0]}`"
            :style="`color: ${scoreboard[player[0]].color}`"
          >
            {{ player[0] }} <small>({{ scoreboard[player[0]].score }})</small>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import config from './utils/config.json'

import Grid from './components/grid.vue'
import KonamiCode from './utils/konami';

export default {
  name: 'App',
  components: {
    Grid,
  },
  data() {
    return {
      ready: false,
      scoreboard: {},
      channel: '',
      gridKey: 0,

      konami: null,
      config: config.GRID_PROVIDER,
    };
  },
  created() {
    this.konami = new KonamiCode();
    this.konami.listen(() => {
      // Easter egg!!!
      console.log( "konami code!" );
    });

    // Get channel
    let urlParams = new URLSearchParams(window.location.search);
    this.channel = urlParams.get('channel');
    // Load score from local storage
    this.loadScore();
    // Connect to chat
    const tmi = require('tmi.js');
    this.client = new tmi.Client({
      // options: { debug: true },
      connection: {
        secure: true,
        reconnect: true
      },
      channels: [this.channel],
    });
    this.addListeners();
    this.client.connect();
  },
  mounted() {},
  computed: {
    getScoreList() {
      // Return score in sorted order
      let items = Object.keys(this.scoreboard).map((key) => {
        return [key, this.scoreboard[key]];
      });

      // Sort the array based on the second element (the score)
      items.sort((first, second) => {
        return second[1] - first[1];
      });
      return items;
    }
  },
  methods: {
    updateScore(args) {
      let points = args.points;
      let color = args.color;
      let player = args.player;
      if(!player) {
        player = this.channel;
      }
      if(!(player in this.scoreboard)) { // Create player if not existing
        this.$set(this.scoreboard, player, null);
        this.scoreboard[player] = Object.assign({}, this.scoreboard[player], {score: 0, color: color});
      }
      this.scoreboard[player].score += points;
      this.saveScore();
    },
    resetScore() {
      this.scoreboard = {};
      this.saveScore();
    },
    saveScore() {
      localStorage.setItem('score', JSON.stringify(this.scoreboard));
    },
    loadScore() {
      try {
        this.scoreboard = JSON.parse(localStorage.getItem('score')) || {};
      } catch (error) {
        console.error('Error while loading scoreboard', error);
        this.scoreboard = {};
      }
      console.log('scoreboard loaded', this.scoreboard);
    },

    addListeners() {
      this.client.on('message', this.handleMessage);
      this.client.on('connecting', () => {
        console.log('Twitch chat connecting...');
      });
      this.client.on('connected', () => {
        console.log('Twitch chat connected!');
      });
      this.client.on('disconnected', () => {
        console.log('Twitch chat disconnected :/ !');
      });
    },
    handleMessage(channel, userstate, message) {
      console.log(userstate);
      let name = userstate['display-name'] || userstate.username;
      if(/[^\w]/g.test(name)) {
        name += ` (${userstate.username})`;
      }
      console.log('message received', message, name);
      if(userstate.username === this.channel || userstate.mod || userstate.username === 'eskimon') {
        message = message.trimRight();
        if(message === '!reset') {
          localStorage.setItem('score', '{}');
          this.scoreboard = {};
        } else if(message === '!grille g4') {
          this.gridKey = this.getGridAddr(4, true, false);
        } else if(message === '!grille g3') {
          this.gridKey = this.getGridAddr(3, true, false);
        } else if(message === '!grille g2') {
          this.gridKey = this.getGridAddr(2, true, false);
        } else if(message === '!grille g1') {
          this.gridKey = this.getGridAddr(1, true, false);
        } else if(message === '!grille 4') {
          this.gridKey = this.getGridAddr(4, true, false);
        } else if(message === '!grille 3') {
          this.gridKey = this.getGridAddr(3, true, false);
        } else if(message === '!grille 2') {
          this.gridKey = this.getGridAddr(2, true, false);
        } else if(message === '!grille 1') {
          this.gridKey = this.getGridAddr(1, true, false);
        } else if(message === '!grille gt') {
          this.gridKey = this.getGridAddr(0, true, true);
        } else if(message === '!grille t') {
          this.gridKey = this.getGridAddr(0, false, true);
        }
      }

      if(/^[\d ]+\s[a-zA-Z\u00C0-\u024F -]+$/g.test(message)) {
        // Message is good to be tested
        message = message.trim();
        let guess = message.substr(message.indexOf(' ') + 1);
        this.$refs.grid.checkWord(name, guess, parseInt(message), userstate.color);
      }
    },
    getGridAddr(force=1, giant=false, themed=false) {
      let root = '';
      let rmin = 0;
      let rmax = 0;
      force = force.toString();
      // Find id range depending on grid type
      if(giant && !themed) {
        rmin = this.config["GRIDS"]["giant"]["ranges"][force][0];
        rmax = this.config["GRIDS"]["giant"]["ranges"][force][1];
        root = this.config["GRIDS"]["giant"]["root"];
      } else if(themed && !giant) {
        rmin = this.config["GRIDS"]["themed"]["ranges"][0][0];
        rmax = this.config["GRIDS"]["themed"]["ranges"][0][1];
        root = this.config["GRIDS"]["themed"]["root"];
        force = '0';
      } else if(themed && giant) {
        rmin = this.config["GRIDS"]["giantthemed"]["ranges"][0][0];
        rmax = this.config["GRIDS"]["giantthemed"]["ranges"][0][1];
        root = this.config["GRIDS"]["giantthemed"]["root"];
        force = '0';
      } else {
        rmin = this.config["GRIDS"]["regular"]["ranges"][force][0];
        rmax = this.config["GRIDS"]["regular"]["ranges"][force][1];
        root = this.config["GRIDS"]["regular"]["root"];
      }
      let gridId = '_' + Math.floor(rmin + (Math.random() * Math.floor(rmax - rmin))).toString();
      let address = this.config.PROVIDER_ADDR + root + force + gridId + this.config.PROVIDER_EXTENSION;
      return address;
    }
  },
}
</script>

<style>
body {
  margin: 0;
  overflow: hidden;
}

#app {
  width: 100vw;
  height: 100vh;
}

.playground {
  display: grid;
  grid-template-columns: 75% 25%;
  height: 100%;
}

.score {
  background: #18181b;
}

.score ul li {
  list-style-type: decimal;
}
</style>
