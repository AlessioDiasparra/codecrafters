const net = require("net");
// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("HTTP/1.1 200 OK\\r\\n\\r\\n");

// Create an HTTP server that listens on port 4221 on localhost.
// It will send a 200 OK response to each incoming request and close the connection.
// This is a very basic server that does not handle any requests other than the initial connection.
// Create a TCP server that listens on port 4221 on localhost.
// When a new socket is created, listen for data to be sent to the socket.
const server = net.createServer(socket => {
  // When data is sent to the socket, read the request line and extract the path.
  socket.on('data', (data) => {
    const request = data.toString();
    if (request.startsWith('GET / ')) {
      
        const httpResponse = 'HTTP/1.1 200 OK\r\n\r\n';
        socket.write(httpResponse);
    } else {
      const httpResponse = 'HTTP/1.1 404 NOT FOUND\r\n\r\n';
        socket.write(httpResponse);
    }
    socket.end();
});
});
// Start listening on port 4221 on localhost.


