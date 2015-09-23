'use strict';
define(['lodash', 'd3', 'jQuery'], function(_, d3, jQuery) {
  var dependencies = ['gemtcRootPath', '$modal', '$compile'];
  var ExportDirective = function(gemtcRootPath, $modal, $compile) {
    return {
      restrict: 'A',
      templateUrl: gemtcRootPath + 'js/util/exportDirective.html',
      scope: {
        fileName: '='
      },
      transclude: true,
      link: function(scope, element, attrs) {
        var btnElement = $compile('<button ng-click="exportElement()" class="export-button info small">Export</button>')(scope);

        if (element.find('table').length > 0) {
          element.find('table').css('position', 'relative')
            .append(btnElement);
          scope.exportElement = showCopyPasteMessage;
        } else if (element.find('img').length > 0) {
          var image = element.find('img');
          image.parent().css('position', 'relative').append(btnElement);
          scope.exportElement = _.partial(exportImage, scope.fileName, image[0]);
        } else if (element.find('svg').length > 0) {
          var svgElement = element.find('svg');
          svgElement.parent().parent().css('position', 'relative')
            .append(btnElement);
          scope.exportElement = _.partial(exportSvg, scope.fileName, svgElement);
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
          var clickEvent = new MouseEvent("click", {
            "view": window,
            "bubbles": true,
            "cancelable": false
          });
          var a = document.createElement("a");
          a.download = fileName + ".png";
          a.href = $canvasElement[0].toDataURL("image/png");

          a.dispatchEvent(clickEvent);
        }

        function getParentDimension(element) {
          function parsePx(str) {
            return parseInt(str.replace(/px/gi, ''));
          }

          var width = parsePx($(element).css('width'));
          var height = parsePx($(element).css('height'));

          return {
            width: width,
            height: height
          };
        };

        function exportSvg(fileName, $svgElement) {


          var dim = getParentDimension($svgElement);

          var html = $svgElement
            .attr('height', $svgElement.height())
            .attr('width', $svgElement.width())
            .attr("version", 1.1)
            .attr("xmlns", "http://www.w3.org/2000/svg")
            .parent()[0]
            .innerHTML;

          var imgsrc = 'data:image/svg+xml;base64,' + btoa(html);
          var $img = jQuery('<img />', {
            src: imgsrc,
            id: 'yo-id'
          });

          $img.prop('height', dim.height);
          $img.prop('width', dim.width);

          $img.css('width', dim.width);
          $img.css('height', dim.height);

          element.append($img);

          exportImage(fileName, $img[0]);
        }
      }
    };
  };
  return dependencies.concat(ExportDirective);
});
