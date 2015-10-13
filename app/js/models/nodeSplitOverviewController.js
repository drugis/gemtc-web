'use strict';
define([], function() {
  var dependencies = ['$scope', '$stateParams', '$state', 'models'];
  var NodeSplitOverviewController = function($scope, $stateParams, $state, models) {

    $scope.models = models;
    $scope.goToModel = goToModel;

    $scope.model.$promise.then(function() {
      $scope.relevantSplitModels = _.filter(models, _.partial(isRelevantComparison, $scope.model));
    })


    function isRelevantComparison(base, candidate) {
      return (candidate.id !== base.id && // filter self
        (candidate.modelType.type === 'node-split' || candidate.modelType.type === 'network') &&
        candidate.likelihood === base.likelihood &&
        candidate.linearModel === base.linearModel &&
        candidate.link === base.link);

      //todo
      // If multiple models match for a comparison, use the newest. need to store run dateTime
    }

    function goToModel(modelId) {
      var goToModelParams = angular.copy($stateParams);
      goToModelParams.modelId = modelId;
      $state.go('model', goToModelParams);
    }


  };

  return dependencies.concat(NodeSplitOverviewController);
});