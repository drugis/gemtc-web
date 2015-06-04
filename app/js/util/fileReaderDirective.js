'use strict';
define([], function() {
  var dependencies = ['$injector'];
  var FileReaderDirective = function($injector) {
    return {
      scope: {
        model: '=',
        validityServiceName: '=',
        validity: '='
      },
      restrict: 'E',
      template: '<input type="file" accept=".json">',
      link: function(scope, element) {
        var file;

        function onLoadContents(env) {
          scope.$apply(function() {
            var result = env.target.result;
            scope.model = result;

            // use a optionaly provided validity service if its available to check the models validity
            if (scope.validityServiceName && scope.validityServiceName.length > 0) {
              var validityService = $injector.get(scope.validityServiceName);
              var validity = validityService.getValidity(result);
              scope.validity = validity;
            } 

          });
        }

        element.on('change', function(event) {
          scope.$apply(function(scope) {
            var file = event.target.files[0];

            var reader = new FileReader();
            reader.onload = onLoadContents;
            reader.readAsText(file);
          });
        });
      }
    };
  };
  return dependencies.concat(FileReaderDirective);
});