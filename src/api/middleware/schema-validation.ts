import * as express from 'express';
import { FieldErrors, ValidateError } from '@tsoa/runtime';

export interface ValidationErrorJson {
  msg: string;
  technicalDetails: {
    msg: string;
    errors: string[];
  };
}

/**
 *
 * intercept tsoa ValidateErrors and return something more useful to called
 */
export function schemaValidationErrorHandler(): express.ErrorRequestHandler {
  // eslint-disable-next-line consistent-return
  return (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err instanceof ValidateError) {
      res.status(422).send({
        msg: 'Invalid request',
        technicalDetails: {
          msg: 'Validation failed',
          errors: formatFieldErrors(err.fields),
        },
      });
      return next();
    }
    next(err); // pass error on if not a validation error
  };
}

function formatFieldErrors(fieldErrors: FieldErrors): string[] {
  return Object.entries(fieldErrors).map(
    ([name, value]) => `${name} - ${formatIndividualFieldError(value)}`
  );
}

function formatIndividualFieldError(fieldErrorDetails: { message: string; value?: any }): string {
  // usually something like
  // {
  //   "message": "\"NotAnExpected\" is an excess property and therefore is not allowed",
  //   "value": "NotAnExpected"
  // }
  let result = fieldErrorDetails.message;

  if (fieldErrorDetails.value !== undefined) {
    result += `(provided : "${fieldErrorDetails.value}")`;
  }
  return result;
}
