'use strict';
define(['angular'], function() {
  var dependencies = ['$q', '$window', '$injector'];
  var SessionExpiredInterceptor = function($q, $window, $injector) {
    return {
      responseError: function(response) {
        if (response.status === 403) {
          // sessionExpired i guess ?
          $window.location = '/signin.html';
        } else {
          return $q.reject(response);

          /*
          // deprecated in favor of passing error on to more general interceptor 
          */

          //   console.error('response error ' + JSON.stringify(response));
          //   // can't directly DI $state because it's circular.
          //   $injector.get('$state').go('error');
        }



      }
    }
  };
  return dependencies.concat(SessionExpiredInterceptor);
});