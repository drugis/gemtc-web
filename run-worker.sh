docker build --tag gemtc/r-base-amqp R/r-base
docker build --tag patavi/gemtc R 
docker rm -f amqp-gemtc || true
docker run -d --link my-rabbit:rabbit -e PATAVI_BROKER_HOST=rabbit  --name amqp-gemtc patavi/gemtc
