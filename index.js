var dns = require('native-dns');
var net = require('net');

// listen for TCP connection
var server = net.createServer(function(socket) {

  // request service lookup
  var question = dns.Question({
    name: process.argv[2],
    type: 'SRV',
  });

  // make request to linked DNS server
  var req = dns.Request({
    question: question,
    server: {
      address: process.env.DNS_PORT_53_UDP_ADDR,
      port: process.env.DNS_PORT_53_UDP_PORT,
      type: process.env.DNS_PORT_53_UDP_PROTO
    },
    timeout: 1000,
    cache: false
  });


  req.on('timeout', function () {
    console.log('Timeout in making request');
  });

  req.on('message', function (err, res) {

    var answer = res.answer;

    // kill connection if we cant find answer
    if (err || !answer.length) {
      socket.end();
      return;
    }

    // ignore weights for now
    var host = answer[0].target;
    var port = answer[0].port;
    var ttl = answer[0].ttl;
    var priority = answer[0].priority;
    var weight = answer[0].weight;

    // connect to remote side
    var client = net.connect({
      port: port,
      host: host
    }, function () {
      socket.pipe(client);
      client.pipe(socket);
    });

  });

  req.send();

});

server.listen(3000, function() {
  console.log('ready');
});
