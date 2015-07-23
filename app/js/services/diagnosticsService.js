'use strict';
define(['angular'], function(angular) {
  var dependencies = [];

  var DiagnosticsService = function() {

    function labelDiagnostics(diagnostics, treatments) {
      return {};
    }

    return {
      labelDiagnostics: labelDiagnostics
    }
  };

  return dependencies.concat(DiagnosticsService);
});
