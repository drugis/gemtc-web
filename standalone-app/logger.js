var winston = require('winston');

var logger = new (winston.Logger)({
    transports: [
      new (winston.transports.Console)({ level: process.argv[2] }),
    ]
  });

module.exports = logger;
