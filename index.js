
var forever = require('forever-monitor');

var maxRestarts = 3;

var child = new (forever.Monitor)('gemtc.js', {
  max: maxRestarts,
  silent: false,
  args: []
});

child.on('exit', function() {
  console.log('gemtc.js has exited after ' + maxRestarts + ' restarts');
});

child.start();
