'use strict';
define(['underscore'], function() {
  var dependencies = ['$scope', '$stateParams', 'ModelResource', 'PataviService', 'ProblemResource', 'RelativeEffectsTableService'];
  var ModelController = function($scope, $stateParams, ModelResource, PataviService, ProblemResource, RelativeEffectsTableService) {

    function getProblem() {
      return ProblemResource.get($stateParams).$promise;
    }

    $scope.progress = {
      percentage: 0
    };

    var resultsPromise = ModelResource
      .get($stateParams)
      .$promise
      .then(getProblem)
      .then(PataviService.run)
      .then(function(result) {
        $scope.result = result;
        $scope.relativeEffectsTable = RelativeEffectsTableService.buildTable($scope.result.results.relativeEffects);
      },function(error) {
        console.log('my error');
      }
      ,function(update) {
        if ($.isNumeric(update)) {
          $scope.progress.percentage = update;
        }
      });


  };
  return dependencies.concat(ModelController);
});