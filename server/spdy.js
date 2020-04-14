const spdy = require('spdy');
const express = require('express');
const fs = require('fs');
const path = require('path');
const compression = require('compression');

const ssl = {
  key: fs.readFileSync(path.resolve(__dirname, '..', 'localhost.key')),
  cert: fs.readFileSync(path.resolve(__dirname, '..', 'localhost.crt')),
};

const port = 8083;

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

const app = express();
app.use(compression());

app.use('/post', (req, res) => {
  res.writeHead(200);

  res.write(req.body.amount + 2);


  res.end();
});

app.use((req, res) => {
  console.log('received request: ', req.url);
  res.writeHead(200);

  res.write(`

  `);

  const stream = res.push('/static/main.js', {
    status: 200, // optional
    method: 'GET', // optional
    request: {
      accept: '*/*'
    },
    response: {
      'content-type': 'application/javascript'
    }
  });
  stream.on('error', function() {
  });

  setTimeout(() => {
    stream.end('alert("hello from push stream!");');
  }, 3000);


  res.end('<script src="/static/main.js"></script>');
});

var server = spdy.createServer(options, app);

server.listen(port, (err) => {
  if (err) {
    console.error(err);
  } else {
    console.log(`server running on port: ${port}`);
  }
});
