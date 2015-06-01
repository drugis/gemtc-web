var db = require('./db');

module.exports = {
  findUserByGoogleId: function(googleUserId, callback) {
    db.query('SELECT * FROM UserConnection WHERE googleUserId=$1', [googleUserId], function(error, result) {
      var user;
      if (error) {
        console.log('error in userRepository.findUserByGoogleId; ' + error);
        user = null;
      } else if (result.rowCount === 1) {
        user = {
          userid: result.rows[0].userid
        };
      } else if (result.rowCount === 0) {
        user = null;
      }
      callback(error, user);
    });
  },
};