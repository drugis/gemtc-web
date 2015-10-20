'use strict';
define(['angular'], function() {
	var dependencies = ['$q', '$rootScope'];
	var ErrorInterceptor = function($q, $rootScope) {

		function handleReaction(rejection) {
			var data, message;
			if (rejection && rejection.data && rejection.data !== "") {
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
