'use strict';
var requires = [
  'gemtc-web/controllers/modelController',
  'gemtc-web/models/createModelController',
  'gemtc-web/models/modelsController',
  'gemtc-web/models/extendRunLengthController',
  'gemtc-web/models/nodeSplitOverviewController',
  'gemtc-web/models/createNodeSplitModelController',
  'gemtc-web/models/createNetworkModelController',
  'gemtc-web/models/addComparisonFunnelPlotController',
  'gemtc-web/util/graphModalDirective/plotNavigationController',
  'gemtc-web/models/setBaselineDistributionController'
];
define(requires.concat(['angular']), function(
  ModelController,
  CreateModelController,
  ModelsController,
  ExtendRunLengthController,
  NodeSplitOverviewController,
  CreateNodeSplitModelController,
  CreateNetworkModelController,
  AddComparisonFunnelPlotController,
  PlotNavigationController,
  SetBaselineDistributionController,
  angular) {
  return angular.module('gemtc.controllers', [])
    .controller('ModelController', ModelController)
    .controller('CreateModelController', CreateModelController)
    .controller('ModelsController', ModelsController)
    .controller('ExtendRunLengthController', ExtendRunLengthController)
    .controller('NodeSplitOverviewController', NodeSplitOverviewController)
    .controller('CreateNodeSplitModelController', CreateNodeSplitModelController)
    .controller('CreateNetworkModelController', CreateNetworkModelController)
    .controller('AddComparisonFunnelPlotController', AddComparisonFunnelPlotController)
    .controller('PlotNavigationController', PlotNavigationController)
    .controller('SetBaselineDistributionController', SetBaselineDistributionController)

  ;
});