'use strict';
define(['angular'], function() {
  var dependencies = ['$q', '$window'];
  var SessionExpiredInterceptor = function($q, $window) {
    return {
      responseError: function(response) {
        if(response.status === 403) {
          // sessionExpired i guess ? 
          $window.location = '/signin.html';
        }
        return $q.reject(response);
      }
    }
  };
  return dependencies.concat(SessionExpiredInterceptor);
});