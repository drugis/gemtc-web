'use strict';
define([], function() {
  var dependencies = [];
  var FileReaderDirective = function() {
    return {
      scope: {
        model: '=',
        acceptTypes: '&'
      },
      restrict: 'E',
      template: '<input id="problem-file-upload" type="file">',
      link: function(scope, element) {
        var file;
        var acceptTypes = scope.acceptTypes();
        element.find('input').attr('accept', acceptTypes);

        function onLoad(env) {
          scope.$apply(function() {
            var result = env.target.result;
            scope.model.contents = result;
            scope.model.filetype = env.target.extension;
          });
        }

        element.on('change', function(event) {
          scope.$apply(function(scope) {
            var file = event.target.files[0];
            if (file) {
              scope.model.extension = filename.split('.').pop();
            }
            var reader = new FileReader();
            reader.onload = onLoad;
            file && reader.readAsText(file);
          });
        });
      }
    };
  };
  return dependencies.concat(FileReaderDirective);
});
