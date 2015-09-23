'use strict';
define(['lodash', 'd3'], function(_, d3) {
  var dependencies = ['gemtcRootPath', '$modal', '$compile'];
  var ExportDirective = function(gemtcRootPath, $modal, $compile) {
    return {
      restrict: 'A',
      templateUrl: gemtcRootPath + 'js/util/exportDirective.html',
      scope: true,
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
          scope.exportElement = _.partial(exportImage, image[0], element.find('#exportCanvas')[0]);
        } else if (element.find('svg').length > 0) {
          element.find('svg').parent().parent().css('position', 'relative')
            .append(btnElement);
          scope.exportElement = exportSvg;
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

        function exportImage(sourceImage, canvasElement) {
          var newImage = new Image;
          newImage.src = sourceImage.src;
          newImage.onload = _.partial(onImageLoad, element, canvasElement, newImage);
        }

        function exportSvg() {
          console.log('export svg');
        }

        function onImageLoad(element, canvasElement, image) {
          var context = canvasElement.getContext("2d")
          context.drawImage(image, 0, 0);

          var a = document.createElement("a");
          a.download = "sample.png";
          a.href = canvasElement.toDataURL("image/png");

          a.click();
        }

        // function blobUrl(canvas) {
        //   var byteString = atob(canvas.toDataURL().replace(/^data:image\/(png|jpg|svg+xml);base64,/, ""));
        //   var ab = new ArrayBuffer(byteString.length);
        //   var ia = new Uint8Array(ab);
        //   for (var i = 0; i < byteString.length; i++) {
        //     ia[i] = byteString.charCodeAt(i);
        //   }
        //   var dataView = new DataView(ab);
        //   var blob = new Blob([dataView], {
        //     type: "image/png"
        //   });
        //   var DOMURL = self.URL || self.webkitURL || self;
        //   var newurl = DOMURL.createObjectURL(blob);

        //   return '<img src="' + newurl + '">';
        // }

      }
    };
  };
  return dependencies.concat(ExportDirective);
});
