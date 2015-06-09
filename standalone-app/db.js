var pg = require('pg');
var logger = require('./logger');

module.exports = {
  query: function(text, values, callback) {
    pg.connect(process.env.GEMTC_DB_URL, function(err, client, done) {
      if(err) {
        logger.error(err);
        return done();
      }
      var query = client.query(text, values, function(err, result) {
        done();
        callback(err, result);
      });
    });
  }
}
