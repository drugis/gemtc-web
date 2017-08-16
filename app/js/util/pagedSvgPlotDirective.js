'use strict';
define([], function() {
  var dependencies = ['gemtcRootPath'];
  var PagedSvgDirective = function(gemtcRootPath) {
    return {
      scope: {
        pages: '=',
        fileName: '='
      },
      restrict: 'E',
      // using template because loading templateUrl irritating in submodule
      templateUrl: gemtcRootPath + 'js/util/pagedSvgPlotDirective.html',
      link: function(scope) {
        scope.selectNextPage = selectNextPage;
        scope.selectPreviousPage = selectPreviousPage;
        resetPage();

        scope.$watch('pages', function(newValue, oldValue) {
          if (newValue === oldValue){
            return;
          }
          resetPage();
        });

        function resetPage() {
          scope.selectedPage = 0;
          scope.trustedPages = trustPages(scope.pages);
        }

        function trustPages(pages) {
          return pages;
        }
        function selectNextPage() {
          ++scope.selectedPage;
        }
        function selectPreviousPage() {
          --scope.selectedPage;
        }
      }
    };
  };
  return dependencies.concat(PagedSvgDirective);
});
