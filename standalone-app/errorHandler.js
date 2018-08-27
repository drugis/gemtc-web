var logger = require('./logger');

module.exports = errorHandler;

function errorHandler(error, request, response, next) {
  logger.error(JSON.stringify(error.message, null, 2));
  response
    .status(error.statusCode)
    .send(error.message);
}
