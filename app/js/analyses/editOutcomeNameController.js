'use strict';
define([], function() {
  var dependencies = [
    '$scope',
    '$modalInstance',
    'outcomeName',
    'callback'
  ];
  var EditOutcomeName = function(
    $scope,
    $modalInstance,
    outcomeName,
    callback
  ) {
    // functions
    $scope.cancel = $modalInstance.close;
    $scope.editOutcomeName = editOutcomeName;

    // init
    $scope.name = {
      new: outcomeName
    };

    function editOutcomeName() {
      if($scope.name.new === ''){
        return;
      }
      callback($scope.name.new);
      $modalInstance.close();
    }

  };
  return dependencies.concat(EditOutcomeName);
});
