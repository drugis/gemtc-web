'use strict';
define(['underscore'], function() {
  var dependencies = ['$scope'];
  var ModelController = function($scope) {

    $scope.analysis = $scope.$parent.analysis;
    $scope.project = $scope.$parent.project;
    $scope.$parent.loading = {
      loaded: false
    };

  };
  return dependencies.concat(ModelController);
});