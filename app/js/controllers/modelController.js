'use strict';
define(['underscore'], function() {
  var dependencies = ['$scope', '$stateParams', 'ModelResource'];
  var ModelController = function($scope, $stateParams, ModelResource) {
    $scope.model = ModelResource.get($stateParams);
  };
  return dependencies.concat(ModelController);
});