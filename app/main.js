const net = require('net'); // Importa il modulo 'net' per creare un server TCP
const fs = require('fs');   // Modulo per gestire il file system
const path = require('path'); // Modulo per gestire percorsi di file

// Prendi il flag --directory dalla riga di comando, che specifica la directory da cui servire i file
const args = process.argv;
const directoryFlagIndex = args.indexOf('--directory');
const directory = directoryFlagIndex !== -1 ? args[directoryFlagIndex + 1] : '/tmp';  // Imposta '/tmp' come directory predefinita se non viene passato alcun flag

//console.log(`Serving files from: ${directory}`); // Stampa la directory corrente da cui servire i file

// Funzione per gestire le richieste e le risposte HTTP
const handleRequest = (request, socket) => {
  // Dividi la richiesta HTTP in linee
  const [requestLine, ...headerLines] = request.split("\r\n");
  const [method, url] = requestLine.split(" "); // Ottieni il metodo (GET) e l'URL dalla prima riga

  // Crea un oggetto headers da tutte le linee degli header
  const headers = headerLines.reduce((acc, line) => {
    const [key, value] = line.split(": ");
    if (key && value) acc[key.toLowerCase()] = value; // Mappa gli headers con lettere minuscole
    return acc;
  }, {});


    if (method === "GET") {
      // Se l'URL è "/", rispondi con "Hello, World"
      if (url === "/") {
        const response =
          "HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: 12\r\n\r\nHello, World";
        socket.write(response);
        socket.end(); // Chiude la connessione dopo la risposta
      }
      // Se l'URL inizia con "/files/", cerca di restituire un file
      else if (url.startsWith("/files/")) {
        const filename = url.split("/files/")[1]; // Ottieni il nome del file dall'URL
        const filepath = path.join(directory, filename); // Crea il percorso completo del file

        // Verifica se il file esiste
        fs.stat(filepath, (err, stats) => {
          if (err || !stats.isFile()) {
            // Se il file non esiste, rispondi con 404
            const response = "HTTP/1.1 404 Not Found\r\n\r\n";
            socket.write(response);
            socket.end();
            return;
          }

          // Se il file esiste, invia il file con gli headers appropriati
          const fileStream = fs.createReadStream(filepath); // Leggi il file come stream
          const headers = `HTTP/1.1 200 OK\r\nContent-Type: application/octet-stream\r\nContent-Length: ${stats.size}\r\n\r\n`;
          socket.write(headers); // Scrivi gli headers nella risposta
          fileStream.on("data", chunk => socket.write(chunk)); // Invia i dati del file
          fileStream.on("end", () => socket.end()); // Chiudi la connessione quando il file è inviato
        });
      }
      // Gestione dell'endpoint "/user-agent"
      else if (url === "/user-agent") {
        const userAgent = headers["user-agent"] || "unknown"; // Recupera l'header 'User-Agent', o 'unknown' se non esiste
        const responseBody = `${userAgent}`; // Corpo della risposta è il valore di 'User-Agent'
        const response = `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${Buffer.byteLength(
          responseBody
        )}\r\n\r\n${responseBody}`;
        socket.write(response); // Invia la risposta con l'header e il corpo
        socket.end(); // Chiude la connessione
      }
      // Gestione dell'endpoint "/echo/{message}"
      else if (url.startsWith("/echo/")) {
        const message = url.replace("/echo/", ""); // Ottieni il messaggio dall'URL
        const responseBody = message; // Il corpo della risposta è il messaggio
        const response = `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${Buffer.byteLength(
          responseBody
        )}\r\n\r\n${responseBody}`;
        socket.write(response); // Invia la risposta con il messaggio
      }
      // Se nessuna condizione corrisponde, rispondi con 404
      else {
        const response = "HTTP/1.1 404 Not Found\r\n\r\n";
        socket.write(response);
        socket.end();
      }
    }
  
    if (method === "POST") {
      console.log('request :>> ', request);
      if (url.startsWith("/files/")) {
        const filename = url.split("/files/")[1]; // Ottieni il nome del file dall'URL
        const filepath = path.join(directory, filename); // Crea il percorso completo del file
        const file = request.toString("utf-8").split("\r\n\r\n")[1];
        fs.writeFileSync(filepath, file);
        socket.write("HTTP/1.1 201 Created\r\n\r\n");
        socket.end();
      }
    }
    
  
};

// Crea il server usando il modulo 'net'
const server = net.createServer((socket) => {
  // dati inviati dal client (data body)
  socket.on('data', (data) => {
    const request = data.toString(); // Converti i dati del socket in stringa
    handleRequest(request, socket); // Gestisci la richiesta HTTP
  });
});

// Avvia il server sulla porta 4221
const PORT = 4221;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`); // Stampa che il server è attivo
});
