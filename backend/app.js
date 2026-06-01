const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

const db = require('./config/db');
const deviationLoggerService = require('./services/deviationLogger.service');
const deviationLoggerController = require('./controllers/deviationLogger.controler');

let isDeviationJobRunning = false;

const runDeviationJob = async () => {
  if (isDeviationJobRunning) {
    return;
  }

  isDeviationJobRunning = true;
  try {
    const inserted = await deviationLoggerService.logActiveVehicleDeviations();
    console.log(`Deviation logger inserted ${inserted} rows.`);
  } catch (error) {
    console.error("Deviation logger failed:", error);
  } finally {
    isDeviationJobRunning = false;
  }
};

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

app.get('/deviations/estimate', deviationLoggerController.estimateDeviation);

runDeviationJob();
setInterval(runDeviationJob, 30000);