var db = require('./db');

module.exports = {
  findUserByGoogleId: function(googleUserId, callback) {
    db.query('SELECT * FROM UserConnection WHERE userId=$1', [googleUserId], function(err, result) {
      // todo create user from result set and return user as result
      callback(err, result);
    });
  },
}