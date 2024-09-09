const net = require("net");

// Create an HTTP server that listens on port 4221 on localhost.
// When a new socket is created, listen for data to be sent to the socket.
const server = net.createServer(socket => {
  // When data is sent to the socket, read the request line and extract the path.
  socket.on("data", data => {
    const request = data.toString().split("\r\n");
    const requestedPath = request[0]?.split(" ")[1];
    const userAgent = request.find(line => line.startsWith("User-Agent: "))?.split(": ")[1];
    let length;
    if (userAgent) {
      length = Buffer.byteLength(userAgent);
    }
    // If the requested path is "/user-agent", respond with a 200 OK status,
    // a Content-Type header set to text/plain, a Content-Length header set
    // to the length of the given string, and a response body set to the given string.
    if (requestedPath === "/user-agent" && length) {
      socket.write(`HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${length}\r\n\r\n${userAgent}`);
    }
    // If the requested path is "/echo", respond with a 200 OK status,
    // a Content-Type header set to text/plain, a Content-Length header set
    // to the length of the given string, and a response body set to the given string.
    else if (requestedPath?.startsWith("/echo/")) {
      const word = requestedPath.split("/")[2];
      if (word) {
        socket.write(`HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${word.length}\r\n\r\n${word}`);
      } else {
        socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
      }
    } else if (requestedPath === "/") {
      socket.write("HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: 0\r\n\r\n");
    }
    // Otherwise, respond with a 404 Not Found status.
    else {
      socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
    }
    // Close the socket.
    socket.end();
  });
});
server.listen(4221, "localhost");