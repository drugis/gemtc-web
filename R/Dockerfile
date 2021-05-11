FROM addis/patavi-gemtc-worker-base

ADD gemtc.R /var/lib/patavi/gemtc.R

USER patavi
WORKDIR /var/lib/patavi
ENTRYPOINT ["patavi-worker", "--method", "gemtc", "-n", "4", "--file", "/var/lib/patavi/gemtc.R", "--rserve", "--packages", "gemtc,rjags,base64enc"]
