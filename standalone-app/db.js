var pg = require('pg');

module.exports = {
  query: function(text, values, callback) {
    pg.connect(function(err, client, done) {
      var query = client.query(text, values, function(err, result) {
        done();
        callback(err, result);
      });

      setImmediate(function() {
        pg.cancel(client.connectionParameters, client, query);
      });
    });
  }
}
