'use strict';
define(['angular'], function() {
	var dependencies = ['$q', '$rootScope'];
	var ErrorInterceptor = function($q, $rootScope) {

		function handelReaction(rejection) {
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
				return handelReaction(rejection);
			},
			'responseError': function(rejection) {
				return handelReaction(rejection);
			}
		};
	};
	return dependencies.concat(ErrorInterceptor);
});