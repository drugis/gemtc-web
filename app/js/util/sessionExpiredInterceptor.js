'use strict';
define(['angular'], function() {
  var dependencies = ['$q', '$window', '$timeout', '$injector'];
  var SessionExpiredInterceptor = function($q, $window, $timeout, $injector) {
    return {
      responseError: function(response) {
        if (response.status === 403) {
          // sessionExpired i guess ?
          $window.location = '/signin.html';
        } else {
          console.log('response error ' + JSON.stringify(response));
          // can't directly DI $state because it's circular.
          $injector.get('$state').go('error');

        }
        return $q.reject(response);
      }
    }
  };
  return dependencies.concat(SessionExpiredInterceptor);
});
