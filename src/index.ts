/* eslint-disable no-console */
import { buildWebApp } from './api/server';

const app = buildWebApp();

const port = 9901;

app.listen(port, () => console.log(`app listening at http://localhost:${port}`));
