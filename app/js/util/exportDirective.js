'use strict';
define(['lodash', 'd3', 'jQuery'], function(_, d3, jQuery) {
  var dependencies = ['gemtcRootPath', '$modal', '$compile'];
  var ExportDirective = function(gemtcRootPath, $modal, $compile) {
    return {
      restrict: 'A',
      scope: {
        fileName: '='
      },
      link: function(scope, element, attrs) {
        
        var btnElement = $compile('<button ng-click="exportElement()" class="export-button info small">Export</button>')(scope);
        element.after(btnElement);
        element.css('float', 'left');

        if (element.is('table')) {
          scope.exportElement = showCopyPasteMessage;
        } else if (element.is('img')) {
          scope.exportElement = _.partial(exportImage, scope.fileName, element[0]);
        } else if (element.find('svg').length > 0) {
          scope.exportElement = _.partial(exportSvg, scope.fileName, element.find('svg'));
        }
        
        function showCopyPasteMessage() {
          $modal.open({
            templateUrl: './js/util/copyDialog.html',
            windowClass: 'medium',
            scope: scope,
            controller: function($scope, $modalInstance) {
              $scope.close = function() {
                $modalInstance.dismiss();
              };
            }
          });
        }

        function exportImage(fileName, sourceImage) {
          var $canvasElement = jQuery('<canvas/>')
            .prop({
              width: sourceImage.width,
              height: sourceImage.height
            });
          var context = $canvasElement[0].getContext("2d")
          context.drawImage(sourceImage, 0, 0);

          var a = document.createElement("a");
          a.download = fileName + ".png";
          a.href = $canvasElement[0].toDataURL("image/png");

          // work around firefox security feature that stop triggering click event from script
          var clickEvent = new MouseEvent("click", {
            "view": window,
            "bubbles": true,
            "cancelable": false
          });
          a.dispatchEvent(clickEvent);
        }

        function exportSvg(fileName, $svgElement) {
          //can't set svg instructions as image src directly
          var $image = createImage($svgElement);
          $image.load(_.partial(exportImage, fileName, $image[0]));
        }

        function createImage($svgElement) {
          var html = $svgElement
            .attr('height', $svgElement.height())
            .attr('width', $svgElement.width())
            .attr("version", 1.1)
            .attr("xmlns", "http://www.w3.org/2000/svg")
            .parent()[0]
            .innerHTML;

          var imgsrc = 'data:image/svg+xml;base64,' + btoa(html);
          var $img = jQuery('<img />', {
            src: imgsrc 
          });
          return $img;
        }
      }
    };
  };
  return dependencies.concat(ExportDirective);
});