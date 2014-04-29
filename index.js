var dns = require('dns');
var net = require('net');

// listen for TCP connection
var server = net.createServer(function(socket) {

  // lookup host and port from service record
  dns.resolveSrv('_mongodb-production._tcp.required.local', function (err, res) {

    // kill connection if we cant find answer
    if (err || !res.length) {
      socket.end();
      return;
    }

    // debug
    console.log(JSON.stringify(res));

    var host = res[0].host;
    var port = res[0].port;

    // connect to remote side
    var client = net.connect({
      port: port,
      host: host
    }, function () {
      socket.pipe(client);
      client.pipe(socket);
    });

  });

});

server.listen(3000, function() {
  console.log('ready');
});
