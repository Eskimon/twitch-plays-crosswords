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
        <iframe
          v-if="channel"
          frameborder="0"
          id="tchat"
          scrolling="true"
          :src="`https://www.twitch.tv/embed/${channel}/chat?parent=${getDomain}&darkpopout`"
          height="60%"
          width="100%"
        >
        </iframe>
      </div>
    </div>

    <div class="modal" v-show="!channel">
      <div class="inner">
        <p>Pour pouvoir jouer, il vous faut tout d'abord préciser le nom de la chaîne Twitch dont le chat sera utilisé pour lire les réponses des spectateurs.</p>

        <p>Quelle est le nom de la chaîne Twitch que vous souhaitez utiliser ?</p>

        <input type="text" v-model="inputChannel" @keyup.enter="loadChannel">
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

      inputChannel: '',

      konami: null,
      config: config.GRID_PROVIDER,
    };
  },
  created() {
    this.konami = new KonamiCode();
    this.konami.listen(() => {
      // Easter egg!!!
      console.log( "konami code!" );
      this.$refs.grid.konami();
    });

    // Load score from local storage
    this.loadScore();
    // Get channel
    let urlParams = new URLSearchParams(window.location.search);
    this.channel = urlParams.get('channel');
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
  mounted() {
    let urlParams = new URLSearchParams(window.location.search);
    if(!urlParams.has('provider')) {
      return;
    }
    // Try to load new grid if any in URL
    let url_force = parseInt(urlParams.get('force')) || 0;
    let url_themed = urlParams.get('themed') === 'true';
    let url_giant = urlParams.get('giant') === 'true';
    let url_grid = parseInt(urlParams.get('grid')) || null;
    let url_provider = urlParams.get('provider');
    this.gridKey = this.getGridAddr(url_force, url_giant, url_themed, url_grid, url_provider);
  },
  computed: {
    getDomain() {
      return window.location.hostname;
    },
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
        message = message.trim();
        if(message === '!reset') {
          localStorage.setItem('score', '{}');
          this.scoreboard = {};
        } else if(message.substr(0, 8) === '!grille ') {
          // Parse command
          let matcher = message.match(/^!grille\s+([g|t]?)\s*([1-4])\s?([a-z]*)\s?(\d{0,4})$/);
          if(!matcher) {
            return;
          }
          console.log("matcher: ", matcher);
          let giant = matcher[1] === 'g';
          let themed = matcher[1] === 't';
          let force = matcher[2];
          let provider = matcher[3] || 'default';
          let id = matcher[4] || null;
          this.gridKey = this.getGridAddr(force, giant, themed, id, provider, id);
        }
      }

      if(/^[\d ]+\s[a-zA-Z\u00C0-\u024F -]+$/g.test(message)) {
        // Message is good to be tested
        message = message.trim();
        let guess = message.substr(message.indexOf(' ') + 1);
        this.$refs.grid.checkWord(name, guess, parseInt(message), userstate.color);
      }
    },
    getGridAddr(force=1, giant=false, themed=false, defaultId=null, provider='default') {
      let config = this.config[provider];
      if(provider === 'custom') {
        force = 0;
      }
      let root = '';
      let rmin = 0;
      let rmax = 0;
      force = force.toString();
      // Find id range depending on grid type
      if(giant && !themed) {
        rmin = config["GRIDS"]["giant"]["ranges"][force][0];
        rmax = config["GRIDS"]["giant"]["ranges"][force][1];
        root = config["GRIDS"]["giant"]["root"];
      } else if(themed && !giant) {
        rmin = config["GRIDS"]["themed"]["ranges"][0][0];
        rmax = config["GRIDS"]["themed"]["ranges"][0][1];
        root = config["GRIDS"]["themed"]["root"];
        force = '0';
      } else if(themed && giant) {
        rmin = config["GRIDS"]["giantthemed"]["ranges"][0][0];
        rmax = config["GRIDS"]["giantthemed"]["ranges"][0][1];
        root = config["GRIDS"]["giantthemed"]["root"];
        force = '0';
      } else {
        rmin = config["GRIDS"]["regular"]["ranges"][force][0];
        rmax = config["GRIDS"]["regular"]["ranges"][force][1];
        root = config["GRIDS"]["regular"]["root"];
      }
      let gridId = defaultId;
      if(!gridId)
        gridId = Math.floor(rmin + (Math.random() * Math.floor(rmax - rmin))).toString();
      gridId = '_' + gridId;
      let address = config.PROVIDER_ADDR + root + force + gridId + config.PROVIDER_EXTENSION;
      this.updateURL(gridId.substr(1), giant, themed, force, provider);
      // Update url
      return address;
    },
    updateURL(gridId, giant, themed, force, provider) {
      let newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + `?channel=${this.channel}`;
      newurl += `&grid=${gridId}&giant=${giant}&themed=${themed}&force=${force}&provider=${provider}`;
      window.history.pushState({ path:newurl }, '', newurl);
    },
    loadChannel() {
      let newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + `?channel=${this.inputChannel}`;
      window.location = newurl;
    }
  },
}
</script>

<style>
body {
  margin: 0;
  overflow: hidden;
  font-family: sans-serif;
}

#app {
  width: 100vw;
  height: 100vh;
}

#tchat {
  position: absolute;
  bottom: 0;
  left: 0;
}

.playground {
  display: grid;
  grid-template-columns: 75% 25%;
  height: 100%;
}

.score {
  background: #18181b;
  position: relative;
}

.score ul li {
  list-style-type: decimal;
}

.modal {
  position: absolute;
  top: 0;
  left: 0;
  height: 100vh;
  width: 100vw;
  background: rgba(0, 0, 0, .7);
  display: flex;
  justify-content: center;
  align-content: center;
  z-index: 1000;
}

.inner {
  width: 25%;
  margin: auto;
  padding: 30px 50px;
  background: #ddd;
  border-radius: 20px;
  border: solid 1px #444;
}

.inner input[type=text] {
  width: 100%;
}
</style>
