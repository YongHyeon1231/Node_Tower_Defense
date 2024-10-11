import logger from '../../libs/logger.js';
import ApiError from '../../errors/api-error.js';

export default function (error, req) {
  let message = 'Internal Server Error';
  let statusCode = 500;
  if (error instanceof ApiError) {
    message = error.message;
    statusCode = error.statusCode;
  }
  logger.error(`Error occurred: ${req.url}/${req.method} => ${error}, Status Code: ${statusCode}`);
  return { message, statusCode };
}
