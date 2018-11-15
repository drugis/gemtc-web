export EMAIL_ADDRESS=osmosisch@gmail.com
export HOST_NAME=pataviserver.westeurope.cloudapp.azure.com

# Uncomment if you're missing any of this software
# #install certbot
# sudo apt-get update
# sudo apt-get install software-properties-common -y
# sudo add-apt-repository ppa:certbot/certbot -y
# sudo apt-get update
# sudo apt-get install python-certbot-nginx -y

# #install docker-ce
# sudo apt-get install -y \
#     apt-transport-https \
#     ca-certificates \
#     curl \
#     software-properties-common
# curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
# sudo add-apt-repository -y \
#    "deb [arch=amd64] https://download.docker.com/linux/ubuntu \
#    $(lsb_release -cs) \
#    stable"
# sudo apt-get update
# sudo apt-get install docker-ce -y

# #install nginx
# sudo add-apt-repository ppa:nginx/stable -y
# sudo apt-get update
# sudo apt-get install nginx -y

sudo certbot --nginx -n \
  --agree-tos \
  --email $EMAIL_ADDRESS \
  -d $HOST_NAME --redirect --uir --staple-ocsp --must-staple


cat > nginx.conf <<EOF
server {
  listen 80 ;
	listen [::]:80 ;
    server_name $HOST_NAME;
    return 301 https://\$server_name\$request_uri;
}

server {
  gzip on;
	gzip_min_length 1000;
	gzip_proxied any;
	gzip_types text/plain text/css application/json application/javascript application/x-javascript text/xml application/xml application/xml+rss text/javascript;

  server_name $HOST_NAME; # managed by Certbot
  location / {
    proxy_pass http://localhost:3001;
  }

  listen [::]:443 ssl ipv6only=on; # managed by Certbot
  listen 443 ssl; # managed by Certbot
  ssl_certificate /etc/letsencrypt/live/$HOST_NAME/fullchain.pem; # managed by Certbot
  ssl_certificate_key /etc/letsencrypt/live/$HOST_NAME/privkey.pem; # managed by Certbot
  include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
  ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot

  ssl_trusted_certificate /etc/letsencrypt/live/$HOST_NAME/chain.pem; # managed by Certbot
  ssl_stapling on; # managed by Certbot
  ssl_stapling_verify on; # managed by Certbot

}
EOF
sudo cp nginx.conf /etc/nginx/sites-enabled/default
sudo service nginx restart

#postgres
docker run --name postgres -e POSTGRES_PASSWORD=develop -d postgres
sleep 3 # wait for db to spin up

#gemtc
git clone https://github.com/drugis/gemtc-web
cd gemtc-web
git checkout feature/azure
./setup-db.sh

docker run -d \
 --link postgres \
 -p 3001:3001 \
 --name gemtc \
 -e DB_HOST=postgres \
 -e GEMTC_GOOGLE_KEY=100331616436-dgi00c0mjg8tbc06psuhluf9a2lo6c3i.apps.googleusercontent.com \
 -e GEMTC_GOOGLE_SECRET=9ROcvzLDuRbITbqj-m-W5C0I \
 -e GEMTC_COOKIE_SECRET=GDFBDF#$%*asdfg098 \
 -e GEMTC_DB=gemtc \
 -e GEMTC_HOST=https://$HOST_NAME \
 -e GEMTC_DB_USERNAME=gemtc \
 -e GEMTC_DB_PASSWORD=develop \
 -e PATAVI_CLIENT_CRT=ssl/crt.pem \
 -e PATAVI_CLIENT_KEY=ssl/key.pem \
 -e PATAVI_CA=ssl/ca-crt.pem \
 -e PATAVI_HOST=$HOST_NAME \
  addis/gemtc

cd

#rabbit
docker run -d --hostname my-rabbit --name my-rabbit -p 5672:5672 -p 15672:15672 rabbitmq:3-management

#patavi server
git clone https://github.com/drugis/patavi
cd patavi/server/docker
mkdir ssl
cd ssl
curl https://drugis.org/files/ca-crt.pem > ca-crt.pem
sudo cp /etc/letsencrypt/live/$HOST_NAME/privkey.pem server-key.pem
sudo cp /etc/letsencrypt/live/$HOST_NAME/cert.pem server-crt.pem
sudo chmod u+rx *
cd ..
docker build --tag addis/patavi-server .
docker run -d --name patavi-server \
  --link my-rabbit:rabbit \
  --link postgres:postgres \
  -e PATAVI_BROKER_HOST=rabbit \
  -p 3000:3000 \
  -e PATAVI_SELF=//$HOST_NAME:3000 \
  -e PATAVI_PORT=3000 \
  -e PATAVI_DB_HOST=postgres \
  -e PATAVI_DB_NAME=patavi \
  -e PATAVI_DB_USER=patavi \
  -e PATAVI_DB_PASSWORD=develop \
  addis/patavi-server
