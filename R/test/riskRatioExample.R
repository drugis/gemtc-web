# Example from http://www.statsdirect.com/help/default.htm#meta_analysis/relative_risk.htms
# Original source http://dx.doi.org/10.1016/0895-4356(91)90261-7

data.ab <- read.table(textConnection('
study	treatment	responders	sampleSize
MRC-1	A	67	624
MRC-1	B	49	615
CDP	A	64	771
CDP	B	44	758
MRC-2	A	126	850
MRC-2	B	102	832
GASP	A	38	309
GASP	B	32	317
PARIS	A	52	406
PARIS	B	85	810
AMIS	A	219	2257
AMIS	B	246	2267
ISIS-2	A	1720	8600
ISIS-2	B	1570	8587'), header=TRUE)

network <- mtc.network(data.ab)
model <- mtc.model(network, likelihood='binom', link='log', linearModel='fixed')
result <- mtc.run(model)
print(summary(result))

# Results were:
#
#               Mean      SD  Naive SE Time-series SE
# d.A.B     -0.09049 0.02752 9.731e-05       0.000207
# deviance 108.68841 3.98066 1.407e-02       0.022219
#
# Corresponding to RR = 0.9134 (0.8655, 0.9641)
# Compare MH RR = 0.913608 (0.8657, 0.964168)
