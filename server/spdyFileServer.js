const spdy = require('spdy');
const express = require('express');
const fs = require('fs');
const path = require('path');
const compression = require('compression');

const ssl = {
  key: fs.readFileSync(path.resolve(__dirname, '..', 'localhost.key')),
  cert: fs.readFileSync(path.resolve(__dirname, '..', 'localhost.crt')),
};

const port = 8084;

const rootDir = path.resolve(__dirname, '..');
const buildDir = path.resolve(rootDir, 'public');

var options = {
  key: ssl.key,
  cert: ssl.cert,

  // **optional** SPDY-specific options
  spdy: {
    protocols: [ 'h2', 'spdy/3.1', 'http/1.1' ],
    plain: false,
    'x-forwarded-for': true,
    connection: {
      windowSize: 1024 * 1024, // Server's window size
      autoSpdy31: false
    }
  }
};

const app = express()
  .use(compression())
  .use(express.static(buildDir));

const server = spdy.createServer(options, app);

server.listen(port, (err) => {
  if (err) {
    console.error(err);
  } else {
    console.log(`server running on port: ${port}`);
  }
});
