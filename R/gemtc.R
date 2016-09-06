library(RJSONIO)
library(gemtc)
library(base64enc)
library(coda)

files <- NULL

# Workaround for CODA bug
if (!exists("gelman.diag.fix", mode="function")) {
  gelman.diag.old <- coda::gelman.diag
  gelman.diag.fix <- function(x, confidence = 0.95, transform = FALSE, autoburnin = TRUE, multivariate = FALSE) {
    gelman.diag.old(x, confidence, transform, autoburnin, multivariate)
  }
  assignInNamespace("gelman.diag", gelman.diag.fix, "coda")
}

pweffects <- function(result, t1, t2) {
  model <- result$model
  network <- model$network

  alpha <- model$data$alpha

  studies <- gemtc:::mtc.studies.list(network)$values
  studies <- studies[sapply(studies, function(study) {
    t1 %in% gemtc:::mtc.study.design(network, study) &&
    t2 %in% gemtc:::mtc.study.design(network, study) &&
    (is.null(alpha) || alpha[study] > 0)
  })]

  if(length(studies) == 0) {
    return (data.frame())
  }

  data <- network$data.ab
  columns <- ll.call("required.columns.ab", model)
  study.effect <- lapply(studies, function(study) {
    t1.data <- data[data$study == study & data$treatment == t1, columns]
    t2.data <- data[data$study == study & data$treatment == t2, columns]
    est <- ll.call('mtc.rel.mle', model, as.matrix(rbind(t1.data, t2.data)), correction.force=FALSE, correction.type="reciprocal", correction.magnitude=0.1)
    if (is.null(alpha)) {
      est
    } else {
      c(est['mean'], 'sd'=unname(sqrt(1/alpha[study])*est['sd']))
    }
  })

  data.frame(
    study=studies,
    t1=t1,
    t2=t2,
    mean=sapply(study.effect, function(x) { x['mean'] }),
    std.err=sapply(study.effect, function(x) { x['sd'] }))
}

# Not ready for inclusion in R package:
#  - only works for arm-based data
#  - computes continuity corrections even if not necessary
#  - t1 and t2 must be in alphabetical order
pwforest <- function(result, t1, t2, ...) {
  model <- result$model
  network <- model$network

  study.effect <- pweffects(result, t1, t2)

  pooled.effect <- as.matrix(as.mcmc.list(relative.effect(result, t1=t1, t2=t2, preserve.extra=FALSE)))

  pooledMean <- apply(pooled.effect, 2, mean)
  pooledSD <- apply(pooled.effect, 2, sd)
  studies <- study.effect[['study']]
  m <- c(study.effect[['mean']], pooledMean)
  e <- c(study.effect[['std.err']], pooledSD)

  fdata <- data.frame(
    id=c(studies, "Pooled"),
    style=c(rep("normal", length(studies)), "pooled"),
    pe=m,
    ci.l=m - 1.96*e,
    ci.u=m + 1.96*e)

  log.scale <- ll.call("scale.log", model)

  # auto-scale xlim
  xlim <- pooledMean + c(-20, 20) * pooledSD
  xlim <- c(max(xlim[1], min(fdata$ci.l)), min(xlim[2], max(fdata$ci.u)))
  xlim <- c(min(gemtc:::nice.value(xlim[1], floor, log.scale), 0), max(gemtc:::nice.value(xlim[2], ceiling, log.scale), 0))

  blobbogram(fdata, ci.label=paste(ll.call("scale.name", model), "(95% CrI)"),
    log.scale=log.scale, xlim=xlim, ...)
}

plotDeviance <- function(result) {
  model <- result$model
  fit.ab <- if (!is.null(result$deviance$fit.ab)) apply(result$deviance$fit.ab, 1, sum, na.rm=TRUE)
  dev.ab <- if (!is.null(result$deviance$dev.ab)) apply(result$deviance$dev.ab, 1, sum, na.rm=TRUE)
  lev.ab <- dev.ab - fit.ab
  fit.re <- result$deviance$fit.re
  dev.re <- result$deviance$dev.re
  lev.re <- dev.re - fit.re
  nd <- model$data$na
  studies.re <- c(model$data$studies.r2, model$data$studies.rm)
  nd[studies.re] <- nd[studies.re] - 1
  nd <- nd[model$data$studies] # eliminate studies ignored in the likelihood (power-adjusted analyses)
  w <- sqrt(c(dev.ab, dev.re) / nd)
  lev <- c(lev.ab, lev.re) / nd

  plot(w, lev, xlim=c(0, max(c(w, 2.5))), ylim=c(0, max(c(lev, 4))),
   xlab="Square root of residual deviance", ylab="Leverage",
   main="Leverage versus residual deviance")
  mtext("Per-study mean per-datapoint contribution")

  x <- seq(from=0, to=3, by=0.05)
  for (c in 1:4) {
    lines(x, c - x^2)
  }
}

# Stolen from mcda-web, ensures the row-names of a matrix are preserved
wrap.matrix <- function(m) {
  l <- lapply(rownames(m), function(name) {
    row <- m[name,]
    names(row) <- colnames(m)
    row
  })
  names(l) <- rownames(m)
  l
}

wrap.arms <- function(m, network) {
  l <- lapply(rownames(m), function(name) {
    ts <- as.character(network[['data.ab']][['treatment']][network[['data.ab']][['study']] == name])
    vs <- m[name, 1:length(ts)]
    names(vs) <- ts
    vs
  })
  names(l) <- rownames(m)
  l
}

close.PataviJagsPB <- function(pb) {}

readFile <- function(fileName) {
  readChar(fileName, file.info(fileName)$size)
}

plotToFile <- function(plotFunction, dataType, extension, imageCreationFunction) {
  prefix <- tempfile()
  imageName <- paste(prefix, '-%05d', extension, sep='')
  imageCreationFunction(imageName)
  plotFunction()
  dev.off()

  # stage plot files for Patavi
  filenames <- grep(paste0("^", prefix), dir(tempdir(), full.names=TRUE), value=TRUE)
  newFiles <- lapply(filenames, function(filename) {
    list(name=basename(filename), # FIXME?
         file=filename, # FIXME?
         mime=dataType)
  })
  assign("files", c(files, newFiles), envir=parent.env(environment()))

  lapply(filenames, function(filename) {
    list('href'=basename(filename), 'content-type'=dataType)
  })
}

plotToSvg <- function(plotFunction) {
  plotToFile(plotFunction, 'image/svg+xml', '.svg', svg)
}

plotToPng <- function(plotFunction) {
  plotToFile(plotFunction, 'image/png', '.png', png)
}

predict.t <- function(network, n.adapt, n.iter, thin) {
  n <- nrow(network[['treatments']])
  n.randomEffects <- sum(gemtc:::mtc.studies.list(network)$lengths - 1)
  n.stoch <- n.randomEffects + n - 1 + 2 # random effects models only
  n.saved <- n - 1 + 2
  c(
    'sample'=0.032 * n.stoch * 0.001 * (n.adapt + n.iter),
    'releffect'=0.0075 * n * (n - 1) / 2 * 0.001 * n.iter / thin,
    'relplot'=0.0075 * (n - 1) * n * 0.001 * n.iter / thin,
    'forestplot'=0.1,
    'traceplot'=0.062 * n.saved * 0.001 * n.iter / thin,
    'psrfplot'=(0.04 + 0.007 * n.saved) * 0.001 * n.iter / thin,
    'nodeSplitDensityPlot'=1, # FIXME
    'deviancePlot'=1, #FIXME
    'covariateEffectPlot'=1, #FIXME
    'summary'=0.0075 * n.saved * 0.001 * n.iter / thin
  )
}

nsdensity <- function(x) {
  par(mfrow=c(2,1))
  vars <- c('d.direct','d.indirect')
  ns <- x[['samples']][,vars]
  densities <- lapply(vars, function(var) {
    x <- as.matrix(ns[,var])
    bw <- 1.06 * min(sd(x), IQR(x)/1.34) * length(x)^-0.2
    density(x, bw=bw)
  })
  xlim <- c(min(sapply(densities, function(d) { min(d$x) })),
    max(sapply(densities, function(d) {
      max(d$x)
    }))
  )
  ylim <- c(0,
    max(sapply(densities, function(d) {
     max(d$y)
    }))
  )
  densplot(ns, ylim=ylim, xlim=xlim)
}

nullCheckWithDefault <- function(value, default) {
  if(is.null(value)) default else value
}

gemtc <- function(params) {
  iter.adapt <- nullCheckWithDefault(params[['burnInIterations']], 5000)
  iter.infer <- nullCheckWithDefault(params[['inferenceIterations']], 20000)
  thin <- nullCheckWithDefault(params[['thinningFactor']], 10)
  modelType <-  nullCheckWithDefault(params[['modelType']][['type']], 'network')
  heterogeneityPriorType <- nullCheckWithDefault(params[['heterogeneityPrior']][['type']], 'automatic')
  regressor <- as.list(params[['regressor']])

  progress.start <- 0
  progress.jags <- NA

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

  times <- list()

  times$init <- system.time({
    ## incoming information
    #  entries
    data.ab <- do.call(rbind, lapply(params[['entries']], function(x) {
      as.data.frame(x, stringsAsFactors=FALSE)
    }))

    # create relative effects
    relEffects <- params[['relativeEffectData']]
    dataToRow <- function(data, study) {
      dataAsList <- as.list(data)
      row <- data.frame(
        study=as.character(study),
        treatment=as.character(data[['treatment']]),
        diff=nullCheckWithDefault(dataAsList[['meanDifference']], NA),
        std.err=nullCheckWithDefault(dataAsList[['standardError']], NA),
        stringsAsFactors=FALSE)

      if(!is.null(dataAsList[['baseArmStandardError']]) && dataAsList[['baseArmStandardError']] != 'NA') {
        row[['std.err']] <- dataAsList[['baseArmStandardError']]
      }
      row
    }
    relEffectsData <- as.list(relEffects)[['data']]
    data.re <- data.frame(study=character(0), treatment=character(0), diff=numeric(0), std.err=numeric(0), stringsAsFactors=FALSE)
    for (study in names(relEffectsData)) {
      baseRow <- dataToRow(relEffectsData[[study]][['baseArm']], study)
      x <- lapply(relEffectsData[[study]][['otherArms']], function(x) {
        dataToRow(x, study)
      })
      data.re <- rbind(data.re, baseRow, do.call(rbind, x))
    }
    if(dim(data.re)[1] == 0) {
      data.re <- NULL
    }

    # linear model or fixed?
    linearModel <- nullCheckWithDefault(params[['linearModel']], 'random')

    treatments <- do.call(rbind, lapply(params[['treatments']], function(x) {
      data.frame(id=x[['id']], description=x[['name']], stringsAsFactors=FALSE)
    }))

    covars <- params[['studyLevelCovariates']]
    studies <- do.call(rbind, lapply(names(covars), function(studyName) {
        values <- c(list("study"=studyName), covars[[studyName]])
        values[sapply(values, is.null)] <- NA_real_
        do.call(data.frame, c(values, list(stringsAsFactors=FALSE)))
      }
    ))
    if(!is.null(params[['sensitivity']]) && 'adjustmentFactor' %in% names(params[['sensitivity']])) {
      adjustmentFactor <- make.names(params[['sensitivity']][['adjustmentFactor']])
      inflationValue <- params[['sensitivity']][['inflationValue']]
      weightingFactor <- params[['sensitivity']][['weightingFactor']]
      weightingVector <- unlist(lapply(studies[[adjustmentFactor]], function(x) {
        if (x == inflationValue) weightingFactor else 1
      }))
      studies[['powerAdjust']] <- weightingVector
    }

    # create network
    network <- mtc.network(data.ab=data.ab, data.re=data.re, treatments=treatments, studies=studies)

    #determine model parameters
    mtc.model.params <- list(network=network, linearModel=linearModel)
    if(!is.null(params[['likelihood']])) {
      mtc.model.params <- c(mtc.model.params, list('likelihood' = params[['likelihood']]))
    }
    if(!is.null(params[['link']])) {
      mtc.model.params <- c(mtc.model.params, list('link' = params[['link']]))
    }
    if (!is.null(params[['outcomeScale']])) {
      mtc.model.params <- c(mtc.model.params, list('om.scale' = params[['outcomeScale']]))
    }
    if(!is.null(params[['sensitivity']]) && 'adjustmentVector' %in% names(params[['sensitivity']])) {
      mtc.model.params <- c(mtc.model.params, list(powerAdjust="powerAdjust"))
    }
    if(modelType == 'node-split') {
      t1 <- params[['modelType']][['details']][['from']][['id']]
      t2 <- params[['modelType']][['details']][['to']][['id']]
      mtc.model.params <- c(mtc.model.params, list(type="nodesplit", t1=t1, t2=t2))
    }
    if(modelType == 'regression') {
      regressor[['variable']] <- make.names(regressor[['variable']]) # must be valid column name for data frame
      mtc.model.params <- c(mtc.model.params, list(type="regression", regressor = regressor))
    }
    if(linearModel == 'random') {
      if(heterogeneityPriorType == 'standard-deviation') {
        hy.prior <- mtc.hy.prior('std.dev', 'dunif', params[['heterogeneityPrior']][['values']][['lower']], params[['heterogeneityPrior']][['values']][['upper']])
        mtc.model.params <- c(mtc.model.params, list('hy.prior' = hy.prior))
      }
      if(heterogeneityPriorType == 'variance') {
        hy.prior <- mtc.hy.prior('var', 'dlnorm', params[['heterogeneityPrior']][['values']][['mean']], params[['heterogeneityPrior']][['values']][['stdDev']]^-2)
        mtc.model.params <- c(mtc.model.params, list('hy.prior' = hy.prior))
      }
      if(heterogeneityPriorType == 'precision') {
        hy.prior <- mtc.hy.prior('prec', 'dgamma', params[['heterogeneityPrior']][['values']][['rate']], params[['heterogeneityPrior']][['values']][['shape']])
        mtc.model.params <- c(mtc.model.params, list('hy.prior' = hy.prior))
      }
    }
    model <- do.call(mtc.model, mtc.model.params)
    regressor[['modelRegressor']] <- model[['regressor']]
    update(list(progress=0))
  })

predicted <- predict.t(network, iter.adapt, iter.infer, thin)
milestones <- cumsum(predicted)
milestones <- milestones / milestones[length(milestones)] * 99
report <- function(milestone, x) {
  print(paste(milestone, x))
  i <- which(names(milestones) == milestone)
  base <- if (i == 0) 0 else milestones[i - 1]
  goal <- milestones[i]
  dist <- goal - base
  update(list(progress = unname(base + x * dist)))
}

progress.jags <- unname(milestones[1])

times$sample <- system.time({
  result <- mtc.run(model, n.adapt=iter.adapt, n.iter=iter.infer, thin=thin)
})

if(modelType != 'node-split') {
  times$releffect <- system.time({
    treatmentIds <- as.character(network[['treatments']][['id']])
    comps <- combn(treatmentIds, 2)
    t1 <- comps[1,]
    t2 <- comps[2,]
    releffect <- list(centering=apply(comps, 2, function(comp) {
      q <- summary(relative.effect(result, comp[1], comp[2], preserve.extra=FALSE))[['summaries']][['quantiles']]
      report('releffect', which(comps[1,] == comp[1] & comps[2,] == comp[2]) / ncol(comps))
      list(t1=comp[1], t2=comp[2], quantiles=q)
    }))
    if(modelType == 'regression') {
      levelReleffects <- lapply(regressor[['levels']], function(level) {
        apply(comps, 2, function(comp) {
          q <- summary(relative.effect(result, comp[1], comp[2], preserve.extra=FALSE, covariate=level))[['summaries']][['quantiles']]
          report('releffect', which(comps[1,] == comp[1] & comps[2,] == comp[2]) / ncol(comps))
          list(t1=comp[1], t2=comp[2], quantiles=q)
        })
      })
      names(levelReleffects) <- regressor[['levels']]
      releffect <- c(releffect, levelReleffects)
    }
  })
}

if(modelType != 'node-split') {
  treatmentIds <- as.character(network[['treatments']][['id']])
  multivariateSummary <- lapply(treatmentIds, function(treatmentId){
    x <- relative.effect(result, t1=treatmentId, preserve.extra = FALSE)
    x <- as.matrix(x$samples)
    mu <- apply(x, 2, mean)
    sigma <- cov(x)
    list(mu=mu, sigma=wrap.matrix(sigma))
  })
  names(multivariateSummary) <- treatmentIds
}

times$relplot <- system.time({
  #create forest plot files for network analyses

  plotForestPlot <- function(treatmentId, level=NA) {
    plotToSvg(function() {
      treatmentN <- which(treatmentIds == treatmentId)
      forest(relative.effect(result, treatmentId, covariate=level), use.description=TRUE)
      report('relplot', treatmentN / length(treatmentIds))
    })
  }
  if(modelType == "network" || modelType == "regression") {
    centeringForestplot <- lapply(treatmentIds, plotForestPlot)
    names(centeringForestplot) <- treatmentIds
    forestPlots <- list(centering=centeringForestplot)
    if(!is.null(regressor)) {
      levelForestplots <- lapply(regressor[['levels']], function(level) {
        levelForestplot <- lapply(treatmentIds, function(x){
          plotForestPlot(x, level)
        })
        names(levelForestplot) <- treatmentIds
        levelForestplot
      })
      names(levelForestplots) <- regressor[['levels']]
      forestPlots <- c(forestPlots, levelForestplots)
    }
  }
})

times$forest <- system.time({
    # create forest plot for pairwise analysis
    if(modelType == "pairwise") {
      forestPlot <- plotToSvg(function() {
        t1 <- as.character(params[['modelType']][['details']][['from']][['id']])
        t2 <- as.character(params[['modelType']][['details']][['to']][['id']])
        pwforest(result, t1, t2)
      })
    }
})
report('forestplot', 1.0)

paramNames <- colnames(result[['samples']][[1]])

times$traceplot <- system.time({
    #create results plot
    tracePlot <- plotToPng(function() {
      plot(result, auto.layout=FALSE)
    })
    sel <- seq(2, length(tracePlot), by=2)
    densityPlot <- tracePlot[sel]
    tracePlot <- tracePlot[-sel]
    names(densityPlot) <- paramNames
    names(tracePlot) <- paramNames
})
report('traceplot', 1.0)

times$psrfplot <- system.time({
    #create gelman plot
    gelmanPlot <- plotToPng(function() {
      gelman.plot(result, auto.layout=FALSE, ask=FALSE)
    })
    names(gelmanPlot) <- paramNames
})
report('psrfplot', 1.0)

times$deviancePlot <- system.time({
    #create deviance plot
    deviancePlot <- plotToSvg(function() {
      plotDeviance(result)
    })
})
report('deviancePlot', 1.0)

if(modelType == 'node-split') {
  nodeSplitDensityPlot <- plotToPng(function() {
    nsdensity(result)
  })
}
report('nodeSplitDensityPlot', 1.0)

if(modelType == 'regression') {
  treatmentIds <- as.character(network[['treatments']][['id']])
  control <- as.character(model[['regressor']][['control']])
  controlIdx <- which(treatmentIds == control)
  t1 <- rep(control, length(treatmentIds) - 1)
  t2 <- treatmentIds[-controlIdx]
  covariateEffectPlot <- plotToPng(function() {
    plotCovariateEffect(result, t1, t2)
  })
  names(covariateEffectPlot) <- t2
}
report('covariateEffectPlot', 1.0)

times$summary <- system.time({
  summary <- summary(result)
})
report('summary', 1.0)
    summary[['script-version']] <- 0.3
    statistics <- summary[['summaries']][['statistics']]
    if(is.vector(statistics)) { # in case of pairwise there's no effect matrix
      treatmentIds <- as.character(network[['treatments']][['id']])
      matrixStatistics <-  matrix(statistics, ncol=4)
      colnames(matrixStatistics) <- names(statistics)
      rownames(matrixStatistics) <- paste('d.', treatmentIds[1], ".", treatmentIds[2], sep="")
    } else {
      matrixStatistics <- statistics
    }
    summary[['summaries']][['statistics']] <- wrap.matrix(matrixStatistics)
    summary[['summaries']][['quantiles']] <- wrap.matrix(summary[['summaries']][['quantiles']])
    summary[['logScale']] <- ll.call('scale.log', model)
    summary[['link']] <- model[['link']]
    summary[['likelihood']] <- model[['likelihood']]
    summary[['type']] <- model[['type']]
    summary[['linearModel']] <- model[['linearModel']]
    summary[['burnInIterations']] <- params[['burnInIterations']]
    summary[['inferenceIterations']] <- params[['inferenceIterations']]
    summary[['thinningFactor']] <- params[['thinningFactor']]
    summary[['outcomeScale']] <- model[['om.scale']]
    preferredDirection <- nullCheckWithDefault(params[['preferredDirection']], 1)  # 1 (higher is beter) as default
    summary[['preferredDirection']] <- preferredDirection
    if(modelType != 'node-split') {
      summary[['relativeEffects']] <- releffect
      summary[['rankProbabilities']] <- list(centering=wrap.matrix(rank.probability(result,  preferredDirection=preferredDirection)))
      summary[['multivariateSummary']] <- multivariateSummary
    }
    summary[['alternatives']] <- names(summary[['rankProbabilities']])
    if(modelType == "network" || modelType == "regression") {
      summary[['relativeEffectPlots']] <- forestPlots
    }
    if(modelType == "network") {
      comps <- combn(treatmentIds, 2)
      studyRelativeEffects <- apply(comps, 2, function(treatmentPair) {
        pweffects(result, treatmentPair[1], treatmentPair[2])
      })
      studyRelativeEffects <- studyRelativeEffects[lapply(studyRelativeEffects, nrow) > 0] # filter out comps without effects
      summary[['studyRelativeEffects']] <- studyRelativeEffects
    }
    if(modelType == "pairwise") {
      summary[['studyForestPlot']] <- forestPlot
      t1 <- as.character(params[['modelType']][['details']][['from']][['id']])
      t2 <- as.character(params[['modelType']][['details']][['to']][['id']])
      studyRelativeEffects <- pweffects(result, t1, t2)
      if(dim(studyRelativeEffects)[1] > 3) { # no funnel plot if <= 3 studies
        summary[['studyRelativeEffects']] <- studyRelativeEffects
      }
    }
    if(modelType == 'node-split') {
      summary[['nodeSplitDensityPlot']] <- nodeSplitDensityPlot

      diff <- as.matrix(result[['samples']][,'d.direct']) - as.matrix(result[['samples']][,'d.indirect'])
      prob <- sum(diff > 0)/length(diff)
      summary[['nodeSplit']] <- list(
        diff=list(quantiles=quantile(diff, c(0.025,0.25,0.5,0.75,0.975))),
        incons.p=2 * min(prob, 1 - prob))
    }
    if(modelType == 'regression') {
      summary[['regressor']] <- params[['regressor']]
      summary[['regressor']][['modelRegressor']] <- regressor[['modelRegressor']]
      summary[['covariateEffectPlot']] <- covariateEffectPlot
      levelRankProbabilities <- lapply(regressor[['levels']], function(level) {
        wrap.matrix(rank.probability(result, covariate=level))
      })
      names(levelRankProbabilities) <- regressor[['levels']]
      summary[['rankProbabilities']] <- c(summary[['rankProbabilities']], levelRankProbabilities)
    }
    summary[['convergencePlots']] <- list(
      trace=tracePlot,
      density=densityPlot,
      psrf=gelmanPlot)
    summary[['gelmanDiagnostics']] <- wrap.matrix(gelman.diag(result, multivariate=FALSE)[['psrf']])
    deviance <- result[['deviance']]
    summary[['devianceStatistics']][['perArmDeviance']] <- wrap.arms(deviance[['dev.ab']], model[['network']])
    print(model[['network']][['data.re']][['study']])
    relEffectStudyNames <- rle(as.character(model[['network']][['data.re']][['study']]))[['values']]
    names(deviance[['dev.re']]) <- relEffectStudyNames
    summary[['devianceStatistics']][['relativeDeviance']] <- if(length(deviance[['dev.re']]) > 0)  deviance[['dev.re']] else NULL
    summary[['devianceStatistics']][['perArmLeverage']] <- wrap.arms(deviance[['dev.ab']] - deviance[['fit.ab']], model[['network']])
    relativeLeverage <- deviance[['dev.re']] - deviance[['fit.re']]
    names(relativeLeverage) <- relEffectStudyNames
    summary[['devianceStatistics']][['relativeLeverage']] <- if(length(relativeLeverage) > 0) relativeLeverage else NULL
    summary[['residualDeviance']] <- deviance[['Dbar']]
    summary[['leverage']] <- deviance[['pD']]
    summary[['DIC']] <- deviance[['DIC']]
    summary[['deviancePlot']] <- deviancePlot
    heterogeneityPrior <- model[['hy.prior']]
    heterogeneityPrior[['args']] <- sapply(heterogeneityPrior[['args']], function(arg) { if (arg == 'om.scale') model[['om.scale']] else arg })
    if(heterogeneityPrior[['distr']] == 'dlnorm') {
      heterogeneityPrior[['args']][2] <- heterogeneityPrior[['args']][2]^-0.5
    }
    summary[['heterogeneityPrior']] <- heterogeneityPrior

    print(times)

    update(list(progress=100))
    summary
}
