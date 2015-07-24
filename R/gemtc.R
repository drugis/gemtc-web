library(RJSONIO)
library(gemtc)
library(base64enc)

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


# Stolen from mcda-web, ensures the row-names of a matrix are preserved
wrap.matrix <- function(m) {
  l <- lapply(rownames(m), function(name) { m[name,] })
  names(l) <- rownames(m)
  l
}

close.PataviJagsPB <- function(pb) {}

readFile <- function(fileName) {
  readChar(fileName, file.info(fileName)$size)
}

plotToSvg <- function(plotFn) {
  prefix <- tempfile()
  svgName <- paste(prefix, '-%05d.svg', sep='')
  svg(svgName)
  plotFn()
  dev.off()

  # read & delete plot files
  filenames <- grep(paste0("^", prefix), dir(tempdir(), full.names=TRUE), value=TRUE)
  lapply (filenames, function(filename) {
    contents <- readFile(filename)
    file.remove(filename)
    contents
  })
}

plotToPng <- function(plotFn) {
  prefix <- tempfile()
  pngName <- paste(prefix, '-%05d.png', sep='')
  png(pngName)
  plotFn()
  dev.off()

  # read & delete plot files
  filenames <- grep(paste0("^", prefix), dir(tempdir(), full.names=TRUE), value=TRUE)
  lapply (filenames, function(filename) {
    contents <- paste0("data:image/png;base64,", base64encode(filename))
    file.remove(filename)
    contents
  })
}

gemtc <- function(params) {
  iter.adapt <- params[['burnInIterations']]
  iter.infer <- params[['inferenceIterations']]
  thin <- params[['thinningFactor']]
  progress.start <- 0
  progress.jags <- 80

  jagsProgress <- function(iter) {
    update(list(progress=progress.start + (iter / (iter.adapt + iter.infer)) * progress.jags))
  }

  # changed from jags.object.R in rjags 3.13
  update.jags <- function(object, n.iter = 1, by, ...)
  {
    if (!is.numeric(n.iter) || n.iter < 1) {
      stop("Invalid n.iter")
    }

    adapting <- .Call("is_adapting", object$ptr(), PACKAGE="rjags")
    on.exit(object$sync())

    ## Set refresh frequency for progress bar
    if (missing(by) || by <= 0) {
      ##In JAGS 3.x.y there is a memory reallocation bug when
      ##monitoring that slows down updates. Drop refresh
      ##frequency to avoid triggering memory reallocations.
      ##by <- min(ceiling(n.iter/50), 100)
      by <- ceiling(n.iter/50)
    }
    else {
      by <- ceiling(by)
    }

    ## Do updates
    n <- n.iter
    while (n > 0) {
      .Call("update", object$ptr(), min(n,by), PACKAGE="rjags")
      jagsProgress(object$iter())
      n <- n - by
    }

    invisible(NULL)
  }
  assignInNamespace("update.jags", update.jags, "rjags")

  ## incoming information
  #  entries
  data.ab <- do.call(rbind, lapply(params[['entries']],
    function(x) { as.data.frame(x, stringsAsFactors=FALSE) }))
  # linear model or fixed?
  linearModel <- if(is.null(params[['linearModel']])) 'random' else params[['linearModel']]

  treatments <- do.call(rbind, lapply(params[['treatments']],
    function(x) { data.frame(id=x[['id']], description=x[['name']], stringsAsFactors=FALSE) }))

  network <- mtc.network(data.ab=data.ab, treatments=treatments)
  model <- mtc.model(network, linearModel=linearModel)
  update(list(progress=0))
  result <- mtc.run(model, n.adapt=iter.adapt, n.iter=iter.infer, thin=thin)

  treatmentIds <- as.character(network[['treatments']][['id']])
  comps <- combn(treatmentIds, 2)
  t1 <- comps[1,]
  t2 <- comps[2,]
  releffect <- apply(comps, 2, function(comp) {
    q <- summary(relative.effect(result, comp[1], comp[2], preserve.extra=FALSE))[['summaries']][['quantiles']]
    update(list(progress=80 + which(comps[1,] == comp[1] & comps[2,] == comp[2]) / ncol(comps) * 5))
    list(t1=comp[1], t2=comp[2], quantiles=q)
  })


  #create forest plot files for network analyses
  if(params[['modelType']][['type']] == "network") {
    forestPlots <- lapply(treatmentIds, function(treatmentId) {
      plotToSvg(function() {
        treatmentN <- which(treatmentIds == treatmentId)
        progress <- 85 + treatmentN * 10 / length(treatmentIds)
        update(list(progress=progress))
        forest(relative.effect(result, treatmentId), use.description=TRUE)
      })
    })
    names(forestPlots) <- treatmentIds
  }

  # create forest plot for pairwise analysis
  if(params[['modelType']][['type']] == "pairwise") {
    forestPlot <- plotToSvg(function() {
      pwforest(result, t1, t2)
    })
  }

  #create results plot
  tracePlot <- plotToPng(function() {
    plot(result, auto.layout=FALSE)
  })

  #create gelman plot
  gelmanPlot <- plotToPng(function() {
    gelman.plot(result, auto.layout=FALSE, ask=FALSE)
  })


  update(list(progress=95))

  summary <- summary(result)
  summary[['summaries']][['statistics']] <- wrap.matrix(summary[['summaries']][['statistics']])
  summary[['summaries']][['quantiles']] <- wrap.matrix(summary[['summaries']][['quantiles']])
  summary[['logScale']] <- ll.call('scale.log', model)
  summary[['link']] <- model[['link']]
  summary[['likelihood']] <- model[['likelihood']]
  summary[['type']] <- model[['type']]
  summary[['linearModel']] <- model[['linearModel']]
  summary[['burnInIterations']] <- params[['burnInIterations']]
  summary[['inferenceIterations']] <- params[['inferenceIterations']]
  summary[['thinningFactor']] <- params[['thinningFactor']]
  summary[['relativeEffects']] <- releffect
  summary[['rankProbabilities']] <- wrap.matrix(rank.probability(result))
  summary[['alternatives']] <- names(summary[['rankProbabilities']])
  if(params[['modelType']][['type']] == "network") {
    summary[['relativeEffectPlots']] <- forestPlots
  }
  if(params[['modelType']][['type']] == "pairwise") {
    summary[['studyForestPlot']] <- forestPlot
  }
  summary[['tracePlot']] <- tracePlot
  summary[['gelmanPlot']] <- gelmanPlot
  summary[['gelmanDiagnostics']] <- wrap.matrix(gelman.diag(result, multivariate=FALSE)[['psrf']])

  update(list(progress=100))
  summary
}
