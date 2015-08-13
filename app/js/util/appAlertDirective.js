'use strict';
define([], function() {
  var dependencies = [];
  var AppAlertDirective = function() {
    return {
      restrict: 'E',
      transclude: true,
      replace: true,
      scope: {
        type: '@',
        close: '&',
        error: '='
      },
      templateUrl: 'js/util/appAlertDirective.html',
      link: function(scope, element) {
        scope.animatedClose = function() {
          $(element).fadeOut(200, function() {
            scope.close();
          });
        };
      }
    };
  };
  return dependencies.concat(AppAlertDirective);
});
