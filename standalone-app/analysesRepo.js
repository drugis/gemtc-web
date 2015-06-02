var db = require('./db');

module.exports = {
  get: function(analysisId, callback) {
    db.query('SELECT * FROM analysis WHERE ID=$1', [analysisId], function(err, result) {
      callback(err, result)
    });
  },
  query: function() {
   db.query('SELECT * FROM analysis WHERE OWNER=$1', [ownerId], function(err, result) {
      callback(err, result)
    });
  }
}
