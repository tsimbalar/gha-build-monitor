import * as path from 'path';

import express, { Express } from 'express';
import { CompositionRoot } from './composition-root';
import { RegisterControllerFactory } from './tsoa-ioc';
import { RegisterRoutes } from './tsoa-routes.generated';
import swaggerUi from 'swagger-ui-express';

export function buildWebApp(compositionRoot: CompositionRoot): Express {
  const app: Express = express();

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

  return app;
}
