const net = require("net");
const server = net.createServer((socket) => {
  // Every time some data is received from the client, this callback is called
  socket.on('data', (data) => {
    const request = data.toString();
    // If the request starts with "GET / ", respond with a 200 OK response
    if (request.startsWith('GET / ')) {
      const httpResponse = 'HTTP/1.1 200 OK\r\n\r\n';
      socket.write(httpResponse);
    } else {
      // Otherwise, respond with a 404 NOT FOUND response
      const httpResponse = 'HTTP/1.1 404 NOT FOUND\r\n\r\n';
      socket.write(httpResponse);
    }
    // Close the socket (i.e., end the connection)
    socket.end();
  });
});
// Listen for incoming connections on port 4221
server.listen(4221, "localhost", () => {
  // Print a status message to the console
  process.stdout.write("Listening on localhost:4221");
});
