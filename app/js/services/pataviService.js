'use strict';
define(['angular'], function() {
  var dependencies = ['gemtc-web/lib/patavi'];
  var PataviService = function(patavi) {

    var run = function(problem) {
      console.log('fdszkjdfskgjsfdlkvgjsf;lkvjfdklj');
      var task = patavi.submit('gemtc', problem.entries);
      return task.results.promise;
    };

    return {
      run: run
    };

  };
  return dependencies.concat(PataviService);
});