# Stolen from mcda-web, ensures the row-names of a matrix are preserved
wrap.matrix <- function(m) {
  l <- lapply(rownames(m), function(name) { m[name,] })
  names(l) <- rownames(m)
  l
}

close.PataviJagsPB <- function(pb) {}

gemtc <- function(params) {
  iter.adapt <- 5000
  iter.infer <- 20000
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
  linearModel <- if(is.null(params[['linearmodel']])) 'fixed' else params[['linearmodel']]

  network <- mtc.network(data.ab=data.ab)
  model <- mtc.model(network, linearModel=linearModel)
  update(list(progress=0))
  result <- mtc.run(model, n.adapt=iter.adapt, n.iter=iter.infer)

  comps <- combn(as.character(network[['treatments']][['id']]), 2)
  t1 <- comps[1,]
  t2 <- comps[2,]
  releffect <- summary(relative.effect(result, t1, t2))[['summaries']][['quantiles']]
  releffect <- apply(comps, 2, function(comp) {
    list(t1=comp[1], t2=comp[2], quantiles=releffect[paste("d", comp[1], comp[2], sep="."),])
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
  summary[['relativeEffects']] <- releffect
  summary[['rankProbabilities']] <- wrap.matrix(rank.probability(result))
  summary[['alternatives']] <- names(summary[['rankProbabilities']])
  update(list(progress=100))
  summary
}
