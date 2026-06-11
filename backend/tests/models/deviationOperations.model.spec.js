const deviationOperationsModel = require('../../models/deviationOperations.model');
const db = require('../../config/db');

jest.mock('../../config/db', () => ({
    query: jest.fn()
}));

describe('deviationOperationsModel', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getAvgDeviationByLineStopTime', () => {
        it('should fetch deviations within the correct calculated time range', async () => {
            const lineLabel = 'M3';
            const stopId = 'Gliwice Plac Piastów';
            const secondsSinceMidnight = 36000;
            const tolerance = 600;
            const weekday = 'Thursday';

            const expectedMinTime = 36000 - 600;
            const expectedMaxTime = 36000 + 600;

            const mockRows = [
                { id: 1, deviation: 60, departure_seconds: 35500 },
                { id: 2, deviation: -30, departure_seconds: 36100 }
            ];
            db.query.mockResolvedValue([mockRows]);

            const result = await deviationOperationsModel.getAvgDeviationByLineStopTime(
                lineLabel, 
                stopId, 
                secondsSinceMidnight, 
                tolerance, 
                weekday
            );

            expect(db.query).toHaveBeenCalledTimes(1);
            
            const [calledSql, calledParams] = db.query.mock.calls[0];
            
            expect(calledParams).toEqual([
                lineLabel,
                stopId,
                expectedMinTime,
                expectedMaxTime,
                weekday
            ]);

            expect(calledSql).toContain('GROUP BY trip, vehicle_id');

            expect(result).toEqual(mockRows);
            expect(result.length).toBe(2);
        });

        it('should return an empty array if no records match criteria', async () => {
            db.query.mockResolvedValue([[]]);
            const result = await deviationOperationsModel.getAvgDeviationByLineStopTime('1', '2', 100, 10, 'Monday');
            
            expect(result).toEqual([]);
        });

        it('should propagate database rejection errors', async () => {
            db.query.mockRejectedValue(new Error('SQL Syntax Error'));

            await expect(
                deviationOperationsModel.getRawData || deviationOperationsModel.getAvgDeviationByLineStopTime('1', '2', 100, 10, 'Monday')
            ).rejects.toThrow('SQL Syntax Error');
        });
    });
});