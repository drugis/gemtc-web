'use strict';
define([], function() {
  var dependencies = ['$sce'];
  var PagedSvgDirective = function($sce) {
    return {
      scope: {
        pages: '='
      },
      restrict: 'E',
      templateUrl: 'js/util/pagedSvgPlotDirective.html',
      link: function(scope, element) {
        scope.selectNextPage = selectNextPage;
        scope.selectPreviousPage = selectPreviousPage;
        resetPage();

        scope.$watch('pages', function(newValue, oldValue) {
          if (newValue === oldValue) return;
          resetPage();
        });

        function resetPage() {
          scope.selectedPage = 0;
          scope.trustedPages = trustPages(scope.pages);
        }

        function trustPages(pages) {
          return _.map(pages, function(page) {
            return $sce.trustAsHtml(page);
          });
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
