'use strict';
define(['moment', 'lodash'], function(moment, _) {
  var dependencies = ['$q', 'gemtcRootPath', 'AnalysisService', 'ModelService'];
  var RunLengthDirective = function($q, gemtcRootPath, AnalysisService, ModelService) {
    return {
      restrict: 'E',
      templateUrl: 'gemtc-web/models/runLength/runLength.html',
      scope: {
        problem: '=',
        model: '=',
        burnInIterations: '=',
        inferenceIterations: '=',
        thinningFactor: '=',
        isValidRunLength: '='
      },
      link: function($scope) {
        $scope.isRunlengthDivisibleByThinningFactor = isRunlengthDivisibleByThinningFactor;
        $scope.checkValidRunLength = checkValidRunLength;

        var asyncTasks = [$scope.problem.$promise];
        if ($scope.model.$promise) {
          asyncTasks.push($scope.model.$promise);
        }

        /*
         * createModel supplies a frontEndModel that needs to be cleaned,
         * the results controller supplies a cleaned model
         */
        function cleanModelIfNeeded(model) {
          if ($scope.model.modelType.mainType) {
            return ModelService.cleanModel($scope.model);
          }
          return model;
        }

        $q.all(asyncTasks).then(function() {
          $scope.$watch('model', function() {
            estimateHumanizedRunLength($scope.problem, $scope.model);
            checkValidRunLength();
          }, true); // deep watch
        });

        function estimateHumanizedRunLength(problem, model) {
          if ((model.modelType.mainType === 'pairwise' && model.modelType.subType === 'all-pairwise') ||
            (model.modelType.mainType === 'node-split' && model.modelType.subType === 'all-node-split')
          ) {
            var comparisonOptions = AnalysisService.createPairwiseOptions(problem);
            var nodeSplitOptions = AnalysisService.createNodeSplitOptions(problem);
            var modelBatch = ModelService.createModelBatch(model, comparisonOptions, nodeSplitOptions);
            $scope.estimatedRunLength = _.max(_.map(modelBatch, function(model) {
              return AnalysisService.estimateRunLength(problem, cleanModelIfNeeded(model));
            }));
          } else {
            $scope.estimatedRunLength = AnalysisService.estimateRunLength(problem, cleanModelIfNeeded(model));
          }
          $scope.estimatedRunLengthHumanized = moment.duration($scope.estimatedRunLength, 'seconds').humanize();
        }

        function isRunlengthDivisibleByThinningFactor() {
          return $scope.burnInIterations % $scope.thinningFactor === 0 &&
            $scope.inferenceIterations % $scope.thinningFactor === 0;
        }

        function checkValidRunLength() {
          // due to 'min' property on input fields, values are undefined if lower than that minimum value
          $scope.isValidRunLength = $scope.burnInIterations &&
            $scope.inferenceIterations &&
            isRunlengthDivisibleByThinningFactor() &&
            $scope.estimatedRunLength <= 300 &&
            $scope.burnInIterations >= 1000 &&
            $scope.inferenceIterations >= 1000 &&
            ($scope.inferenceIterations / $scope.thinningFactor) >= 1000;
        }
      }
    };
  };
  return dependencies.concat(RunLengthDirective);
});
