var dns = require('native-dns');
var net = require('net');

if (!process.argv[2]) {
  console.error('must pass name of service to be looked up as command line argument');
  process.exit(-1);
}

// if a DNS container is linked use it
if (process.env.DNS_PORT_53_UDP_ADDR) {
  var server = createProxy(
    process.env.DNS_PORT_53_UDP_ADDR,
    process.env.DNS_PORT_53_UDP_PORT,
    process.env.DNS_PORT_53_UDP_PROTO
  );
  server.listen(3000, function() {
    console.log('ready');
  });
} else { // otherwise, use container-wide dns
  dns.platform.on('ready', function() {
    if (!dns.platform.name_servers.length) {
      console.error('no DNS servers are configured');
      process.exit(-1);
    } else {
      var server = createProxy(
        dns.platform.name_servers[0].address,
        dns.platform.name_servers[0].port,
        'udp'
      );
      server.listen(3000, function() {
        console.log('ready');
      });
    }
  });
}

function createProxy(dns_addr, dns_port, dns_type) {

  // listen for TCP connection
  return net.createServer(function(socket) {

    // request service lookup
    var question = dns.Question({
      name: process.argv[2],
      type: 'SRV',
    });

    // make request to linked DNS server
    console.log(dns_addr);
    console.log(dns_port);
    console.log(dns_type);
    var req = dns.Request({
      question: question,
      server: {
        address: dns_addr,
        port: dns_port,
        type: dns_type
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
        console.log('Could not locate service: ' + process.argv[2]);
        socket.end();
        return;
      }

      // ignore weights for now
      var host = answer[0].target;
      var port = answer[0].port;
      var ttl = answer[0].ttl;
      var priority = answer[0].priority;
      var weight = answer[0].weight;

      // log the match
      console.log(process.argv[2] + ' => ' + answer[0].target + ':' + answer[0].port);

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
}
