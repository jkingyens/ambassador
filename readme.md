A docker container that acts as a bridge between instance-level app containers and services across hosts.

For example, assume you have a mongodb container running somewhere in your cluster. It needs to register the host and port where the service can be found with your local DNS. It might register itself under `_mongodb._tcp.domain.local`. You can now run this generic sidekick as an ambassador for your mongodb service. Say you had `api-server` that needs to talk this mongodb instance. You would start your `api-server` like so:

    docker run -d -name dns-server jkingyens/helixdns
    docker run -d -link dns-server:dns -name db-amb jkingyens/ambassador _mongodb._tcp.domain.local
    docker run -d -link db-amb:db api-server
    
Now, `api-server` only needs to be concerned with the environment variables exposed via linking:

* DB_PORT_3000_TCP_ADDR
* DB_PORT_3000_TCP_PORT

`api-server` should be designed to handle network failures. This way, if your monogdb instance is scheduled onto a different host or port, the ambassador should properly route traffic to its new location when `api-server` attempts to reconnect.
