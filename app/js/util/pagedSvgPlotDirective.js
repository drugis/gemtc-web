'use strict';
define([], function() {
  var dependencies = ['$sce'];
  var PagedSvgDirective = function($sce) {
    return {
      scope: {
        pages: '='
      },
      restrict: 'E',
      // using template because loading teplateUrl irritating in submodule
      template: '<div ng-bind-html="trustedPages[selectedPage]"></div><a class="previous" ng-click="selectPreviousPage()"><i ng-if="selectedPage > 0" class="fa fa-caret-left" style="font-size:3em;"></i></a><a class="next" ng-click="selectNextPage()"><i ng-if="selectedPage < pages.length - 1" class="fa fa-caret-right" style="font-size:3em;"></i></a>',
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
