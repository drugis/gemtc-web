'use strict';
define([], function() {
  var dependencies = [
    '$scope',
    '$modalInstance',
    'modelTitle',
    'callback'
  ];
  var EditModelTitleController = function(
    $scope,
    $modalInstance,
    modelTitle,
    callback
  ) {
    // functions
    $scope.cancel = $modalInstance.close;
    $scope.editTitle = editTitle;

    // init
    $scope.title = {
      new: modelTitle
    };

    function editTitle() {
      if($scope.title.new === ''){
        return;
      }
      callback($scope.title.new);
      $modalInstance.close();
    }

  };
  return dependencies.concat(EditModelTitleController);
});
