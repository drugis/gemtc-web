# Stolen from mcda-web, ensures the row-names of a matrix are preserved
wrap.matrix <- function(m) {
  l <- lapply(rownames(m), function(name) { m[name,] })
  names(l) <- rownames(m)
  l
}



gemtc <- function(params) {
  update(0)
  data.ab <- do.call(rbind, lapply(params[['entries']], as.data.frame, stringsAsFactors=FALSE))

  network <- mtc.network(data.ab=data.ab)
  update(10)
  model <- mtc.model(network)
  update(30)
  result <- mtc.run(model)
  update(90)

  comps <- combn(as.character(network[['treatments']][['id']]), 2)
  t1 <- comps[1,]
  t2 <- comps[2,]
  releffect <- summary(relative.effect(result, t1, t2))[['summaries']][['quantiles']]
  releffect <- apply(comps, 2, function(comp) {
    list(t1=comp[1], t2=comp[2], quantiles=releffect[paste("d", comp[1], comp[2], sep="."),])
  })

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
