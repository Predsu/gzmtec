const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const readline = require('readline');

dotenv.config({ path: path.resolve(__dirname, '.env') });

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
const deviationLoggerController = require('./controllers/deviationLogger.controler');
const deviationLogger = require('./scripts/deviationLogger');

app.get('/deviations/estimate', deviationLoggerController.estimateDeviation);

const startServer = () => {
  app.get('/api/status', (req, res) => {
    res.json({ ok: true, time: new Date().toISOString() });
  });

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

const showStartupMenu = () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log('Select mode:');
  console.log('1) Main server');
  console.log('2) Deviation logger');

  rl.question('Enter 1 or 2: ', (answer) => {
    const choice = answer.trim();
    if (choice === '1') {
      startServer();
    } else if (choice === '2') {
      deviationLogger.startDeviationLogger();
    } else {
      console.log('Invalid selection. Exiting.');
      process.exit(1);
    }

    rl.close();
  });
};

showStartupMenu();