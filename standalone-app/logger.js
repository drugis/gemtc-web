'use strict';
var winston = require('winston');

const logger = winston.createLogger({
  level: 'debug',
  format: winston.format.simple(),
  transports: [
    //
    // - Write to all logs with level `info` and below to `combined.log` 
    // - Write all logs error (and below) to `error.log`.
    //
    new winston.transports.File({ filename: './error.log', level: 'error' }),
    new winston.transports.File({ filename: './combined.log' }),
    new winston.transports.Console()
  ]
});

module.exports = logger;