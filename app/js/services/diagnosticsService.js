'use strict';
define(['lodash'], function(_) {
  var dependencies = [];

  var DiagnosticsService = function() {


    /**
     * Extend gelman diagnostics with a human-readable label
     * look up treatment names by id.
     * example: d.2.3 would get the label 'd.2.3 (fluox - parox)'
     * if the treatments were [{id: 2, name: fluox}, {id: 3, name: parox}]
     **/
    function labelDiagnostics(diagnostics, treatments) {
      function createLabel(diagnostic, key) {
        if (key === 'sd.d') {
          return 'sd.d (Random effects standard deviation)';
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
        accum[key] = _.extend(diagnostic, {
          label: createLabel(diagnostic, key)
        });
        return accum;
      }, {});
    }

    return {
      labelDiagnostics: labelDiagnostics
    };
  };

  return dependencies.concat(DiagnosticsService);
});
