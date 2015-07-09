context("readFile")

test_that("readFile can read a file", {
  expect_that(readFile("fileToRead.txt"), equals("Bacon Ipsum\n"))
})
