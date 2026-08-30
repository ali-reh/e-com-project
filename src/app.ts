import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import apiRouter from './routes/index.js';

const app = express();
const projectRoot = process.cwd();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use('/', apiRouter);

app.use(express.static(path.resolve(projectRoot, 'public')));

app.get('/', (_req, res) => {
  res.sendFile(path.resolve(projectRoot, 'public/index.html'));
});

export default app;
