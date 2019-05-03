'use strict';
define([], function() {
  var dependencies = [
    '$scope',
    '$modalInstance',
    'analysisTitle',
    'callback'
  ];
  var EditAnalysisTitleController = function(
    $scope,
    $modalInstance,
    analysisTitle,
    callback
  ) {
    // functions
    $scope.cancel = $modalInstance.close;
    $scope.editTitle = editTitle;

    // init
    $scope.title = {
      new: analysisTitle
    };

    function editTitle() {
      callback($scope.title.new);
      $modalInstance.close();
    }

  };
  return dependencies.concat(EditAnalysisTitleController);
});
