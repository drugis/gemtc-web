var logger = require('./logger');

module.exports = errorHandler;

function errorHandler(error, request, response, next) {
  logger.error(JSON.stringify(error.message));
  response.sendStatus(error.statusCode);
} 