# Not ready for inclusion in R package:
#  - only works for arm-based data
#  - computes continuity corrections even if not necessary
#  - t1 and t2 must be in alphabetical order
pwforest <- function(result, t1, t2, ...) {
  model <- result$model
  network <- model$network

  studies <- gemtc:::mtc.studies.list(network)$values
  studies <- studies[sapply(studies, function(study) {
    t1 %in% gemtc:::mtc.study.design(network, study) &&
      t2 %in% gemtc:::mtc.study.design(network, study)
  })]


  data <- network$data.ab
  columns <- ll.call("required.columns.ab", model)
  study.effect <- lapply(studies, function(study) {
    ll.call('mtc.rel.mle', model, as.matrix(data[data$study == study & (data$treatment == t1 | data$treatment == t2), columns]), correction.force=FALSE, correction.type="reciprocal", correction.magnitude=0.1)
  })

  pooled.effect <- summary(relative.effect(result, t1=t1, t2=t2))$summaries$statistics[1,1:2]

  m <- c(sapply(study.effect, function(x) { x['mean'] }), pooled.effect['Mean'])
  e <- c(sapply(study.effect, function(x) { x['sd'] }), pooled.effect['SD'])

  fdata <- data.frame(
    id=c(studies, "Pooled"),
    style=c(rep("normal", length(studies)), "pooled"),
    pe=m,
    ci.l=m - 1.96*e,
    ci.u=m + 1.96*e)

  log.scale <- ll.call("scale.log", model)

  # auto-scale xlim 
  xlim <- pooled.effect['Mean'] + c(-20, 20) * pooled.effect['SD']
  xlim <- c(max(xlim[1], min(fdata$ci.l)), min(xlim[2], max(fdata$ci.u)))
  xlim <- c(min(gemtc:::nice.value(xlim[1], floor, log.scale), 0), max(gemtc:::nice.value(xlim[2], ceiling, log.scale), 0))

  blobbogram(fdata, ci.label=paste(ll.call("scale.name", model), "(95% CrI)"),
    log.scale=log.scale, xlim=xlim, ...)
}

## Example:
# library(gemtc)
# source('ll.binom.log.R')
# source('pwforest.R')
# 
# network <- read.mtc.network(system.file('extdata/luades-smoking.gemtc', package='gemtc'))
# model <- mtc.model(network, likelihood="binom", link="log")
# result <- mtc.run(model)
# pwforest(result, 'A', 'C')
