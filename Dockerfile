FROM ubuntu
MAINTAINER jeff.kingyens@gmail.com
RUN apt-get update
RUN apt-get install -y python-software-properties python g++ make
RUN add-apt-repository -y ppa:chris-lea/node.js
RUN echo "deb http://archive.ubuntu.com/ubuntu precise universe" >> /etc/apt/sources.list
RUN apt-get update
RUN apt-get -y install nodejs
ADD package.json /work/
RUN cd work && npm install
ADD . /work
ENV NODE_ENV production
EXPOSE 3000
ENTRYPOINT ["/usr/bin/node", "/work/index.js"]
