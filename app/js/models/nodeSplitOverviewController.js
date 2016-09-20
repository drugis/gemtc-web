'use strict';
define(['angular', 'lodash'], function(angular, _) {
  var dependencies = ['$scope', '$q', '$stateParams', '$state', '$modal', 'gemtcRootPath',
    'models', 'problem', 'AnalysisService', 'ModelResource', 'NodeSplitOverviewService', 'PataviService'
  ];
  var NodeSplitOverviewController = function($scope, $q, $stateParams, $state, $modal, gemtcRootPath,
    models, problem, AnalysisService, ModelResource, NodeSplitOverviewService, PataviService) {

    $scope.goToModel = goToModel;
    $scope.openCreateNodeSplitDialog = openCreateNodeSplitDialog;
    $scope.openCreateNetworkDialog = openCreateNetworkDialog;
    $scope.networkModelResultsDefer = $q.defer();
    $scope.baseModelNotShown = false;

    $scope.modelPromise.then(function(model) {
      $scope.model = model;
      var networkModel;
      $scope.analysis.$promise.then(buildComparisonRows).then(function() {
        $scope.baseModelNotShown = model.modelType.type === 'node-split' && !_.some($scope.comparisons, ['modelId', model.id]);
      });
      if (model.modelType.type === 'node-split') {
        networkModel = findNetworkModelForModel(model, models);
        if (networkModel) {
          $scope.networkStateParams = _.omit($stateParams, 'modelid');
          $scope.networkStateParams.modelId = networkModel.id;
          $scope.networkModel = networkModel;
        }
      } else {
        $scope.networkModel = $scope.model;
        $scope.networkStateParams = $stateParams;
      }

      if ($scope.networkModel) {
        if ($scope.networkModel.taskUrl) {
          findModelResult($scope.networkModel.taskUrl).then(function(result) {
            if (result) {
              $scope.networkModel.result = result;
            }
            $scope.networkModelResultsDefer.resolve(result);
          });
        }
      }
    });

    function buildComparisonRows() {
      $scope.comparisons = _.map(AnalysisService.createNodeSplitOptions(problem), function(comparison) {
        var row = comparison;
        row.colSpan = 6;
        row.label = comparison.label;
        row.from = comparison.from;
        row.to = comparison.to;
        var model = findModelForComparison(comparison, models);

        if (model) {
          row.modelTitle = model.title;
          row.modelId = model.id;
          row.hasModel = true;
          if (model.taskUrl) {
            findModelResult(model.taskUrl).then(function(result) {
              if (result) {
                row.result = result;
                row.directEffectEstimate = NodeSplitOverviewService.buildDirectEffectEstimates(result);
                row.inDirectEffectEstimate = NodeSplitOverviewService.buildIndirectEffectEstimates(result);
                row.colSpan = 1;
                row.hasResults = true;
              } else {
                row.colSpan = 3;
              }
            });

            $scope.networkModelResultsDefer.promise.then(function(result) {
              if (result) {
                row.consistencyEstimate = NodeSplitOverviewService.buildConsistencyEstimates(result, row);
              }

            });
          }
        }
        return row;
      });
    }

    function findNetworkModelForModel(nodeSplitModel, models) {
      return _.find(models, function(model) {
        return model.modelType.type === 'network' && isSameModelSettings(nodeSplitModel, model);
      });
    }

    function isSameModelSettings(model1, model2) {
      return (
        model1.likelihood === model2.likelihood &&
        model1.link === model2.link &&
        model1.linearModel === model2.linearModel &&
        model1.outcomeScale === model2.outcomeScale
      );
    }

    function findModelResult(taskUrl) {
      return PataviService.listen(taskUrl);
    }

    function findModelForComparison(comparison, models) {
      return _.find(models, function(model) {
        // todo: model settings should be equal.
        return isSameModelSettings(model, $scope.model) && (
          model.modelType.type === 'node-split' &&
          model.modelType.details.from.id === comparison.from.id &&
          model.modelType.details.to.id === comparison.to.id
        );
      });
    }

    function goToModel(modelId) {
      var goToModelParams = angular.copy($stateParams);
      goToModelParams.modelId = modelId;
      $state.go('model', goToModelParams);
    }

    function openCreateNetworkDialog() {
      $modal.open({
        windowClass: 'small',
        templateUrl: gemtcRootPath + 'js/models/createModelFromBase.html',
        scope: $scope,
        controller: 'CreateNetworkModelController',
        resolve: {
          baseModel: function() {
            return angular.copy($scope.model);
          },
          problem: function() {
            return problem;
          },
          successCallback: function() {
            return function() {
              // reload page, with empty params object
              $state.go($state.current, {}, {
                reload: true
              });
            };
          }
        }
      });
    }

    function openCreateNodeSplitDialog(comparison) {
      $modal.open({
        windowClass: 'small',
        templateUrl: gemtcRootPath + 'js/models/createModelFromBase.html',
        scope: $scope,
        controller: 'CreateNodeSplitModelController',
        resolve: {
          baseModel: function() {
            return angular.copy($scope.model);
          },
          problem: function() {
            return problem;
          },
          comparison: function() {
            return comparison;
          },
          successCallback: function() {
            return function() {
              // reload page, with empty params object
              $state.go($state.current, {}, {
                reload: true
              });
            };
          }
        }
      });
    }


  };

  return dependencies.concat(NodeSplitOverviewController);
});
