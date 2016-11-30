test_that("pwFilter filters studies and treatments", {
  network <- pwFilter(certolizumab, t1='Placebo', t2='Adalimumab')
  expect_equal(as.character(network$studies$study), c("ARMADA", "DE019", "Kim2007"))
  expect_equal(network$studies$diseaseDuration, c(11.65, 10.95, 6.85))

  network <- pwFilter(certolizumab, t1="Placebo", t2="CZP")
  expect_equal(as.character(network$treatments$id), c("CZP", "Placebo"))
  expect_equal(as.character(network$treatments$description), c("Certolizumab Pegol", "Placebo"))
})

test_that("pwFilter filters data.ab", {
  network <- pwFilter(parkinson, t1='A', t2='B')
  expect_that(as.character(network$data.ab$study), equals(c("2", "2", "3", "3")))
  expect_that(as.character(network$data.ab$treatment), equals(c("A", "B", "A", "B")))
  expect_that(network$data.ab$mean, equals(-c(0.7, 2.4, 0.3, 2.6)))
  expect_that(network$data.ab$std.dev, equals(c(3.7, 3.4, 4.4, 4.3)))
  expect_that(network$data.ab$sampleSize, equals(c(172, 173, 76, 71)))

  network <- pwFilter(parkinson, t1='B', t2='D')
  expect_that(as.character(network$data.ab$study), equals(c("3", "3")))
  expect_that(as.character(network$data.ab$treatment), equals(c("B", "D")))
  expect_that(network$data.ab$mean, equals(-c(2.6, 1.2)))
  expect_that(network$data.ab$std.dev, equals(c(4.3, 4.3)))
  expect_that(network$data.ab$sampleSize, equals(c(71, 81)))

  network <- pwFilter(parkinson_shared, t1='D', t2='E')
  expect_null(network$data.ab)

  expect_error(pwFilter(parkinson, t1='B', t2='C'))
})

test_that("pwFilter filters data.re", {
  network <- pwFilter(parkinson_shared, t1='D', t2='E')
  expect_equal(as.character(network$data.re$study), c("6", "6", "7", "7"))
  expect_equal(as.character(network$data.re$treatment), c("D", "E", "D", "E"))
  expect_equal(network$data.re$diff, c(NA, -0.3, NA, -0.3), tolerance=1e-7)
  expect_equal(network$data.re$std.err, c(NA, 0.2742763, NA, 0.3200872), tolerance=1e-7)

  network <- pwFilter(parkinson_shared, t1='A', t2='B')
  expect_null(network$data.re)

  network <- pwFilter(parkinson_diff, t1='B', t2='D')
  expect_equal(as.character(network$data.re$study), c("7", "7"))
  expect_equal(as.character(network$data.re$treatment), c("B", "D"))
  expect_equal(network$data.re$diff, c(NA, 1.4))
  expect_equal(network$data.re$std.err, c(NA, 0.6990666), tolerance=1e-7)
})
