const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.resolve(__dirname, '.env') });
const envValidator = require("./middleware/envValidator.middleware");

envValidator();

const app = express();

app.use(cors({
  origin: function (origin, callback) {
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: '*',
}));

const PORT = process.env.PORT || 3000;

app.use(express.json());

const db = require('./config/db');
const deviationLoggerController = require('./controllers/deviationLogger.controller');
const deviationOperationsController = require('./controllers/deviationOperations.controller');
const tripPlannerController = require('./controllers/tripPlanner.controller');

const apiRouter = require('./routes/api/apiRouter');
const userRouter = require('./routes/users/userRouter')
const authRouter = require('./routes/users/authRouter')
app.use('/api', apiRouter);
app.use('/user', userRouter);
app.use('/auth', authRouter);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Main server is running on port ${PORT}`);
});