# Dockerfile for the GeMTC Patavi worker
FROM addis/patavi-worker-base

USER root

RUN add-apt-repository ppa:c2d4u.team/c2d4u4.0+
RUN DEBIAN_FRONTEND=noninteractive apt-get update
RUN R -e 'install.packages("plyr", repos="http://cran.rstudio.com/"); if (!require("plyr")) quit(save="no", status=8)'
RUN R -e 'install.packages("coda", repos="http://cran.rstudio.com/"); if (!require("coda")) quit(save="no", status=8)'

RUN DEBIAN_FRONTEND=noninteractive apt-get install -y -q jags
RUN R -e 'install.packages("rjags", repos="http://cran.rstudio.com/"); if (!require("rjags")) quit(save="no", status=8)'

RUN DEBIAN_FRONTEND=noninteractive apt-get install -y -q libxml2-dev
RUN R -e 'install.packages("xml2", repos="http://cran.rstudio.com/"); if (!require("xml2")) quit(save="no", status=8)'

RUN DEBIAN_FRONTEND=noninteractive apt-get install -y -q build-essential libcurl4-gnutls-dev libssl-dev

RUN R -e 'install.packages("igraph", repos="http://cran.rstudio.com/"); if (!require("igraph")) quit(save="no", status=8)'
RUN R -e 'install.packages("meta", repos="http://cran.rstudio.com/"); if (!require("meta")) quit(save="no", status=8)'
RUN R -e 'install.packages("base64enc", repos="http://cran.rstudio.com/"); if (!require("base64enc")) quit(save="no", status=8)'
RUN R -e 'install.packages("truncnorm", repos="http://cran.rstudio.com/"); if (!require("truncnorm")) quit(save="no", status=8)'

RUN DEBIAN_FRONTEND=noninteractive apt-get install -y -q libglpk-dev
RUN R -e 'install.packages("Rglpk", repos="http://cran.rstudio.com/"); if (!require("Rglpk")) quit(save="no", status=8)'
RUN R -e 'install.packages("forcats", repos="http://cran.rstudio.com/"); if (!require("forcats")) quit(save="no", status=8)'

# RUN R -e 'install.packages("gemtc", repos="http://cran.rstudio.com/"); if (!require("gemtc")) quit(save="no", status=8)'
COPY gemtc_1.0-2.tar.gz gemtc_1.0_2.tar.gz
RUN R -e 'install.packages("gemtc_1.0_2.tar.gz", repos=NULL, type="source"); if (!require("gemtc")) quit(save="no", status=8)'

