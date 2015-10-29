'use strict';
define(['moment'], function(moment) {
  var dependencies = ['$q', 'gemtcRootPath', 'AnalysisService', 'ModelService'];
  var RunLengthDirective = function($q, gemtcRootPath, AnalysisService, ModelService) {
    return {
      restrict: 'E',
      templateUrl: gemtcRootPath + 'js/models/runLength/runLength.html',
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

        $scope.model.$promise.then(function(model) {
          $scope.model = model;
        })

        $q.all([$scope.model.$promise, $scope.problem.$promise]).then(function() {
          $scope.$watch('model', function() {
            estimateHumanizedRunLength();
            checkValidRunLength($scope.model);
          }, true); // deep watch 
        });

        function estimateHumanizedRunLength() {
          if (($scope.model.modelType.mainType === 'pairwise' && $scope.model.modelType.subType === 'all-pairwise') ||
            ($scope.model.modelType.mainType === 'node-split' && $scope.model.modelType.subType === 'all-node-split')
          ) {
            var comparisonOptions = AnalysisService.createPairwiseOptions($scope.problem);
            var nodeSplitOptions = AnalysisService.createNodeSplitOptions($scope.problem);
            var modelBatch = createModelBatch($scope.model, comparisonOptions, nodeSplitOptions);
            $scope.estimatedRunLength = _.max(_.map(modelBatch, function(model) {
              return AnalysisService.estimateRunLength($scope.problem, model);
            }));
          } else {
            $scope.estimatedRunLength = AnalysisService.estimateRunLength($scope.problem, $scope.model);
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
            $scope.estimatedRunLength <= 300;
        }
      }
    };
  };
  return dependencies.concat(RunLengthDirective);
});