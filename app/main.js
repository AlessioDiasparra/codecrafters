const net = require('net');
const fs = require('fs');
const path = require('path');

// Prendi il flag --directory dalla riga di comando
const args = process.argv;
const directoryFlagIndex = args.indexOf('--directory');
const directory = directoryFlagIndex !== -1 ? args[directoryFlagIndex + 1] : '/tmp';  // Imposta /tmp come directory predefinita

console.log(`Serving files from: ${directory}`);

// Funzione per gestire la richiesta e risposta HTTP
const handleRequest = (request, socket) => {
  const [requestLine, ...headerLines] = request.split('\r\n');
  const [method, url] = requestLine.split(' ');

  // Crea un oggetto per gli headers
  const headers = headerLines.reduce((acc, line) => {
    const [key, value] = line.split(': ');
    if (key && value) acc[key.toLowerCase()] = value;
    return acc;
  }, {});

  if (method === 'GET') {
    if (url === '/') {
      const response = 'HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: 12\r\n\r\nHello, World';
      socket.write(response);
      socket.end();
    } else if (url.startsWith('/files/')) {
      const filename = url.split('/files/')[1];
      const filepath = path.join(directory, filename);

      fs.stat(filepath, (err, stats) => {
        if (err || !stats.isFile()) {
          const response = 'HTTP/1.1 404 Not Found\r\n\r\n';
          socket.write(response);
          socket.end();
          return;
        }

        const fileStream = fs.createReadStream(filepath);
        const headers = `HTTP/1.1 200 OK\r\nContent-Type: application/octet-stream\r\nContent-Length: ${stats.size}\r\n\r\n`;
        socket.write(headers);
        fileStream.on('data', (chunk) => socket.write(chunk));
        fileStream.on('end', () => socket.end());
      });
    } else if (url === '/user-agent') {
      // Restituisci solo il valore dell'header User-Agent
      const userAgent = headers['user-agent'] || 'unknown';
      const responseBody = `${userAgent}`;  // Solo il valore del User-Agent
      const response = `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${Buffer.byteLength(responseBody)}\r\n\r\n${responseBody}`;
      socket.write(response);
      socket.end();
    } else if (method === 'GET' && url.startsWith('/echo/')) {
      const message = url.replace('/echo/', ''); // Estrai il messaggio dall'URL
      const responseBody = message;
      
      // Creazione della risposta HTTP
      const response = `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${Buffer.byteLength(responseBody)}\r\n\r\n${responseBody}`;
      
      socket.write(response);
    } else {
      const response = 'HTTP/1.1 404 Not Found\r\n\r\n';
      socket.write(response);
      socket.end();
    }
  }
};

// Creare il server con il modulo net
const server = net.createServer((socket) => {
  socket.on('data', (data) => {
    const request = data.toString();
    handleRequest(request, socket);
  });
});

// Avvia il server sulla porta 4221
const PORT = 4221;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
