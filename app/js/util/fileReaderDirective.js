'use strict';
define([], function() {
  var dependencies = ['$injector'];
  var FileReaderDirective = function($injector) {
    return {
      scope: {
        model: '='
      },
      restrict: 'E',
      template: '<input id="problem-file-upload" type="file" accept=".json">',
      link: function(scope, element) {
        var file;

        function onLoadContents(env) {
          scope.$apply(function() {
            var result = env.target.result;
            scope.model = result;
          });
        }

        element.on('change', function(event) {

          scope.$apply(function(scope) {
            var file = event.target.files[0];
            var reader = new FileReader();
            reader.onload = onLoadContents;
            file && reader.readAsText(file);
          });
        });
      }
    };
  };
  return dependencies.concat(FileReaderDirective);
});