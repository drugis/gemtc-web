# Dockerfile for the GeMTC Patavi worker
# You need the patavi/worker-aqmp base image
FROM patavi/worker-amqp

USER root

RUN DEBIAN_FRONTEND=noninteractive apt-get install -y -q r-cran-rjags
RUN DEBIAN_FRONTEND=noninteractive apt-get install -y -q r-cran-xml

RUN R -e 'install.packages("plyr", repos="http://cran.rstudio.com/"); if (!require("plyr")) quit(save="no", status=8)'
RUN R -e 'install.packages("igraph", repos="http://cran.rstudio.com/"); if (!require("igraph")) quit(save="no", status=8)'
RUN R -e 'install.packages("meta", repos="http://cran.rstudio.com/"); if (!require("meta")) quit(save="no", status=8)'
RUN R -e 'install.packages("base64enc", repos="http://cran.rstudio.com/"); if (!require("meta")) quit(save="no", status=8)'
RUN R -e 'install.packages("truncnorm", repos="http://cran.rstudio.com/"); if (!require("truncnorm")) quit(save="no", status=8)'

RUN DEBIAN_FRONTEND=noninteractive apt-get install -y -q r-cran-rglpk

# RUN R -e 'install.packages("gemtc", repos="http://cran.rstudio.com/"); if (!require("gemtc")) quit(save="no", status=8)'
COPY gemtc_0.8.tar.gz gemtc_0.8.tar.gz
RUN R -e 'install.packages("gemtc_0.8.tar.gz", repos=NULL, type="source"); if (!require("gemtc")) quit(save="no", status=8)'

