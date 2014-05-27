# Stolen from mcda-web, ensures the row-names of a matrix are preserved
wrap.matrix <- function(m) {
  l <- lapply(rownames(m), function(name) { m[name,] })
  names(l) <- rownames(m)
  l
}

gemtc <- function(params) {
  data.ab <- do.call(rbind, lapply(params[['entries']], as.data.frame, stringsAsFactors=FALSE))
  network <- mtc.network(data.ab=data.ab)
  model <- mtc.model(network)
  result <- mtc.run(model)

  summary <- summary(result)
  summary[['summaries']][['statistics']] <- wrap.matrix(summary[['summaries']][['statistics']])
  summary[['summaries']][['quantiles']] <- wrap.matrix(summary[['summaries']][['quantiles']])
  summary$logScale <- ll.call('scale.log', model)
  summary
}
