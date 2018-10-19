docker run -d --link my-rabbit:rabbit -e PATAVI_BROKER_HOST=rabbit \
  --name patavi-gemtc-worker addis/patavi-gemtc-worker
