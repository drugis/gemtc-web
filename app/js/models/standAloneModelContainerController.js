'use strict';
define([], function() {
  var dependencies = ['$scope', '$stateParams', 'ModelResource'];
  var StandAloneModelContainerController = function($scope, $stateParams, ModelResource) {
    // $scope.model = ModelResource.get($stateParams);
  }
  return dependencies.concat(StandAloneModelContainerController);
});
