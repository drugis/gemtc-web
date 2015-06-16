'use strict';

define(function (require) {
  var angular = require('angular');
  var dependencies = ['ngResource'];

  return angular.module('gemtc.models', dependencies)
  	// controllers
  	.controller('ModelsController', require('models/modelsController'))
  	.controller('AddModelController', require('models/addModelController'))
    .controller('StandAloneModelContainerController', require('models/standAloneModelContainerController'))

    // resources
    .factory('ModelResource', require('models/standaloneModelResource'))
    .factory('ProblemResource', require('models/standaloneProblemResource'))
    ;
});
