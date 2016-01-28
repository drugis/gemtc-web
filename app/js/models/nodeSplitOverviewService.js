'use strict';
define(['angular', 'lodash'], function(angular, _) {
  var dependencies = [];

  var NodeSplitOverviewService = function() {

    function buildDirectEffectEstimates(result) {
      var quantiles = result.summaries.quantiles;
      return {
        label: 'Direct',
        mean: quantiles['d.direct']['50%'],
        lower: quantiles['d.direct']['2.5%'],
        upper: quantiles['d.direct']['97.5%']
      };
    }


    function buildIndirectEffectEstimates(result) {
      var quantiles = result.summaries.quantiles;
      return {
        label: 'Indirect',
        mean: quantiles['d.indirect']['50%'],
        lower: quantiles['d.indirect']['2.5%'],
        upper: quantiles['d.indirect']['97.5%']
      };
    }

    function buildConsistencyEstimates(networkResult, comparison) {
      var relativeEffectCosistancyEstimate = _.find(networkResult.relativeEffects.centering, function(relativeEffect) {
        return comparison.from.id === parseInt(relativeEffect.t1) &&
          comparison.to.id === parseInt(relativeEffect.t2);
      });

      return {
        label: 'Consistency',
        mean: relativeEffectCosistancyEstimate.quantiles['50%'],
        lower: relativeEffectCosistancyEstimate.quantiles['2.5%'],
        upper: relativeEffectCosistancyEstimate.quantiles['97.5%']
      };
    }

    return {
      buildDirectEffectEstimates: buildDirectEffectEstimates,
      buildIndirectEffectEstimates: buildIndirectEffectEstimates,
      buildConsistencyEstimates: buildConsistencyEstimates
    };
  };
  return dependencies.concat(NodeSplitOverviewService);
});
