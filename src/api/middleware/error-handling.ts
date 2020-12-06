import * as Errors from '../http-errors';
import * as express from 'express';

const CONTENT_TYPE = 'Content-Type';
const APPLICATION_JSON = 'application/json';

export interface GenericErrorJson {
  error: string;
  code: number;
}

export function logErrorHandler(): express.ErrorRequestHandler {
  return (err: any, _req: express.Request, _res: express.Response, next: express.NextFunction) => {
    // eslint-disable-next-line no-console
    console.error(err, `An unhandled error was intercepted`);
    next(err);
  };
}

/**
 * Returns a generic error message to end users
 */
export function finalErrorHandler(): express.ErrorRequestHandler {
  return (err: any, _req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (res.headersSent) {
      // important to allow default error handler to close connection if headers already sent
      return next(err);
    }

    if (!err.statusCode) err.statusCode = 500; // Sets a generic server error status code if none is part of the err

    res.set('Content-Type', APPLICATION_JSON);
    res.status(err.statusCode);
    const errorJson: GenericErrorJson = { error: 'An error occurred', code: err.statusCode };
    res.json(errorJson);

    return undefined;
  };
}

/**
 * Express error handling middleware to return JSON for special HTTP errors
 */
export const httpErrorsJsonErrorHandler: express.ErrorRequestHandler = (
  err: any,
  _req: express.Request,
  res: express.Response,
  next: express.NextFunction
  // eslint-disable-next-line consistent-return
) => {
  if (err instanceof Errors.HttpError) {
    if (res.headersSent) {
      // important to allow default error handler to close connection if headers already sent
      return next(err);
    }
    res.set(CONTENT_TYPE, APPLICATION_JSON);
    res.status(err.statusCode);
    const errorJson: GenericErrorJson = { error: err.message, code: err.statusCode };
    res.json(errorJson);
  } else {
    next(err);
  }
};
