const http2 = require('http2');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');

const {
  HTTP2_HEADER_PATH,
  HTTP_STATUS_NOT_FOUND,
  HTTP_STATUS_INTERNAL_SERVER_ERROR
} = http2.constants;

const PORT = 8080;

const server = http2.createSecureServer({
  key: fs.readFileSync(path.resolve(__dirname, '..', 'localhost.key')),
  cert: fs.readFileSync(path.resolve(__dirname, '..', 'localhost.crt')),
});

server.on('error', (err) => console.error(err));

const respondToStreamError = (err, stream) => {
  console.log(err);
  if (err.code === 'ENOENT') {
    stream.respond({ ":status": HTTP_STATUS_NOT_FOUND });
  } else {
    stream.respond({ ":status": HTTP_STATUS_INTERNAL_SERVER_ERROR });
  }
  stream.end();
};

const rootDir = path.resolve(__dirname, '..');
const buildDir = path.resolve(rootDir, 'public');

const handlePublicFile = (stream, reqPath) => {
  let type = reqPath.startsWith('/static') ? 'static' : 'public';
  let fullPath = path.join(buildDir, reqPath);

  const stats = fs.lstatSync(fullPath);

  if (!fs.existsSync(fullPath) || !stats.isFile() || stats.isDirectory()) {
    fullPath = path.resolve(buildDir, 'index.html');
    type = 'public:index';
  }

  console.log(type, fullPath);
  const responseMimeType = mime.lookup(fullPath);

  return stream.respondWithFile(fullPath, {
    'content-type': responseMimeType,
    'Cache-Control': 'public, max-age=31557600',
  }, {
    onError: (err) => respondToStreamError(err, stream)
  });
};

server.on('stream', (stream, headers) => {
  const reqPath = headers[HTTP2_HEADER_PATH].split('?')[0];

  return handlePublicFile(stream, reqPath);
});

server.listen(PORT, (err) => {
  if (err) {
    console.error(err);
  } else {
    console.log(`server running on port: ${PORT}`);
  }
});
