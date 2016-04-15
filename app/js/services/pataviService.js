'use strict';
define(['angular', 'gemtc-web/lib/autobahn'], function(angular, ab) {
  var dependencies = ['$q', '$http'];
  var PataviService = function($q, $http) {
    var Task = function(task) {
      var resultsPromise = $q.defer();
      var self = this;
      this.results = resultsPromise.promise;

      var uri = task.uri;
      console.log(task);

      function getResults(url, done) {
        $http.get(url).then(function(response) {
          done(response.data);
        });
      }

      var socket = new WebSocket(uri.replace(/^https/, "wss") + '/updates');
      socket.onmessage = function (event) {
        var data = JSON.parse(event.data);
        if (data.eventType === "done") {
          console.log("done");
          socket.close();
          getResults(data.eventData.href, resultsPromise.resolve);
        } else if (data.evenType === "failed") {
          console.log("error");
          socket.close();
          getResults(data.eventData.href, resultsPromise.reject)
        }
        console.log(data);
        resultsPromise.notify(data.eventData);
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
