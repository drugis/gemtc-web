# Dockerfile for the GeMTC Patavi worker
# You need the patavi/worker base image from http://github.com/gertvv/patavi-docker

FROM patavi/worker

RUN DEBIAN_FRONTEND=noninteractive apt-get install -y -q r-cran-rjags
RUN DEBIAN_FRONTEND=noninteractive apt-get install -y -q r-cran-xml

RUN R -e 'install.packages("gemtc", repos="http://cran.rstudio.com/"); if (!require("gemtc")) quit(save="no", status=8)'

ADD gemtc.R /var/lib/patavi/gemtc.R

USER patavi
ENV HOME /var/lib/patavi
ENTRYPOINT ["/var/lib/patavi/bin/patavi-worker", "--method", "gemtc", "-n", "1", "--file", "/var/lib/patavi/gemtc.R", "--rserve", "--packages", "gemtc,rjags"]
