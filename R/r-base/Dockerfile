# Dockerfile for the GeMTC Patavi worker
FROM addis/patavi-worker-base

USER root

RUN DEBIAN_FRONTEND=noninteractive apt-get update
RUN DEBIAN_FRONTEND=noninteractive apt-get install -y -q r-api-3 r-cran-coda
RUN DEBIAN_FRONTEND=noninteractive apt-get install -y -q r-cran-rjags
RUN DEBIAN_FRONTEND=noninteractive apt-get install -y -q r-cran-xml

RUN DEBIAN_FRONTEND=noninteractive apt-get install -y -q build-essential libcurl4-gnutls-dev libxml2-dev libssl-dev

RUN R -e 'install.packages("plyr", repos="http://cran.rstudio.com/"); if (!require("plyr")) quit(save="no", status=8)'
RUN R -e 'install.packages("igraph", repos="http://cran.rstudio.com/"); if (!require("igraph")) quit(save="no", status=8)'
# Up-to-date meta package requires R >= 3.5.0
RUN R -e 'install.packages("https://cran.r-project.org/src/contrib/Archive/meta/meta_3.8-0.tar.gz", repos=NULL, type="source"); if (!require("meta")) quit(save="no", status=8)'
RUN R -e 'install.packages("base64enc", repos="http://cran.rstudio.com/"); if (!require("meta")) quit(save="no", status=8)'
RUN R -e 'install.packages("truncnorm", repos="http://cran.rstudio.com/"); if (!require("truncnorm")) quit(save="no", status=8)'

RUN DEBIAN_FRONTEND=noninteractive apt-get install -y -q r-cran-rglpk

# RUN R -e 'install.packages("gemtc", repos="http://cran.rstudio.com/"); if (!require("gemtc")) quit(save="no", status=8)'
COPY gemtc_0.8-3.tar.gz gemtc_0.8.tar.gz
RUN R -e 'install.packages("gemtc_0.8.tar.gz", repos=NULL, type="source"); if (!require("gemtc")) quit(save="no", status=8)'

