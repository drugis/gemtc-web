'use strict';
define([], function() {
  var dependencies = ['gemtcRootPath', '$modal'];
  var ExportDirective = function(gemtcRootPath, $modal) {
    return {
      restrict: 'A',
      templateUrl: gemtcRootPath + 'js/util/exportDirective.html',
      transclude: true,
      link: function(scope, element, attrs) {
        scope.exportElement = exportElement;

        var btnElement = '<button ng-click="exportElement()" class="export-button info small">Export</button>';

        if (element.find('table').length > 0) {
          element.find('table').css('position', 'relative')
          .append(btnElement);
        } else if (element.find('img').length > 0) {
          element.find('img').parent().css('position', 'relative')
          .append(btnElement);
        } else if (element.find('svg').length > 0) {
          element.find('svg').parent().parent().css('position', 'relative')
          .append(btnElement);
        }


        function exportElement() {
          if (element.find('svg').length) {
            console.log('found svg');
          } else if (element.find('table').length) {
            $modal.open({
              templateUrl: './js/util/copyDialog.html',
              windowClass: 'medium',
              scope: scope,
              controller: function($scope, $modalInstance) {
                $scope.close = function() {
                  $modalInstance.dismiss();
                }
              }
            });
          } else if (element.find('img').length) {
            console.log('found non-svg image');
          }
        }
      }
    }
  };
  return dependencies.concat(ExportDirective);
});
