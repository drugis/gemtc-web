'use strict';
define([], function() {
  var dependencies = [
    '$scope',
    '$stateParams',
    '$modal',
    'AnalysisResource'
  ];
  var AnalysisController = function(
    $scope,
    $stateParams,
    $modal,
    AnalysisResource
  ) {
    // functions
    $scope.editAnalysisTitle = editAnalysisTitle;

    // init
    $scope.$parent.analysis = AnalysisResource.get($stateParams);

    function editAnalysisTitle() {
      $modal.open({
        templateUrl: './editAnalysisTitle.html',
        scope: $scope,
        controller: 'EditAnalysisTitleController',
        resolve: {
          analysisTitle: function() {
            return $scope.$parent.analysis.title;
          },
          callback: function() {
            return function(newTitle) {
              AnalysisResource.setTitle($stateParams, {
                newTitle: newTitle
              }, function() {
                $scope.$parent.analysis.title = newTitle;
              });
            };
          }
        }
      });
    }
  };
  return dependencies.concat(AnalysisController);
});
