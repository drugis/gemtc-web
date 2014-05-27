'use strict';

define(['gemtc-web/lib/autobahn', 'gemtc-web/lib/when', 'GEMTC_PATAVI_WS'],
  function(ab, when, GEMTC_PATAVI_WS) {
    return (function() {
      var BASE_URI = 'http://api.patavi.com/';

      var Task = function(method, payload) {
        var resultsPromise = when.defer();
        var self = this;
        this.results = resultsPromise.promise;

        var session = ab.connect(GEMTC_PATAVI_WS, function(session) {
          // console.log("Connected to " + WS_URI, session.sessionid());
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
          // console.log(code, reason);
        });
      };

      var patavi = {
        submit: function(method, payload) {
          return new Task(method, payload);
        }
      };

      return patavi;
    }());
  });