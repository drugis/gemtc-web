'use strict';
define(['lodash'], function(_) {
  var dependencies = [
    '$scope',
    '$modalInstance',
    'name',
    'treatments',
    'callback'
  ];
  var EditTreatmentNameController = function(
    $scope,
    $modalInstance,
    name,
    treatments,
    callback
  ) {
    // functions
    $scope.cancel = $modalInstance.close;
    $scope.editName = editName;
    $scope.checkName = checkName;

    // init
    $scope.name = {
      new: name
    };

    function checkName(newName) {
      if (newName === '') {
        $scope.error = 'Name is empty';
      } else if (newName !== name && _.some(treatments, ['name', newName])) {
        $scope.error = 'Treatment with that name already exists';
      } else {
        $scope.error = undefined;
      }
    }

    function editName() {
      if ($scope.error) {
        return;
      }
      callback($scope.name.new);
      $modalInstance.close();
    }

  };
  return dependencies.concat(EditTreatmentNameController);
});
