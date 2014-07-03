'use strict';
define(['underscore'], function() {
  var dependencies = ['$scope', '$stateParams', 'ModelResource', 'PataviService', 'RelativeEffectsTableService', 'PataviTaskIdResource'];
  var ModelController = function($scope, $stateParams, ModelResource, PataviService, RelativeEffectsTableService, PataviTaskIdResource) {

    function getTaskId() {
      return PataviTaskIdResource.get($stateParams);
    }

    $scope.progress = {
      percentage: 0
    };

    var resultsPromise = ModelResource
      .get($stateParams)
      .$promise
      .then(getTaskId)
      .then(PataviService.run)
      .then(function(result) {
        $scope.outcome = $scope.$parent.analysis.outcome;
        $scope.result = result;
        var relativeEffects = result.results.relativeEffects;
        var isLogScale = result.results.logScale;
        $scope.relativeEffectsTable = RelativeEffectsTableService.buildTable(relativeEffects, isLogScale);
      }, function(error) {
        console.log('an error has occurred, error: ' + error);
      }, function(update) {
        if ($.isNumeric(update.progress)) {
          $scope.progress.percentage = update.progress;
        }
      });


  };
  return dependencies.concat(ModelController);
});