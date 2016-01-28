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
        var acceptTypes = scope.acceptTypes();
        element.find('input').attr('accept', acceptTypes);

        function onLoad(env) {
          scope.$apply(function() {
            var result = env.target.result;
            scope.model.contents = result;
          });
        }

        element.on('change', function(event) {
          scope.$apply(function(scope) {
            var file = event.target.files[0];
            if (file) {
              scope.model.extension = file.name.split('.').pop();
            }
            var reader = new FileReader();
            reader.onload = onLoad;
            if(file){
              reader.readAsText(file);
            }
          });
        });
      }
    };
  };
  return dependencies.concat(FileReaderDirective);
});
