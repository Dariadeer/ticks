import express from 'express';
import router from './routes/index.route';
import csp from './middleware/csp.middleware';
import errorHandler from './middleware/errors.middleware';
import bodyParser from 'body-parser';
import path from 'path';
import { config } from 'dotenv';

config();

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.resolve(__dirname, "../../client")));

app.use(router, errorHandler);

export default app;