const axios = require('axios');
const sdipService = require('../../services/sdip.service');
const cache = require('../../config/cache');

jest.mock('axios');
jest.mock('../../config/cache');

describe('SdipService', () => {
    
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getAllStops', () => {
        const mockStopsData = [
            { id: "112", name: "Antoniów Konstytucji", lat: 50.378311, lon: 19.238506 },
            { id: "5601", name: "Biskupice Zarząd Dróg nż", lat: 50.31730963, lon: 18.79983806 }
        ];

        test('should return cached data if present (Branch True)', async () => {
            cache.get.mockReturnValue(mockStopsData);

            const result = await sdipService.getAllStops();

            expect(cache.get).toHaveBeenCalledWith('all_stops');
            expect(axios.get).not.toHaveBeenCalled();
            expect(result).toEqual(mockStopsData);
        });

        test('should fetch data from API and save to cache if not cached (Branch False)', async () => {
            cache.get.mockReturnValue(undefined);
            axios.get.mockResolvedValue({ data: mockStopsData });

            const result = await sdipService.getAllStops();

            expect(cache.get).toHaveBeenCalledWith('all_stops');
            expect(axios.get).toHaveBeenCalledWith('https://sdip.transportgzm.pl/main?command=basicdata&action=mstops');
            expect(cache.set).toHaveBeenCalledWith('all_stops', mockStopsData);
            expect(result).toEqual(mockStopsData);
        });
    });

    describe('getDepartures', () => {
        test('should fetch departures data successfully from API', async () => {
            const mockDepartures = { departures: [] };
            axios.get.mockResolvedValue({ data: mockDepartures });

            const mockStopId = '11737';
            const result = await sdipService.getDepartures(mockStopId);

            expect(axios.get).toHaveBeenCalledWith(`https://sdip.transportgzm.pl/main?command=planner&action=sd&id=${mockStopId}`);
            expect(result).toEqual(mockDepartures);
        });
    });

    describe('getVehicle', () => {
        test('should fetch single vehicle data successfully from API', async () => {
            const mockVehicle = { vehicleId: '123', speed: 45 };
            axios.get.mockResolvedValue({ data: mockVehicle });

            const mockVid = '123';
            const result = await sdipService.getVehicle(mockVid);

            expect(axios.get).toHaveBeenCalledWith(`https://sdip.transportgzm.pl/main?command=planner&action=v&vid=${mockVid}`);
            expect(result).toEqual(mockVehicle);
        });
    });

    describe('getActiveVehiclesAll', () => {
        test('should fetch all active vehicles from API', async () => {
            const mockActiveVehicles = { vehicles: [{ id: 1 }, { id: 2 }] };
            axios.get.mockResolvedValue({ data: mockActiveVehicles });

            const result = await sdipService.getActiveVehiclesAll();

            expect(axios.get).toHaveBeenCalledWith('https://sdip.transportgzm.pl/main?command=planner&action=v&lt=all');
            expect(result).toEqual(mockActiveVehicles);
        });
    });
});