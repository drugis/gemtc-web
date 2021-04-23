'use strict';
define(['lodash'], function(_) {
  var dependencies = [
    '$scope',
    '$modalInstance',
    'studyTitle',
    'entries',
    'callback'
  ];
  var EditStudyTitleController = function(
    $scope,
    $modalInstance,
    studyTitle,
    entries,
    callback
  ) {
    // functions
    $scope.cancel = $modalInstance.close;
    $scope.editTitle = editTitle;
    $scope.checkTitle = checkTitle;

    // init
    $scope.title = {
      new: studyTitle
    };

    function checkTitle(newTitle) {
      if (newTitle === '') {
        $scope.error = 'Title is empty';
      } else if (newTitle !== studyTitle && _.some(entries, ['study', newTitle])) {
        $scope.error = 'Study with that title already exists';
      } else {
        $scope.error = undefined;
      }
    }

    function editTitle() {
      if ($scope.error) {
        return;
      }
      callback($scope.title.new);
      $modalInstance.close();
    }

  };
  return dependencies.concat(EditStudyTitleController);
});
