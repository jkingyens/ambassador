A docker container that acts as a bridge between instance-level app containers and services across hosts.

example:

    docker run -d -name dns-server jkingyens/helixdns
    docker run -d -link dns-server:dns -name db-amb jkingyens/ambassador _servicename._serviceproto.required.local
    docker run -d -link db-amb:db apiserver
    
apiserver will then container environment variables via link:

* DB_PORT_3000_TCP_ADDR
* DB_PORT_3000_TCP_PORT

apiserver container can then use this to connect to service that exists somewhere in the cluster.
