'use strict';

const https = require('https');

const API_KEY = process.argv[2] ? process.argv[2] : 'YOUR_KEY_HERE';
const HOST = 'itch.io';
const PATH = `/api/1/${API_KEY}/my-games`;
const API_KEY_REQUEST_URL = 'https://itch.io/user/settings/api-keys';

let games = [];

process.argv.forEach(function (val, index, array) {
  console.log(index + ': ' + val);
});

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

  https.get({host: HOST, path: PATH}, callback).end();
}

let update = (body) => {
  body = JSON.parse(body);
  console.log(typeof body);
  console.log(Object.keys(body));
  console.log(body['games'][0]);

  body['games'].forEach(game => {
    let {id, title, views_count, downloads_count, purchases_count} = game;
    games.push({id, title, views_count, downloads_count, purchases_count})
  });

  console.log("GAMES", games);
}

request();
