/* eslint-disable no-console */
/* eslint-disable no-underscore-dangle */
import { Request, RequestHandler } from 'express';
import { OutgoingHttpHeaders } from 'http';

// there are some properties we add to requests ... this type makes them available in a strongly-typed way
type RequestWithCustomProps = Request & {
  requestId?: string;
  _logging?: boolean;
};

/**
 * based on `connect-logger` from log4js, but simplified for our needs
 * @param logger
 */
export function timeAndLogHttpRequests(): RequestHandler {
  return (req, res, next) => {
    const request = req as RequestWithCustomProps;
    // mount safety
    if (request._logging) {
      return next();
    }

    const start = new Date().getTime();
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const writeHead = res.writeHead;

    // flag as logging
    request._logging = true;

    // proxy for statusCode.
    (res as any).writeHead = (code: number, headers?: OutgoingHttpHeaders) => {
      res.writeHead = writeHead;
      res.writeHead(code, headers);

      (res as any).__statusCode = code;
      (res as any).__headers = headers || {};
      return res;
    };

    // hook on end request to emit the log entry of the HTTP request.
    res.on('finish', () => {
      const responseTime = new Date().getTime() - start;
      // status code response level handling

      const requestInfo = {
        requestMethod: request.method,
        requestUrl: request.originalUrl || request.url,
        requestStatus: (res as any).__statusCode || res.statusCode,
        requestDurationMs: responseTime,
      };

      // ':method :url returned :status in :response-time ms',
      if (res.statusCode && res.statusCode >= 400) {
        console.warn(
          `${requestInfo.requestMethod} ${requestInfo.requestUrl} returned ${requestInfo.requestStatus} in ${requestInfo.requestDurationMs} ms`,
          requestInfo
        );
      } else if (res.statusCode && res.statusCode >= 500) {
        console.error(
          `${requestInfo.requestMethod} ${requestInfo.requestUrl} returned ${requestInfo.requestStatus} in ${requestInfo.requestDurationMs} ms`,
          requestInfo
        );
      } else {
        console.log(
          `${requestInfo.requestMethod} ${requestInfo.requestUrl} returned ${requestInfo.requestStatus} in ${requestInfo.requestDurationMs} ms`,
          requestInfo
        );
      }
    });

    // ensure next gets always called
    return next();
  };
}
