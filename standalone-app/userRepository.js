var db = require('./db');

var findUserByGoogleIdQuery = '' +
  ' SELECT' +
  '   email, name, firstName, lastName ' +
  ' FROM ' +
  '   UserConnection LEFT JOIN Account ' +
  ' ON ' +
  '   UserConnection.userid = Account.id ' +
  ' WHERE ' +
  '   googleUserId=$1';

var createAccountQuery = '' +
  ' INSERT INTO Account (email, name, firstName, lastName)' +
  ' VALUES ($1, $2, $3, $4) ' +
  ' RETURNING id';

module.exports = {
  findUserByGoogleId: function(googleUserId, callback) {
    db.query(findUserByGoogleIdQuery, [googleUserId], function(error, result) {
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
  createUserAndConnection: function(accessToken, accessTokenExtra, googleUserMetadata, callback) {
    db.query(createAccountQuery, [googleUserMetadata.email,
        googleUserMetadata.name,
        googleUserMetadata.given_name,
        googleUserMetadata.family_name
      ],
      function(error, result) {
        if(error) {
          console.log(error);
        } else {
          console.log('createUserAndConnection succes ' + result);
        }
        callback(error, result);
      });
  }
};