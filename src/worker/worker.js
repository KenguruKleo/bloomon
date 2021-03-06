const net = require('net');

function worker({ host = '0.0.0.0', port = 8000, verbose = true }, Conveyor) {
  const server = net.createServer(socket => {
    if (verbose) {
      console.log('New connection!');
    }

    const conveyor = new Conveyor();

    // const sendDataToSocket = data => socket.write(data);

    conveyor.on(data => {
      process.nextTick(() => socket.write(data));
      // socket.write(data);
    });

    socket.on('data', data => {
      conveyor.input(data.toString().replace(/\r?\n/, ''));
    });

    // close connection
    socket.on('end', () => {
      if (verbose) {
        console.log('Connection end.');
      }
    });
    socket.on('timeout', () => {
      if (verbose) {
        console.log('Connection timed out');
      }
    });
    socket.on('close', hadError => {
      if (verbose) {
        console.log('Connection closed', hadError ? 'because of a conn. error' : 'by client');
      }
    });
  });

  server.listen(port, host);
  if (verbose) {
    console.log(`Listen connection on host: ${host}, port: ${port}`);
  }
}

module.exports = worker;
