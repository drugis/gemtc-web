'use strict';

define(['./controllers/modelController',
'./models/createModelController',
'./models/modelsController',
'./models/extendRunLengthController',
'./models/nodeSplitOverviewController',
'./models/createNodeSplitModelController',
'./models/createNetworkModelController',
'./models/addComparisonFunnelPlotController',
'./util/graphModalDirective/plotNavigationController',
'./models/setBaselineDistributionController', 
'angular'], function(
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
