import * as path from 'path';

import express, { Express } from 'express';
import {
  finalErrorHandler,
  httpErrorsJsonErrorHandler,
  logErrorHandler,
} from './middleware/error-handling';
import { BearerAuthenticationProvider } from './auth/BearerAuthenticationProvider';
import { CompositionRoot } from '../composition-root';
import { RegisterAuth } from './tsoa-auth';
import { RegisterControllerFactory } from './tsoa-ioc';
import { RegisterRoutes } from './tsoa-routes.generated';
import { TsoaAuthentication } from './auth/TsoaAuthentication';
import { schemaValidationErrorHandler } from './middleware/schema-validation';
import swaggerUi from 'swagger-ui-express';
import { timeAndLogHttpRequests } from './middleware/request-logging';

export function buildWebApp(compositionRoot: CompositionRoot): Express {
  const app: Express = express();

  app.use(timeAndLogHttpRequests());

  // serve the `swagger-ui` at `/docs` + allow download of spec at `/docs/swagger.yaml`
  app.use(
    '/docs',
    // make files from `docs` folder available (swagger.yaml)
    express.static(path.join(__dirname, '../../docs/'), {
      index: false,
    }),
    swaggerUi.serve,
    swaggerUi.setup(undefined, {
      swaggerOptions: {
        url: 'swagger.yaml',
      },
    })
  );

  app.use(express.json({ limit: '500kb' }));
  app.use(express.urlencoded({ extended: true }));

  RegisterControllerFactory(compositionRoot);
  RegisterRoutes(app);
  RegisterAuth(new TsoaAuthentication([new BearerAuthenticationProvider()]));

  // -- ERROR HANDLING --
  // (must be at the end)

  // Error handler for validation errors
  app.use(schemaValidationErrorHandler());
  // turn Typescript-rest errors into JSON
  app.use(httpErrorsJsonErrorHandler);
  // fallback / log any unhandled error
  app.use(logErrorHandler());
  // return a generic error message
  app.use(finalErrorHandler());

  return app;

  return app;
}
