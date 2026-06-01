const axios = require('axios');

const ALL_STOPS_URL = "https://sdip.transportgzm.pl/main?command=basicdata&action=mstops";
const DEPARTURE_URL = "https://sdip.transportgzm.pl/main?command=planner&action=sd&id=";
const VEHICLE_BY_VID_URL = "https://sdip.transportgzm.pl/main?command=planner&action=v&vid=";
const ACTIVE_VEHICLES_URL = "https://sdip.transportgzm.pl/main?command=planner&action=v&lt=all";

const sdipService = {
    getAllStops: async function() {
        const response = await axios.get(ALL_STOPS_URL);
        return response.data;
    },

    getDepartures: async function() {
        const response = await axios.get(DEPARTURE_URL);
        return response.data;
    },

    getVehicle: async function() {
        const response = await axios.get(VEHICLE_BY_VID_URL);
        return response.data;
    },

    getActiveVehiclesAll: async function() {
        const response = await axios.get(ACTIVE_VEHICLES_URL);
        return response.data;
    }
}

module.exports = sdipService;