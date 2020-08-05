import express from 'express';
import winston from 'winston';
import { promises as fs } from 'fs';
import gradesRouter from './routes/grades.js';

const { readFile, writeFile } = fs;

const app = express();
app.use(express.json());

global.fileName = 'grades.json';

const { combine, timestamp, label, printf } = winston.format;
const myFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});
//prettier-ignore
global.logger = winston.createLogger({
  level: 'silly',
  transports: [
    new (winston.transports.Console)(),
    new (winston.transports.File)({ filename: "grades-control-api.log"})
  ],
  format: combine(
    label ({ label: "grades-control-api"}),
    timestamp(),
    myFormat
  )
});

app.use('/grades', gradesRouter);

app.listen('3000', async () => {
  try {
    await readFile(global.fileName);
    logger.info('API Started and File found!');
  } catch (err) {
    try {
      const initialJson = {
        nextId: 1,
        grades: [],
      };
      await writeFile(global.fileName, JSON.stringify(initialJson, null, 2));
      logger.info('API Started and File created!');
    } catch (err) {
      logger.error(err);
    }
  }
});
