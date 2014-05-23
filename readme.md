## Ambassador

Ambassador can be used as a "jumper" to connect remote services within a cluster that have dynmically changing hosts/ports. It assumes services are registering their host and port with an available DNS service using SRV records.

For example, you might have a mongodb container running somewhere in your cluster. It registers its own host and port to a DNS service under an SRV entry such as `_mongodb._tcp.domain.local` when it starts/restarts. 

### As a sidekick container

Say you have an `api-server` that wants to talk to `_mongodb._tcp.domain.local`. You can link this API server to mongodb using a sidekick:

    docker run -d -name dns-server jkingyens/helixdns
    docker run -d -link dns-server:dns -name db-amb jkingyens/ambassador _mongodb._tcp.domain.local
    docker run -d -link db-amb:db api-server

HelixDNS provides a DNS service on top of `etcd`. If you already have DNS service at a particular <ip:port>, then:

    docker run -d -dns <ip:port> -name db-amb jkingyens/ambassador _mongodb._tcp.domain.local
    docker run -d -link db-amb:db api-server

In either case, `api-server` only needs to be concerned with connecting to the jumper defined by the enviornment variables:

    DB_PORT_3000_TCP_ADDR
    DB_PORT_3000_TCP_PORT
    
Ambassador takes care of ensuring this socket connection routes to wherever `_mongodb._tcp.domain.local` is running. `api-server` should be designed to handle network failures. This way, if your monogdb instance is scheduled onto a different host or port, the ambassador should properly route traffic to its new location when `api-server` attempts to reconnect.

### As a node module

You can use the ambassador directly as a node.js module if you want to build this dynmically linking behaviour into your application. You define the name of the service (as advertised in your DNS) and a local port you want to talk to the service on:

    var amb = require('amb-dns');
    amb(3000, '_mongodb._tcp.required.local', function (err) {
      // mongo is now available at localhost:3000
    });
