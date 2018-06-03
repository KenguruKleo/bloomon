const net = require('net');
const Conveyor = require('./conveyor');

function worker({ host = '0.0.0.0', port = 8000 }) {
  const server = net.createServer(socket => {
    console.log('New connection!');

    const conveyor = new Conveyor();

    conveyor.on(data => {
      socket.write(data);
    });

    socket.on('data', data => {
      conveyor.enter(data);
    });

    // close connection
    socket.on('end', () => {
      console.log('Connection end.');
    });
    socket.on('timeout', () => {
      console.log('Connection timed out');
    });
    socket.on('close', hadError => {
      console.log('Connection closed', hadError ? 'because of a conn. error' : 'by client');
    });
  });

  server.listen(port, host);
  console.log(`Listen connection on host: ${host}, port: ${port}`);
}

module.exports = worker;

if (!module.parent) {
  worker({
    host: process.argv[2],
    port: process.argv[3],
  });
}
