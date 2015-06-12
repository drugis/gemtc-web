'use strict';
define([], function() {
  var dependencies = ['CSVParseService'];
  var FileReaderDirective = function(CSVParseService) {
    return {
      scope: {
        model: '='
      },
      restrict: 'E',
      template: '<input id="problem-file-upload" type="file" accept=".json|.csv">',
      link: function(scope, element) {
        var file;

        function onLoadCSV(env) {
          scope.$apply(function() {
            var result = env.target.result;
            scope.model = CSVParseService.parse(result);
          });
        }

        function onLoadJSON(env) {
          scope.$apply(function() {
            var result = env.target.result;
            scope.model = result;
          });
        }

        element.on('change', function(event) {
          scope.$apply(function(scope) {
            var file = event.target.files[0];
            var reader = new FileReader();
            // if (file.extension === 'json') {
            //   reader.onload = onLoadJSON;
            // } else if (file.extension === 'csv') {
              reader.onload = onLoadJSON;
            // }
            file && reader.readAsText(file);
          });
        });
      }
    };
  };
  return dependencies.concat(FileReaderDirective);
});
