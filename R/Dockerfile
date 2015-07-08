FROM gemtc/r-base

ADD gemtc.R /var/lib/patavi/gemtc.R
ADD ll.binom.log.R /var/lib/patavi/ll.binom.log.R

USER patavi
ENV HOME /var/lib/patavi
ENTRYPOINT ["/var/lib/patavi/bin/patavi-worker", "--method", "gemtc", "-n", "1", "--file", "/var/lib/patavi/gemtc.R", "--rserve", "--packages", "gemtc,rjags"]
