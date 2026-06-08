const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

const app = express();

app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

dotenv.config({ path: path.resolve(__dirname, '.env') });
const PORT = process.env.PORT || 3000;

app.use(express.json());

const db = require('./config/db');
const deviationLoggerController = require('./controllers/deviationLogger.controller');
const deviationOperationsController = require('./controllers/deviationOperations.controller');
const tripPlannerController = require('./controllers/tripPlanner.controller');

app.get('/deviations/estimate', deviationOperationsController.estimateDeviation);
app.get('/trip/search', tripPlannerController.searchRoute);

app.get('/api/status', (req, res) => {
  res.json({ working: true, time: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Main server is running on port ${PORT}`);
});