'use strict';
define([], function() {
  var dependencies = ['$scope'];
  var ModelController = function($scope) {
  	$scope.analyses = [{name: 'awesome'}]
  }
  return dependencies.concat(ModelController);
});