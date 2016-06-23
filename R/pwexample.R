# Test of the pair-wise functionality.
# Initially showed that the study effects could be reversed in direction
source('gemtc.R')
update <- print
params <- fromJSON('pwexample.json')
out <- gemtc(params)
svg <- substr(out$studyForestPlot, start=27, stop=nchar(out$studyForestPlot))
writeBin(base64decode(svg), "plot.svg")
