const axios = require('axios');

const ALL_STOPS_URL = "https://sdip.transportgzm.pl/main?command=basicdata&action=mstops";
const DEPARTURE_URL = "https://sdip.transportgzm.pl/main?command=planner&action=sd&id=";
const VEHICLE_BY_VID_URL = "https://sdip.transportgzm.pl/main?command=planner&action=v&vid=";
const ACTIVE_VEHICLES_URL = "https://sdip.transportgzm.pl/main?command=planner&action=v&lt=all";

const cache = require('../config/cache');
const STOPS_CACHE_KEY = "all_stops";

const sdipService = {
    getAllStops: async function() {
        const cachedData = cache.get(STOPS_CACHE_KEY);
        if (cachedData) {
            return cachedData;
        }
        const response = await axios.get(ALL_STOPS_URL);
        cache.set(STOPS_CACHE_KEY, response.data);
        return response.data;
    },

    getDepartures: async function(stopId) {
        const response = await axios.get(`${DEPARTURE_URL}${stopId || ''}`);
        return response.data;
    },

    getVehicle: async function(vid) {
        const response = await axios.get(`${VEHICLE_BY_VID_URL}${vid || ''}`);
        return response.data;
    },

    getActiveVehiclesAll: async function() {
        const response = await axios.get(ACTIVE_VEHICLES_URL);
        return response.data;
    }
}

module.exports = sdipService;