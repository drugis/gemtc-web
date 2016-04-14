'use strict';
define(['angular', 'gemtc-web/lib/autobahn'], function(angular, ab) {
  var dependencies = ['$q', '$http'];
  var PataviService = function($q, $http) {
    var BASE_URI = 'http://api.patavi.com/';

    var Task = function(task) {
      var resultsPromise = $q.defer();
      var self = this;
      this.results = resultsPromise.promise;

      var uri = task.uri;
      console.log(task);

      function getResults(url) {
        $http.get(url).then(function(response) {
          resultsPromise.resolve(response.data);
        });
      }

      var socket = new WebSocket(uri.replace(/^http/, "ws") + '/updates');
      socket.onmessage = function (event) {
        var data = JSON.parse(event.data);
        if (data.eventType === "done") {
          console.log("done");
          socket.close();
          getResults(uri + "/results");
        } else if (data.evenType === "failed") {
          console.log("error", data.eventData);
          resultsPromise.reject(data.eventData);
          socket.close();
        } else {
          console.log(data);
          resultsPromise.notify(data.eventData);
        }
      }
    };

    var run = function(task) {
      var deferred = $q.defer();
      task.$promise.then(function(resolvedTask) {
        deferred.resolve(new Task(resolvedTask).results);
      });
      return deferred.promise;
    };

    return {
      run: run
    };

  };
  return dependencies.concat(PataviService);
});
