'use strict';
define(['angular', 'gemtc-web/lib/autobahn'], function(angular, ab) {
    var dependencies = ['$q', 'GEMTC_PATAVI_WS'];
    var PataviService = function($q, GEMTC_PATAVI_WS) {
      var BASE_URI = 'http://api.patavi.com/';

      var Task = function(method, payload) {
        var resultsPromise = $q.defer();
        var self = this;
        this.results = resultsPromise.promise;

        var session = ab.connect(GEMTC_PATAVI_WS, function(session) {
          console.log("Connected to " + GEMTC_PATAVI_WS, session.sessionid());
          // Subscribe to updates
          session.subscribe(BASE_URI + "status#", function(topic, event) {
            resultsPromise.notify(event);
          });

          // Send-off RPC
          self.results = session.call(BASE_URI + "rpc#", method, payload).then(
            function(result) {
              resultsPromise.resolve(result);
              session.close();
            },
            function(reason, code) {
              console.log("error", code, reason);
              resultsPromise.reject(reason);
              session.close();
            }
          );

        }, function(code, reason) {
          resultsPromise.reject(reason);
          console.log(code, reason);
        });
      };

      var run = function(problem) {
        var task = new Task('gemtc', problem);
        return task.results;
      };

      return {
        run: run
      };

    };
    return dependencies.concat(PataviService);
  });