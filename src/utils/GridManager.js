/*global gamedata*/  // Trick to make eslint believe that gamedata exist (will be load from parsed file)

var enums   = require('./enums'),
    Case    = require('./Case');

var _grid           = null, // the grid itself !
    _gridInfos      = null,
    _nbLetters      = 0,
    _maxPoints      = 0;

var enumCaseParser = {
  InARow: 1,
  Horizontal: 2,
  Vertical: 3
};

var enumArrow = {
  Right: 0,
  RightBottom: 1,
  Bottom: 2,
  BottomRight: 3
};


function GridManager() {
  // Init grid infos
  _gridInfos = {
    provider: '',
    id:       0,
    level:    0,
    nbWords:  0
  };
}

function getNextCase(grid, kindMove, caseType, lastCase) {
  var iterator = 0;

  // Get the last case position
  if (lastCase) {
    iterator = lastCase.pos;

    // Move iterator to the next case according the kind of search we want
    if ((kindMove == enumCaseParser.InARow) || (kindMove == enumCaseParser.Horizontal))
      iterator++;
    else if (kindMove == enumCaseParser.Vertical)
      iterator += grid.nbLines;
  }

  // Don't bypass array length !
  if (iterator >= grid.cases.length)
    return (null);

  // According to the kind of case we want, continue searching or not
  if (caseType != grid.cases[iterator].type)
    return (getNextCase(grid, kindMove, caseType, grid.cases[iterator]));

  return (grid.cases[iterator]);
}

function insertDescription(grid, desc) {
  var currentCase = getNextCase(grid, enumCaseParser.InARow, enums.CaseType.Description),
      assigned = false;

  // Try to set description then go to the next available description case
  // If the desc has been set, or if we run out of cases, exit the loop
  while (currentCase !== null && !assigned) {
    assigned = currentCase.setDescription(desc);
    currentCase = getNextCase(grid, enumCaseParser.InARow, enums.CaseType.Description, currentCase);
  }
}

function getCaseType(Char) {
  if (Char == 'z')
    return (enums.CaseType.Empty);
  else if ((Char >= 'A') && (Char <= 'Z'))
    return (enums.CaseType.Letter);
  else
    return (enums.CaseType.Description);
}

function onGetGridError(cb, errorMessage) {
  // Print error reason
  console.error('\t[ERROR]: Cannot retreive grid...');
  console.error('\t[ERROR]: ' + errorMessage);

  // Raise callback with null parameter
  cb(null);
}

function parseGrid(callback, serverText) {
  var i, j,
      currentCase = 0,
      type,
      grid = {
        nbLines: 0,
        nbColumns: 0,
        nbWords: 0,
        cases: []
      };

  eval(serverText); // Parse and evaluate js, generate variable gamedata

  grid.level = gamedata.force;
  _gridInfos.level = gamedata.force;

  grid.nbWords = gamedata.definitions.length;
  _gridInfos.nbWords = gamedata.definitions.length;

  grid.nbLines = gamedata.nbcaseshauteur;
  grid.nbColumns = gamedata.nbcaseslargeur;

  // Load letters
  for (i in gamedata.grille){
    for (j in gamedata.grille[i]){
      type = getCaseType(gamedata.grille[i][j]);
      if (type == enums.CaseType.Letter) {
        grid.cases.push(new Case.LetterCase(currentCase++, gamedata.grille[i][j]));
        _nbLetters++;
      } else if (type == enums.CaseType.Description) {
        grid.cases.push(new Case.DescriptionCase(currentCase++, gamedata.grille[i][j]));
      } else {
        grid.cases.push(new Case.EmptyCase(currentCase++));
      }
    }
  }

  // Add descriptions
  for (i in gamedata.definitions){
    insertDescription(grid, gamedata.definitions[i].join('\n'));
  }

  // Add dotted
  for (i in gamedata.spountzV){
    let nb = gamedata.spountzV[i][0] + (gamedata.spountzV[i][1]-1)*grid.nbColumns;
    grid.cases[nb - 1].dashed = 2;
  }
  for (i in gamedata.spountzH){
    let nb = gamedata.spountzH[i][0] + (gamedata.spountzH[i][1]-1)*grid.nbColumns;
    grid.cases[nb - 1].dashed = 1;
  }

  // Once the entire grid is retreived, place arrows
  placeArrows(grid);

  // Then store the grid
  _grid = grid;
}

function placeArrows(grid) {
  var i,
      gridSize = grid.cases.length;

  // Check each cell to find a description frame
  for (i = 0; i < gridSize; i++) {
    if (grid.cases[i].type == enums.CaseType.Description) {

      // According the type of description, set the right arrow to the
      switch (grid.cases[i].value) {
        case 'a':
          grid.cases[i].arrow[0] = enumArrow.Right;
          break;
        case 'b':
          grid.cases[i].arrow[0] = enumArrow.Bottom;
          break;
        case 'c':
          grid.cases[i].arrow[0] = enumArrow.RightBottom;
          break;
        case 'd':
          grid.cases[i].arrow[0] = enumArrow.BottomRight;
          break;

        case 'e':
        case 'f':
        case 'g':
        case 'h':
        case 'i':
          grid.cases[i].arrow[0] = enumArrow.Right;
          grid.cases[i].arrow[1] = enumArrow.Bottom;
          break;
        case 'j':
        case 'k':
        case 'l':
        case 'm':
        case 'n':
          grid.cases[i].arrow[0] = enumArrow.RightBottom;
          grid.cases[i].arrow[1] = enumArrow.Bottom;
          break;
        case 'o':
        case 'p':
        case 'q':
        case 'r':
        case 's':
          grid.cases[i].arrow[0] = enumArrow.Right;
          grid.cases[i].arrow[1] = enumArrow.BottomRight;
          break;
        case 't':
        case 'u':
        case 'v':
        case 'w':
        case 'x':
          grid.cases[i].arrow[0] = enumArrow.RightBottom;
          grid.cases[i].arrow[1] = enumArrow.BottomRight;
          break;

        default:
          console.error('[ERROR][gridManager::placeArrows] Unknow arrow type [' + grid.cases[i].value + '] at frame ' + i);
      }
    }
  }
}

/* PUBLIC METHODS */

/*
* Reveal a cell (if it is a letter)
* @param  {int}  poisition   Position of the letter
*/
GridManager.prototype.forceReveal = function (position, color) {
  if(_grid.cases[position].type === 2) {
    if(_grid.cases[position].available) {
      _grid.cases[position].available = false;
      _grid.cases[position].color = color;
      _grid.cases[position].player = '';
    }
  }
}

/*
* Check if the player's founded word is the right one
* @param  {Object}  wordObj   Client word object
* @return {Int}    Points scored by the player. If return 0, it's just the wrong word :)
*/
GridManager.prototype.checkPlayerWord = function (wordObj, color, player) {
  var jump      = (wordObj.axis == 0) ? 1 : _grid.nbColumns,
      wordSize  = wordObj.word.length,
      points    = 0,
      index     = wordObj.start,
      i;

  // Check if preceding case is a letter (return -1)
  // test vertical
  if(wordObj.axis && index > _grid.nbColumns && _grid.cases[index - jump].type === 2)
    return (-1);
  // test horizontal
  if(!wordObj.axis && (index % _grid.nbColumns) && _grid.cases[index - 1].type === 2)
    return (-1);

  // Check each letters
  for (i = 0; i < wordSize; i++) {
    if(!_grid.cases[index])
      return (-1);
    // If the letter doesn't match the grid, return false
    if (wordObj.word[i] != _grid.cases[index].value)
      return (-1);

    index += jump;
  }

  // Return if the following case exist and is a letter
  if(wordObj.axis === 0 && (index % _grid.nbColumns)) {
    if(_grid.cases[index] != undefined && _grid.cases[index].type === 2)
      return (-1);
  }

  // It's the righ word, so set letters as already founded
  index = wordObj.start;
  for (i = 0; i < wordSize; i++) {
    if (_grid.cases[index].available == true) {
      _grid.cases[index].available = false;
      _grid.cases[index].color = color;
      _grid.cases[index].player = player;
      points++;
    }
    index += jump;
  }

  // Decrease word counter
  _grid.nbWords--;

  return (points);
};

/*
* Return a complete grid object to send to the clients.
* The "grid" object is composed by the grid itself, grid informations (nb lines, etc...) and provider informations
* @return {Object}    A grid object with all informations needed by the clients
*/
GridManager.prototype.getGrid = function () {
  var clonedGrid;

  // Clone the grid object by extanded an empty object
  clonedGrid = JSON.parse(JSON.stringify(_grid));

  // Adding grid's informations
  clonedGrid.infos = _gridInfos;
/*
  // Finally hide letters before send it to the players :)
  for (let index in clonedGrid.cases) {
    if (clonedGrid.cases[index].type == enums.CaseType.Letter)
      clonedGrid.cases[index].value = '';
  }
*/
  return (clonedGrid);
};

/*
* Return grid informations
* @return {Object}    The grid information object
*/
GridManager.prototype.getGridInfos = function () {
  return (_gridInfos);
};

/*
* To retreive the number of words still not found
* @return {Int}    The number of words still available
*/
GridManager.prototype.getNbRemainingWords = function () {
  return (_grid.nbWords);
}

/*
* Retreive the accomplishment rate for
* @return {Int}    The number of words still available
*/
GridManager.prototype.getAccomplishmentRate = function (playerPoints, nbPlayers) {
  // If we have not retreive the maximum of points for this game
  if (_maxPoints == 0) {
    switch (nbPlayers) {
      case 1:
        // Because of bonus points, we have to give more points than letters available for 1 player game
        _maxPoints = Math.floor(_nbLetters * 1.5);
        break;
      case 2:
        // For a regular 2 player game, the maximum of points can be 90% of letters available. That seems fair :)
        _maxPoints = Math.floor(_nbLetters * 0.9);
        break;
      case 3:
        // For 3 player, the maximum is 75% of the amount of letters.
        _maxPoints = Math.floor(_nbLetters * 0.75);
        break;
      case 4:
        // If you found 66% of all letters in 4 player game, it's really good
        _maxPoints = Math.floor(_nbLetters * 0.66);
        break;
      default:
        // In case of error, max points == number of letters to find
        _maxPoints = _nbLetters;
        break;
    }
  }

  return (Math.floor(playerPoints / _maxPoints * 100));
};

/*
* This method will check for the grid, retreive it and parse it. t's the main method of this class.
* @param {Int}      gridNumber    The grid number ID to request to the provider
* @param {Function} callback      The callback to raise either on success or error !
*/
GridManager.prototype.retreiveAndParseGrid = function (gridAddr, callback) {

  console.info('\n\t[GRIDMANAGER] Try to load ' + gridAddr);

  fetch(gridAddr)
    .then((res) => {
      if (res.status !== 200 && res.status !== 302) {
        onGetGridError(callback, 'Wrong statusCode ' + res.status);
      }
      console.info('\t[GRIDMANAGER] Grid downloaded, start parsing...\n');
      return res.text();
    })
    .then((text) => {
      // Parse server response to extract a grid object
      parseGrid(callback, text);

      console.info('\n\t[GRIDMANAGER] Parsing Done. Now play ' + _gridInfos.provider + ' ' +  _gridInfos.id + ' - Level ' +  _gridInfos.level);

      callback(_grid);
    })
    .catch((error) => {
      // Notify error
      onGetGridError(callback, error);
    })
};

/*
* reset the current and load a new one
* @param {Int}      gridNumber    The grid number ID to request to the provider
* @param {Function} callback      The callback to raise either on success or error !
*/
GridManager.prototype.resetGrid = function (gridNumber, callback) {

  // Reset important values
  _grid = null;
  // _theme = null;
  // _wordsPoints = null;
  _nbLetters = _maxPoints = 0;
  _gridInfos.id = 0;
  _gridInfos.level = 0;
  _gridInfos.nbWords = 0;

  // Load the grid
  this.retreiveAndParseGrid(gridNumber, callback);
};

module.exports = GridManager;
