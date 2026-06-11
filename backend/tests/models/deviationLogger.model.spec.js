const deviationLoggerModel = require('../../models/deviationLogger.model');
const db = require('../../config/db');

jest.mock('../../config/db', () => ({
    query: jest.fn()
}));

describe('deviationLoggerModel', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('logDeviation', () => {
        it('should successfully insert a deviation record and return the insertId', async () => {
            const trip = 'M3/108';
            const lineLabel = 'M3';
            const stopId = 'Bytom Dworzec';
            const vehicleId = '1234';
            const deviation = 2;

            const mockInsertResult = [{ insertId: 42 }];
            db.query.mockResolvedValue(mockInsertResult);

            const result = await deviationLoggerModel.logDeviation(trip, lineLabel, stopId, vehicleId, deviation);

            expect(db.query).toHaveBeenCalledTimes(1);
            
            const [calledSql, calledParams] = db.query.mock.calls[0];
            expect(calledSql).toContain('INSERT INTO deviations');
            expect(calledParams).toEqual(
                expect.arrayContaining([trip, lineLabel, stopId, vehicleId, deviation])
            );
            
            expect(typeof calledParams[5]).toBe('string'); 
            
            expect(result).toBe(42);
        });

        it('should throw an error if the database query fails', async () => {
            db.query.mockRejectedValue(new Error('Database connection lost'));

            await expect(
                deviationLoggerModel.logDeviation('T-1', '19', '10', '999', 0)
            ).rejects.toThrow('Database connection lost');
        });
    });
});