'use strict';
define(['lodash'], function(_) {
  var dependencies = [];

  var DiagnosticsService = function() {

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
        } else if (key === 'B') {
          return 'beta (covariate)';
        } else if (key.slice(0, 5) === 'beta[') {
          var treatmentId = key.substring(key.indexOf('[') + 1, key.length - 1);
          return 'beta (' + treatmentsById[treatmentId].name + ')';
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

    function buildDiagnosticMap(model, problem, result) {
      var labelledDiagnostics = labelDiagnostics(model.modelType.type, result.results.gelmanDiagnostics, problem.treatments);
      var diagnosticMap = labelledDiagnostics.reduce(function(accum, diagnostic, index) {
        diagnostic.tracePlot = result.results.convergencePlots.trace[diagnostic.key];
        diagnostic.densityPlot = result.results.convergencePlots.density[diagnostic.key];
        diagnostic.psrfPlot = result.results.convergencePlots.psrf[diagnostic.key];
        accum[diagnostic.label] = diagnostic;
        return accum;
      }, {});

      return diagnosticMap;
    }

    function compareDiagnostics(a, b) {
      // if random effecs, sort sd.d to back
      if (a.key === 'sd.d') {
        return 1;
      } else if (b.key === 'sd.d') {
        return -1;
      }

      if (a.key.indexOf('beta[') > -1 && b.key.indexOf('beta[') > -1) {
        var aId = a.key.substring(a.key.indexOf('[') + 1, a.key.length - 1);
        var bId = b.key.substring(b.key.indexOf('[') + 1, b.key.length - 1);
        return parseInt(aId) - parseInt(bId);
      } else {
        if (a.key.indexOf('beta[') > -1) {
          return 1;
        } else if (b.key.indexOf('beta[') > -1) {
          return -1;
        }
      }
      var componentsA = a.key.split('.'); // split 'd.20.3' into components
      var componentsB = b.key.split('.'); // split 'd.20.3' into components
      if (componentsA[1] !== componentsB[1]) { // only compare y of 'd.x.y.' if x is equal
        return parseInt(componentsA[1]) - parseInt(componentsB[1]);
      } else {
        return parseInt(componentsA[2]) - parseInt(componentsB[2]);
      }
    }

    return {
      buildDiagnosticMap: buildDiagnosticMap,
      compareDiagnostics: compareDiagnostics
    };
  };

  return dependencies.concat(DiagnosticsService);
});