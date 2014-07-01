'use strict';
define(['angular', 'gemtc-web/lib/autobahn'], function(angular, ab) {
    var dependencies = ['$q'];
    var PataviService = function($q) {
      var BASE_URI = 'http://api.patavi.com/';

      var Task = function(task) {
        var resultsPromise = $q.defer();
        var self = this;
        this.results = resultsPromise.promise;

        var uri = task.uri;
        ab.connect(uri, function(session) {
          console.log('Connected to ' + uri, session.sessionid());
          // Subscribe to updates
          session.subscribe(BASE_URI + 'status#', function(topic, event) {
            resultsPromise.notify(event);
          });

          // Send-off RPC
          self.results = session.call(BASE_URI + 'rpc#').then(
            function(result) {
              resultsPromise.resolve(result);
              session.close();
            },
            function(reason, code) {
              console.log('error', code, reason);
              resultsPromise.reject(reason);
              session.close();
            }
          );

        }, function(code, reason) {
          resultsPromise.reject(reason);
          console.log(code, reason);
        });
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