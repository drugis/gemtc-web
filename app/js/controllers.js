'use strict';
define(function(require) {
  var angular = require('angular');
  return angular.module('gemtc.controllers', [])
    .controller('ModelController', require('gemtc-web/controllers/modelController'))
    .controller('CreateModelController', require('gemtc-web/models/createModelController'))
    .controller('ModelsController', require('gemtc-web/models/modelsController'))
    .controller('ExtendRunLengthController', require('gemtc-web/models/extendRunLengthController'))
    .controller('NodeSplitOverviewController', require('gemtc-web/models/nodeSplitOverviewController'))
    .controller('CreateNodeSplitModelController', require('gemtc-web/models/createNodeSplitModelController'))
    .controller('CreateNetworkModelController', require('gemtc-web/models/createNetworkModelController'))
    .controller('AddComparisonFunnelPlotController', require('gemtc-web/models/addComparisonFunnelPlotController'))
    .controller('PlotNavigationController', require('gemtc-web/util/graphModalDirective/plotNavigationController'))
    .controller('SetBaselineDistributionController', require('models/setBaselineDistributionController'))
    ;
});
