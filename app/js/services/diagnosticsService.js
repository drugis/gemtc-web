'use strict';
define(['lodash'], function(_) {
  var dependencies = [];

  var DiagnosticsService = function() {

    function removeEffectsFromPsrfPlots(psrfPlots) {
      //  indirect and direct effects are expected to be at last-1 and last-2
      var comparisons = psrfPlots.slice(0, psrfPlots.length - 3);
      var standardDev = psrfPlots[psrfPlots.length - 1];
      return comparisons.concat(standardDev);
    }

    function removeEffectsFromTracePlots(tracePlots) {
      //  indirect and direct effects are expected to be at last-3 through last-6
      var comparisons = tracePlots.slice(0, tracePlots.length - 6); // remove indirect and direct effects
      var standardDev = tracePlots.slice(tracePlots.length - 2, tracePlots.length);
      return comparisons.concat(standardDev);
    }


    function skipRowForNodeSplit(modelType, key) {
      // skip the direct and indirect rows when dealing with a nodesplit model`
      return modelType === 'node-split' && (key === 'd.direct' || key === 'd.indirect');
    }
    /**
     * Extend gelman diagnostics with a human-readable label
     * look up treatment names by id.
     * example: d.2.3 would get the label 'd.2.3 (fluox - parox)'
     * if the treatments were [{id: 2, name: fluox}, {id: 3, name: parox}]
     **/
    function labelDiagnostics(modelType, diagnostics, treatments) {
      function createLabel(diagnostic, key) {
        if (key === 'sd.d') {
          return 'sd.d (Random effects standard deviation)';
        } else if (key === 'd.indirect') {
          return 'd.indirect (Indirect estimate)';
        } else if (key === 'd.direct') {
          return 'd.direct (Direct estimate)';
        } else {
          var splitKey = key.split('.');
          var treatment1Id = splitKey[1];
          var treatment2Id = splitKey[2];
          return key + ' (' +
            treatmentsById[treatment1Id].name + ', ' +
            treatmentsById[treatment2Id].name + ')';
        }
      }

      var treatmentsById = _.indexBy(treatments, 'id');
      var diagnosticsWithoutDeviance = _.omit(diagnostics, 'deviance');
      return _.reduce(diagnosticsWithoutDeviance, function(accum, diagnostic, key) {
        if (!skipRowForNodeSplit(modelType, key)) {
          var diagnosticsWithLabel = _.extend(diagnostic, {
            label: createLabel(diagnostic, key),
            key: key
          });
          accum.push(diagnosticsWithLabel);
        }
        return accum;
      }, []);
    }

    function buildDiagnosticMap(modelType, diagnostics, treatments, tracePlots, psrfPlots) {
      var diagnosticMap = {};
      var labelledDiagnostics = labelDiagnostics(modelType, diagnostics, treatments);
      var cleanedTracePlots = tracePlots;
      var cleanedPsrfPlots = psrfPlots;

      if (modelType === 'node-split') {
        cleanedPsrfPlots = removeEffectsFromPsrfPlots(psrfPlots);
        cleanedTracePlots = removeEffectsFromTracePlots(tracePlots);
      }

      var diagnosticMap = labelledDiagnostics.reduce(function(accum, diagnostic, index) {
        diagnostic.tracePlot = cleanedTracePlots[2 * index];
        diagnostic.densityPlot = cleanedTracePlots[2 * index + 1];
        diagnostic.psrfPlot = cleanedPsrfPlots[index];
        accum[diagnostic.label] = diagnostic;
        return accum;
      }, {});

      return diagnosticMap;
    }



    return {
      buildDiagnosticMap: buildDiagnosticMap
    };
  };

  return dependencies.concat(DiagnosticsService);
});