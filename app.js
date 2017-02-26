'use strict';

const https = require('https');

const API_KEY = process.argv[2] ? process.argv[2] : 'YOUR_KEY_HERE';
const INTERVAL = process.argv[3] ? process.argv[3] : 60000;
const HOST = 'itch.io';
const PATH = `/api/1/${API_KEY}/my-games`;
const API_KEY_REQUEST_URL = 'https://itch.io/user/settings/api-keys';

let games = [];

// process.argv.forEach(function (val, index, array) {
//   console.log(index + ': ' + val);
// });

if (API_KEY === 'YOUR_KEY_HERE') {
  console.log(
    `ERROR: MISSING API KEY
    It looks like you forgot to set an API key. Please visit ${API_KEY_REQUEST_URL} to request a key and paste it into the API_KEY declaration on line 3 of app.js.`
  );
  process.exit(1);
}

let request = () => {
  let callback = function(response) {
    // Continuously update stream with data
    let body = '';
    response.on('data', (data) => body += data);
    response.on('end', () => update(body));
    response.on('error', (e) => console.error(e));
  };

  https.get({host: HOST, path: PATH}, callback);
};

let update = (body) => {
  let newGames = [];
  body = JSON.parse(body);

  body['games'].forEach(game => {
    let {id, title, views_count, downloads_count, purchases_count} = game;
    newGames.push({id, title, views_count, downloads_count, purchases_count});
  });

  if (games.length < 1) {
    newGames.forEach(game => {
      game.lastUpdated = new Date();
      games.push(game);
    });
  }

  compareResults(newGames);
  // console.log("GAMES", games);
};

let compareResults = newGames => {
  let updated = false;
  newGames.forEach(newGame => {
    // console.log(newGame);
    let gameFound = false;

    for (let i = 0; i < games.length; i ++) {
      if (games[i]['id'] === newGame['id']) {
        // console.log(newGame['title'], "already exists");
        gameFound = true;
        checkForUpdates(newGame, i, updated);
        break;
      }
    }

    if (!gameFound) games.push(newGame);
  });

  if (!updated) console.log(`[${new Date()}]: No updates found.`)
};

let checkForUpdates = (newGame, i) => {
  // Figure out how to compare what's in games[i] to
  // the new stuff in {newGame} and update anything
  // that's old

  let updated = false;

  if (games[i]['id'] === newGame['id']) {
    let keys = Object.keys(games[i]);
    keys.forEach(key => {
      if (games[i][key] !== newGame[key] && key !== 'lastUpdated') {
        console.log(`[${new Date().toLocaleTimeString()}]: ${newGame['title']}'s ${key} value was updated from ${games[i][key]} to ${newGame[key]}`);
        games[i][key] = newGame[key];
        updated = true;
      }
    });

    if (updated) {
      games[i]['lastUpdated'] = new Date();
    }
  }

  return updated;
};

request();
setInterval(request, INTERVAL);
