// help ts-node find out about our added "request.user"
import type {} from './api/express-types';
import { CompositionRoot } from './composition-root';
import { buildWebApp } from './api/server';
import { loadSettingsFromEnvVars } from './settings';

const settings = loadSettingsFromEnvVars();
const compositionRoot = new CompositionRoot(settings);
const app = buildWebApp(compositionRoot);

const port = 9901;

// eslint-disable-next-line no-console
app.listen(port, () => console.log(`app listening at http://localhost:${port}`));
