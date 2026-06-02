const deviationLoggerService = require('../services/deviationLogger.service');

let isDeviationJobRunning = false;

const runDeviationJob = async () => {
  if (isDeviationJobRunning) {
    return;
  }

  isDeviationJobRunning = true;
  try {
    const inserted = await deviationLoggerService.logActiveVehicleDeviations();
    const currentTime = new Date().toLocaleTimeString();
    console.log(`Deviation logger inserted ${inserted} rows at ${currentTime}.`);
  } catch (error) {
    console.error('Deviation logger failed:', error);
  } finally {
    isDeviationJobRunning = false;
  }
};

const startDeviationLogger = (intervalMs = 30000) => {
  runDeviationJob();
  return setInterval(runDeviationJob, intervalMs);
};

module.exports = {
  startDeviationLogger,
  runDeviationJob,
};
