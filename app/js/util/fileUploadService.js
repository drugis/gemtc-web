'use strict';
define(['angular'], function () {
  var dependencies = ['CSVParseService', 'ProblemValidityService'];

  var FileUploadService = function (CSVParseService, ProblemValidityService) {
    function processFile(problemFile) {
      var uploadResult;
      if (problemFile.extension === 'csv') {
        uploadResult = CSVParseService.parse(problemFile.contents);
      } else if (problemFile.extension === 'json') {
        uploadResult = ProblemValidityService.parse(problemFile.contents);
      } else {
        uploadResult = {
          isValid: false,
          message: problemFile.extension + ' files are not supported. Please use .json or .csv.'
        };
      }

      if (uploadResult.isValid) {
        uploadResult = ProblemValidityService.getValidity(uploadResult.problem);
      }
      return uploadResult;
    }

    return {
      processFile: processFile
    };
  };
  return dependencies.concat(FileUploadService);
});
