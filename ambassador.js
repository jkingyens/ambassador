var dns = require('native-dns');
var net = require('net');

module.exports = function (listenPort, serviceName, cb) {

  // if a DNS container is linked use it
  if (process.env.DNS_PORT_53_UDP_ADDR) {

    var server = createProxy(
      process.env.DNS_PORT_53_UDP_ADDR,
      process.env.DNS_PORT_53_UDP_PORT,
      process.env.DNS_PORT_53_UDP_PROTO
    );
    server.listen(listenPort, function() {
      cb();
    });

  } else {

    // otherwise, use container-wide dns
    dns.platform.on('ready', function() {
      if (!dns.platform.name_servers.length) {
        return cb(new Error('no DNS servers are configured'));
      }
      var server = createProxy(
        dns.platform.name_servers[0].address,
        dns.platform.name_servers[0].port,
        'udp'
      );
      server.listen(listenPort, function() {
        cb();
      });
    });

  }

  function createProxy(dns_addr, dns_port, dns_type) {

    // listen for TCP connection
    return net.createServer(function(socket) {

      // request service lookup
      var question = dns.Question({
        name: serviceName,
        type: 'SRV',
      });

      // make request to linked DNS server
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
          console.log('Could not locate service: ' + serviceName);
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
        console.log(serviceName + ' => ' + answer[0].target + ':' + answer[0].port);

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

}
