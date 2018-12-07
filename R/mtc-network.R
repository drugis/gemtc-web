mtc.network <- function (data.ab = data, treatments = NULL, description = "Network", 
    data.re = NULL, data = NULL) 
{
    if (is.null(data.ab) && is.null(data.re)) {
        stop("Either `data.ab' or `data.re' (or both) must be specified")
    }
    if (!is.null(data.ab)) {
        if (!is.data.frame(data.ab)) {
            data.ab <- do.call(rbind, lapply(data.ab, as.data.frame))
        }
        data.ab <- remove.onearm(data.ab, warn = TRUE)
        mtc.validate.data.ab(data.ab)
    }
    if (!is.null(data.re)) {
        if (!is.data.frame(data.re)) {
            data.re <- do.call(rbind, lapply(data.re, as.data.frame))
        }
        data.re <- remove.onearm(data.re, warn = TRUE)
        mtc.validate.data.re(data.re)
    }
    if (is.null(treatments)) {
        data.treatments <- vector(mode = "character")
        if (!is.null(data.ab)) {
            data.treatments <- c(data.treatments, as.character(data.ab[["treatment"]]))
        }
        if (!is.null(data.re)) {
            data.treatments <- c(data.treatments, as.character(data.re[["treatment"]]))
        }
        treatments <- unique(data.treatments)
    }
    if (is.list(treatments) && !is.data.frame(treatments)) {
        treatments <- as.data.frame(do.call(rbind, treatments))
    }
    if (is.character(treatments) || is.factor(treatments)) {
        treatments <- data.frame(id = treatments, description = treatments)
    }
    treatments <- standardize.treatments(treatments)
    network <- list(description = description, treatments = treatments)
    if (!is.null(data.ab) && nrow(data.ab) > 0) {
        network <- c(network, list(data.ab = standardize.data(data.ab, 
            levels(treatments[["id"]]))))
    }
    if (!is.null(data.re) && nrow(data.re) > 0) {
        network <- c(network, list(data.re = standardize.data(data.re, 
            levels(treatments[["id"]]), re.order = TRUE)))
    }
    mtc.network.validate(network)
    class(network) <- "mtc.network"
    network
}
