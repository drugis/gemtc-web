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

  summary <- summary(result)
  summary[['summaries']][['statistics']] <- wrap.matrix(summary[['summaries']][['statistics']])
  summary[['summaries']][['quantiles']] <- wrap.matrix(summary[['summaries']][['quantiles']])
  summary$logScale <- ll.call('scale.log', model)
  update(100)
  summary
}
