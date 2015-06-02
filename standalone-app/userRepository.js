var
  db = require('./db'),
  logger = require('./logger');

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

var createUserConnection = '' +
  ' INSERT INTO UserConnection (tokenId, googleUserId, accessToken, expireTime, refreshToken, tokenType, userId)' +
  ' VALUES ($1, $2, $3, $4, $5, $6, $7)';

module.exports = {
  findUserByGoogleId: function(googleUserId, callback) {
    db.query(findUserByGoogleIdQuery, [googleUserId], function(error, result) {
      var user = null;
      if (error) {
        logger.error('error in userRepository.findUserByGoogleId; ' + error);
      } else if (result.rowCount === 1) {
        user = result.rows[0];
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
        if (error) {
          logger.error(error);
        } else {
          db.query(createUserConnection,
            [accessTokenExtra.id_token,
              googleUserMetadata.id,
              accessToken,
              accessTokenExtra.expires_in,
              accessTokenExtra.refresh_token,
              accessTokenExtra.token_type,
              result.rows[0].id
            ], callback);
        }
      });
  }
};
