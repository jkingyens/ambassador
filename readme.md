
Ambassador is a docker container for connecting together services in a clustered enviroment.

* single process per coreos instance
* defined in per-instance cloud configuration yaml file
* controllable via an http/rest interface.
* stateless? nope. two options:
  a) back natively by a file/volume?
  b) switch to single node process per tcp proxy (scaling issues)

this proxy is mostly stable.
if it dies, then kill all containers that jump to other hosts.
this is because the memory state will be squashed.
start the ambassador again
once its started,

deployment:

run this container on each instance of your cluster (docker run)
