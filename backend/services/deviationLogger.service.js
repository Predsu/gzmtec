const sdipService = require("./sdip.service");
const deviationLoggerModel = require("../models/deviationLogger.model");

const deviationLoggerService = {
  logActiveVehicleDeviations: async () => {
    const vehicles = await sdipService.getActiveVehiclesAll();
    if (!Array.isArray(vehicles)) {
      return 0;
    }

    let inserted = 0;
    for (const vehicle of vehicles) {
      const trip = vehicle?.trip || null;
      const lineLabel = vehicle?.lineLabel || null;
      const stopId = vehicle?.nextStop?.id || null;
      const vehicleId = vehicle?.id || null;
      const deviation = vehicle?.nextStop?.deviation;

      if (!trip || !stopId || !vehicleId) {
        continue;
      }

      const rawDeviation = deviation === null || deviation === undefined || deviation === "" ? "0 min" : String(deviation);
      const normalizedDeviation = Number.isNaN(parseInt(rawDeviation, 10)) ? 0 : parseInt(rawDeviation, 10);
      await deviationLoggerModel.logDeviation(trip, lineLabel, stopId, vehicleId, normalizedDeviation);
      inserted += 1;
    }

    return inserted;
  }
};

module.exports = deviationLoggerService;
