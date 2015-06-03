var db = require('./db');

module.exports = {
  get: function(analysisId, callback) {
    db.query('SELECT * FROM analysis WHERE ID=$1', [analysisId], function(err, result) {
      callback(err, result)
    });
  },
  query: function(ownerAccountId, callback) {
   db.query('SELECT * FROM analysis WHERE OWNER=$1', [ownerAccountId], function(err, result) {
      callback(err, result)
    });
  }
}
