define([], function() {

  var dependencies = ['$resource'];
  var UserResource = function($resource) {
    return $resource('/user');
  };

  return dependencies.concat(UserResource);

});
