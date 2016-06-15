'use strict';
define(['angular'], function() {
  var dependencies = ['$q', '$rootScope'];
  var ErrorInterceptor = function($q, $rootScope) {

    function handleReaction(rejection) {
      var data, message;

      // dirty work around to swallow error on patavi warm-up request, needs to be replaced in new error handeling
      if (rejection && rejection.config && rejection.config.url.indexOf('warm-up', rejection.config.url.length - rejection.config.url.length) !== -1) {
        return $q.resolve();
      }

      if (rejection && rejection.status === 404) {
        $rootScope.$broadcast('error', {
          code: 404,
          cause: rejection.data.error
        });
        return $q.reject(rejection);
      } else if (rejection && rejection.data && rejection.data !== "") {
        data = rejection.data;
        message = {
          code: data.code,
          cause: data.message
        };
      } else {
        message = {
          cause: 'An unknown error occurred'
        };
      }

      $rootScope.$broadcast('error', message);
      return $q.reject(rejection);
    }

    return {
      'requestError': function(rejection) {
        return handleReaction(rejection);
      },
      'responseError': function(rejection) {
        return handleReaction(rejection);
      }
    };
  };
  return dependencies.concat(ErrorInterceptor);
});
