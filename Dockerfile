FROM phusion/baseimage

RUN echo deb http://archive.ubuntu.com/ubuntu precise universe >> /etc/apt/sources.list
RUN apt-get update && apt-get clean
RUN apt-get update && apt-get install -y wget git curl zip

## Special node repo to install non-ubuntu nodejs that includes npm
RUN wget -q -O- "https://chrislea.com/gpgkey.txt" | apt-key add -
RUN echo "deb http://ppa.launchpad.net/chris-lea/node.js/ubuntu saucy main" > /etc/apt/sources.list.d/chris-lea-node_js-saucy.list
RUN apt-key adv --keyserver keyserver.ubuntu.com --recv-keys B9316A7BC7917B12

RUN DEBIAN_FRONTEND=noninteractive apt-get update && apt-get clean
RUN DEBIAN_FRONTEND=noninteractive apt-get install -y -q nodejs

RUN npm install -g bower

COPY . /

RUN npm install
RUN bower install --allow-root

EXPOSE 3000

CMD ["node", "/gemtc.js"]
