'use strict';
define(['lodash'], function(_) {
  var dependencies = ['$scope', '$q', '$stateParams', '$state', '$location',
    'AnalysisResource', 'ModelResource', 'AnalysisService', 'ProblemResource'];
  var CreateModelController = function($scope, $q, $stateParams, $state, $location,
    AnalysisResource, ModelResource, AnalysisService, ProblemResource) {

    var problemDefer = ProblemResource.get($stateParams);

    AnalysisService.createPairwiseOptions(problemDefer.$promise).then(function(result) {
      $scope.comparisonOptions = result;
    });

    $scope.model = {
      linearModel: 'random',
      modelType: {
        type: 'network'
      }
    };
    $scope.createModel = createModel;
    $scope.isAddButtonDisabled = isAddButtonDisabled;


    function isAddButtonDisabled(model) {
      return !model ||
        !model.title ||
        !!$scope.isAddingModel;
    }

    function createModelBatch(modelBase) {
      return _.map($scope.comparisonOptions, function(comparisonOption) {
        return {
          title: modelBase.title + ' (' + comparisonOption.from.name + ' - ' + comparisonOption.to.name + ')',
          linearModel: modelBase.linearModel,
          modelType: {
            type: 'pairwise'
          },
          pairwiseComparison: comparisonOption
        };
      });
    }

    function createModel(model) {
      $scope.isAddingModel = true;
      if (model.modelType.type === 'all-pairwise') {
        var modelsToCreate = createModelBatch(model);
        var creationPromises = _.map(modelsToCreate, function(modelToCreate) {
          return createAndPostModel(modelToCreate, function() {});
        });
        $q.all(creationPromises).then(function() {
          $scope.isAddingModel = false;
          $state.go('networkMetaAnalysis', $stateParams);
        });
      } else {
        createAndPostModel(model, function(result, headers) {
          $scope.isAddingModel = false;
          // Call to replace is needed to have backbutton skip the createModel view when going back from the model View
          $location.url(headers().location).replace();
        });
      }
    }

    function createAndPostModel(model, successFunction) {
      if (model.modelType.type === 'pairwise') {
        model.modelType.details = {
          from: model.pairwiseComparison.from.name,
          to: model.pairwiseComparison.to.name
        };
      }
      var pureModel = _.omit(model, 'pairwiseComparison');
      return ModelResource.save($stateParams, pureModel, successFunction).$promise;

    }
  };

  return dependencies.concat(CreateModelController);
});
