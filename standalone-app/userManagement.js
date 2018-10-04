'use strict';
module.exports = function(db) {

  function findOrCreateUser(accessToken, refreshToken, googleUser, callback) {
    function userTransaction(client, callback) {
      client.query(
        'SELECT id, username, firstName, lastName FROM Account WHERE account.username = $1 OR account.email = $2',
        [googleUser.id, googleUser.emails[0].value],
        function(error, result) {
          if (error) {
            return callback(error);
          }
          if (result.rows.length === 0) {
            client.query(
              'INSERT INTO Account (username, name, firstName, lastName) VALUES ($1, $2, $3, $4) RETURNING id ',
              [googleUser.id, googleUser.name.givenName + ' ' + googleUser.name.familyName, googleUser.name.givenName, googleUser.name.familyName],
              function(error, result) {
                if (error) {
                  return callback(error);
                }
                var row = result.rows[0];
                return callback(null, {
                  id: row.id,
                  username: googleUser.id,
                  firstname: googleUser.name.givenName,
                  lastname: googleUser.name.familyName,
                  userPicture: googleUser.photos[0] ? googleUser.photos[0].value : process.env.MCDA_HOST + '/public/images/defaultUser.png'
                });
              });
          } else if (!result.rows[0].username) {
            client.query(
              'UPDATE ACCOUNT SET username = $1 WHERE id = $2',
              [googleUser.id, result.rows[0].id],
              function(error) {
                if (error) {
                  return callback(error);
                }
                var user = result.rows[0];
                user.username = googleUser.id;
                user.userPicture = googleUser.photos[0] ? googleUser.photos[0].value : process.env.MCDA_HOST + '/public/images/defaultUser.png';
                callback(null, user);
              }
            );
          } else {
            var user = result.rows[0];
            user.userPicture = googleUser.photos[0] ? googleUser.photos[0].value : process.env.MCDA_HOST + '/public/images/defaultUser.png';
            callback(null, user);
          }
        });
    }

    db.runInTransaction(userTransaction, function(error, result) {
      if (error) {
        return callback(error);
      }
      callback(null, result);
    });
  }

  function findUserById(id, callback) {
    findUserByProperty('id', id, callback);
  }

  function findUserByEmail(email, callback) {
    findUserByProperty('email', email, callback);
  }

  // private
  function findUserByProperty(property, value, callback) {
    db.query('SELECT id, username, firstName, lastName, email FROM Account WHERE ' + property + ' = $1', [value], function(error, result) {
      if (error) {
        callback(error);
      } else if (result.rows.length === 0) {
        callback(property + ' ' + value + ' not found');
      } else {
        callback(null, result.rows[0]);
      }
    });
  }

  return {
    findOrCreateUser: findOrCreateUser,
    findUserById: findUserById,
    findUserByEmail: findUserByEmail
  };
};
