'use strict';

const https = require('https');

const API_KEY = process.argv[2] ? process.argv[2] : 'YOUR_KEY_HERE';
const HOST = 'https://itch.io/';
const API_KEY_REQUEST_URL = 'https://itch.io/user/settings/api-keys';

process.argv.forEach(function (val, index, array) {
  console.log(index + ': ' + val);
});

if (API_KEY === 'YOUR_KEY_HERE') {
  console.log(
    `ERROR: MISSING API KEY
    It looks like you forgot to set an API key. Please visit ${API_KEY_REQUEST_URL} to request a key and paste it into the API_KEY declaration on line 3 of app.js.`
  );
} else {
  const options = {
    host: 'itch.io',
    path: `/api/1/${API_KEY}/my-games`
  };

  console.log(options['host'], options['path']);

  let callback = function(response) {
    // Continuously update stream with data
    let body = '';
    response.on('data', (data) => body += data);
    response.on('end', () => console.log(JSON.parse(body)));
    response.on('error', (e) => console.error(e));
  };

  https.get(options, callback).end();
}
