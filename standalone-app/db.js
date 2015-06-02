var pg = require('pg');

module.exports = {
  query: function(text, values, callback) {
    pg.connect('postgres://gemtc:develop@localhost/gemtc',function(err, client, done) {
      var query = client.query(text, values, function(err, result) {
        done();
        callback(err, result);
      });
    });
  }
}
