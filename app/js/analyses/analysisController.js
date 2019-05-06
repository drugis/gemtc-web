'use strict';
define(['lodash'], function(_) {
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
    $scope.editOutcomeName = editOutcomeName;

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

    function editOutcomeName() {
      $modal.open({
        templateUrl: './editOutcomeName.html',
        scope: $scope,
        controller: 'EditOutcomeNameController',
        resolve: {
          outcomeName: function() {
            return $scope.$parent.analysis.outcome.name;
          },
          callback: function() {
            return function(newName) {
              AnalysisResource.setOutcome($stateParams, _.merge({}, $scope.$parent.analysis.outcome, {
                name: newName
              }), function() {
                $scope.$parent.analysis.outcome.name = newName;
              });
            };
          }
        }
      });
    }
  };
  return dependencies.concat(AnalysisController);
});
