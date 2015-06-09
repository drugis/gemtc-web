
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

child.on('watch:restart', function(info) {
    console.error('Restarting script because ' + info.file + ' changed');
});

child.on('restart', function() {
    console.error('Forever restarting script, time #' + child.times);
});

child.on('exit:code', function(code) {
    console.error('Forever detected script exited with code ' + code);
});

child.start();
