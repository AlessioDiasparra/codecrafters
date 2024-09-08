const net = require("net");

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("HTTP/1.1 200 OK\r\n\r\n");

 // TODO: Uncomment this to pass the first stage
 const server = net.createServer((socket) => {
    socket.write("HTTP/1.1 200 OK\r\n\r\n");
   // Close the socket when the client closes the connection.
   // This is necessary to prevent the server from hanging.
   socket.on("close", () => {
     socket.end();
     server.close();
   });
 });

 server.listen(4221, "localhost");
