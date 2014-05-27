'use strict';
define(['underscore'], function() {
  var dependencies = ['$scope', '$stateParams', 'ModelResource', 'PataviService', 'ProblemResource'];
  var ModelController = function($scope, $stateParams, ModelResource, PataviService, ProblemResource) {
    $scope.model = ModelResource.get($stateParams);

    $scope.result = $scope.model.$promise.then(function() {
      return ProblemResource.get($stateParams).$promise;
    }).then(function(problem) {
      return PataviService.run(problem);
    });

  };
  return dependencies.concat(ModelController);
});