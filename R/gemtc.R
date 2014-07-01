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

  newProgress <- function(start.iter, end.iter, adapting) {
    pb <- list(start.iter=start.iter, end.iter=end.iter, adapting=adapting)
    class(pb) <- "PataviJagsPB"
    pb
  }

  setProgress <- function(pb, iter) {
    update(progress.start + (iter / (iter.adapt + iter.infer)) * progress.jags)
  }

  assignInNamespace("updatePB", newProgress, "rjags")
  assignInNamespace("setPB", setProgress, "rjags")
  options("jags.pb"="gui")

  data.ab <- do.call(rbind, lapply(params[['entries']], as.data.frame, stringsAsFactors=FALSE))

  network <- mtc.network(data.ab=data.ab)
  model <- mtc.model(network)
  update(0)
  result <- mtc.run(model, n.adapt=iter.adapt, n.iter=iter.infer)

  comps <- combn(as.character(network[['treatments']][['id']]), 2)
  t1 <- comps[1,]
  t2 <- comps[2,]
  releffect <- summary(relative.effect(result, t1, t2))[['summaries']][['quantiles']]
  releffect <- apply(comps, 2, function(comp) {
    list(t1=comp[1], t2=comp[2], quantiles=releffect[paste("d", comp[1], comp[2], sep="."),])
  })
  update(95)

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
  update(100)
  summary
}
