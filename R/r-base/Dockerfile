# Dockerfile for the GeMTC Patavi worker
# You need the patavi/worker base image from http://github.com/gertvv/patavi-docker

FROM patavi/worker

RUN DEBIAN_FRONTEND=noninteractive apt-get install -y -q r-cran-rjags
RUN DEBIAN_FRONTEND=noninteractive apt-get install -y -q r-cran-xml

RUN R -e 'install.packages("Rcpp", repos="http://cran.rstudio.com/"); if (!require("Rcpp")) quit(save="no", status=8)'
RUN curl -o plyr_1.8.1.tar.gz "http://cran.r-project.org/src/contrib/Archive/plyr/plyr_1.8.1.tar.gz"
RUN R -e 'install.packages("plyr_1.8.1.tar.gz", repos=NULL, type="source"); if (!require("plyr")) quit(save="no", status=8)' # plyr > 1.8.1 requires R 3.1.0
RUN R -e 'install.packages("igraph", repos="http://cran.rstudio.com/"); if (!require("igraph")) quit(save="no", status=8)'
RUN R -e 'install.packages("meta", repos="http://cran.rstudio.com/"); if (!require("meta")) quit(save="no", status=8)'
RUN R -e 'install.packages("base64enc", repos="http://cran.rstudio.com/"); if (!require("meta")) quit(save="no", status=8)'

COPY gemtc_0.7.tar.gz gemtc_0.7.tar.gz
RUN R -e 'install.packages("gemtc_0.7.tar.gz", repos=NULL, type="source"); if (!require("gemtc")) quit(save="no", status=8)'