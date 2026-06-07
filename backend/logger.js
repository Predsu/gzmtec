const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env') });

const db = require('./config/db');

const deviationLogger = require('./scripts/deviationLogger');

console.log('Starting Deviation Logger service...');
deviationLogger.startDeviationLogger();