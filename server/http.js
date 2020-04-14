const express = require('express');
const path = require('path');

const server = express();

const PORT = 8081;

const rootDir = path.resolve(__dirname, '..');
const buildPath = path.resolve(rootDir, 'public');

server.use(express.static(buildPath));

server.listen(PORT, (err) => {
  if (err) {
    console.error(err);
  } else {
    console.log(`server running on port: ${PORT}`);
  }
});
