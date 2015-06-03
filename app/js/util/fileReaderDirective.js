'use strict';
define([], function() {
  var dependencies = [];
  var FileReaderDirective = function() {
    return {
      scope: {
        model: '='
      },
      restrict: 'E',
      template: '<input type="file" accept=".json">',
      link: function(scope, element) {
        var file;

        function onLoadContents(env) {
          scope.$apply(function() {
            scope.model = env.target.result;
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
