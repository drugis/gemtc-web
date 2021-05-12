# Dockerfile for the GeMTC Patavi worker
FROM addis/patavi-worker-base

USER root

RUN add-apt-repository ppa:c2d4u.team/c2d4u4.0+
RUN DEBIAN_FRONTEND=noninteractive apt-get update
RUN DEBIAN_FRONTEND=noninteractive apt-get install -y -q r-cran-coda
RUN DEBIAN_FRONTEND=noninteractive apt-get install -y -q r-cran-rjags
RUN DEBIAN_FRONTEND=noninteractive apt-get install -y -q r-cran-xml

RUN DEBIAN_FRONTEND=noninteractive apt-get install -y -q build-essential libcurl4-gnutls-dev libxml2-dev libssl-dev

RUN R -e 'install.packages("plyr", repos="http://cran.rstudio.com/"); if (!require("plyr")) quit(save="no", status=8)'
RUN R -e 'install.packages("igraph", repos="http://cran.rstudio.com/"); if (!require("igraph")) quit(save="no", status=8)'
RUN R -e 'install.packages("meta", repos="http://cran.rstudio.com/"); if (!require("meta")) quit(save="no", status=8)'
RUN R -e 'install.packages("base64enc", repos="http://cran.rstudio.com/"); if (!require("meta")) quit(save="no", status=8)'
RUN R -e 'install.packages("truncnorm", repos="http://cran.rstudio.com/"); if (!require("truncnorm")) quit(save="no", status=8)'

RUN DEBIAN_FRONTEND=noninteractive apt-get install -y -q r-cran-rglpk

RUN R -e 'install.packages("gemtc", repos="http://cran.rstudio.com/"); if (!require("gemtc")) quit(save="no", status=8)'
