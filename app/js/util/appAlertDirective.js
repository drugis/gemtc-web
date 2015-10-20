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
      link: function(scope, element) {
        scope.animatedClose = function() {
          $(element).fadeOut(200, function() {
            scope.close();
          });
        };
      }, // use a inline template for easy use in addis
      template: '<div class="alert-box {{type}}"> ' +
                '<div class="alert-box-message"> ' +
                  '<a ng-click="animatedClose()" class="close" style="top: 1rem;">&times;</a>  ' +
                  '<div ng-if="error.type !== &quot;patavi&quot;"> ' +
                    '{{error.code}} {{error.cause}} {{error.message}} ' +
                  '</div> ' +
                  '<div ng-if="error.type === &quot;patavi&quot;"> ' +
                    '<p>An error has occured while running the model in R.</p> ' +
                    '{{error.message}} ' +
                  '</div> ' +
                '</div> ' +
              '</div> '
    };
  };
  return dependencies.concat(AppAlertDirective);
});
