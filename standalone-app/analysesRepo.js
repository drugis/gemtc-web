var db = require('./db');

module.exports = {
  get: function(analysisId, callback) {
    db.query('SELECT * FROM analyses WHERE ID=$1', analysisId, function(err, result) {
      callback(err, result)
    });
  },
  query: function() {}
}
