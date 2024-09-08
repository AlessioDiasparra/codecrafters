const net = require("net");
// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("HTTP/1.1 200 OK\\r\\n\\r\\n");

// TODO: Uncomment this to pass the first stage
// Create an HTTP server that listens on port 4221 on localhost.
// It will send a 200 OK response to each incoming request and close the connection.
// This is a very basic server that does not handle any requests other than the initial connection.
const server = net.createServer(socket => {
  // When a new client connects, send a 200 OK response and close the connection.
  socket.write("HTTP/1.1 200 OK\\r\\n\\r\\n");
  var data = "";
  socket.on("data", function (dataChunk) {
    data += dataChunk;
    socket.on("end", function () {
      var arrayData = data.split("");
      const requestedpath = arrayData[1];
      const Requesturl = requestedpath.split(" ");
      console.log(requestedpath);
      console.log(server.address());
      console.log(server.address().port);
      console.log(requestedpath.startsWith("/unknown/"));
      if (requestedpath.startsWith("/unknown/")) {
        socket.write("HTTP/1.1 404 Not Found\\r\\n\\r\\n");
      } else {
        socket.write("HTTP/1.1 200 OK\\r\\n\\r\\n");
      }
    });
    // When the client closes the connection, close the server.

    socket.on("close", () => {
       //server.close();
    });
  });
});
server.listen(4221, "localhost");
