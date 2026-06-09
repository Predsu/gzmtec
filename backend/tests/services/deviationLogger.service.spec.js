const { expect } = require('chai');
const sinon = require('sinon');
const deviationLoggerService = require('../../services/deviationLogger.service');
const sdipService = require('../../services/sdip.service');
const deviationLoggerModel = require('../../models/deviationLogger.model');

describe('deviationLoggerService - Unit Tests', () => {
    let getActiveVehiclesStub;
    let logDeviationStub;

    beforeEach(() => {
        getActiveVehiclesStub = sinon.stub(sdipService, 'getActiveVehiclesAll');
        logDeviationStub = sinon.stub(deviationLoggerModel, 'logDeviation');
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should correctly filter and save only valid records from SDIP', async () => {
        const mockVehicles = [
            {
                trip: 'T6/123',
                lineLabel: 'T6',
                id: '999',
                nextStop: { id: '5555', deviation: '4 min' }
            },
            {
                trip: null,
                lineLabel: 'T9',
                id: '888',
                nextStop: { id: '7766', deviation: '0 min' }
            }
        ];
        getActiveVehiclesStub.resolves(mockVehicles);
        logDeviationStub.resolves(1);

        const insertedCount = await deviationLoggerService.logActiveVehicleDeviations();

        expect(insertedCount).to.equal(1);
        expect(logDeviationStub.calledOnce).to.be.true;
        expect(logDeviationStub.firstCall.args).to.deep.equal([
            'T6/123', 'T6', '5555', '999', 4
        ]);
    });
});