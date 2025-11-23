import express from 'express';
import router from './routes/index.route';
import csp from './middleware/csp.middleware';
import bodyParser from 'body-parser';
import path from 'path';
import cors from 'cors';

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.resolve(__dirname, "../../client")));

app.use(router);

export default app;