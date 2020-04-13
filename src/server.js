const http2 = require('http2');
const fs = require('fs');
const path = require('path');

const PORT = 8081;

const server = http2.createSecureServer({
    key: fs.readFileSync(path.resolve(__dirname, '..', 'localhost.key')),
    cert: fs.readFileSync(path.resolve(__dirname, '..', 'localhost.crt')),
});
server.on('error', (err) => console.error(err));

server.on('stream', (stream, headers) => {
    // stream is a Duplex
    stream.respond({
        'content-type': 'text/html',
        ':status': 200
    });
    stream.end('<h1>Hello World</h1>');
});

server.listen(PORT, (err) => {
    if (err) {
        console.error(err);
    } else {
        console.log(`server running on port: ${PORT}`);
    }
});
