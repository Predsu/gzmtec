const request = require('supertest');
const { expect } = require('chai');
const sinon = require('sinon');
const express = require('express');
const axios = require('axios');

const tripPlannerController = require('../../controllers/tripPlanner.controller');
const deviationOperationsModel = require('../../models/deviationOperations.model');

describe('tripPlannerController - Integration Tests', () => {
    let app;
    let axiosPostStub;
    let dbQueryStub;

    beforeEach(() => {
        app = express();
        app.get('/api/search-route', tripPlannerController.searchRoute);

        axiosPostStub = sinon.stub(axios, 'post');
        dbQueryStub = sinon.stub(deviationOperationsModel, 'getAvgDeviationByLineStopTime');
    });

    afterEach(() => {
        sinon.restore();
    });


    it('should return ERR 400 when not all parameters specified', async () => {
        const res = await request(app)
            .get('/api/search-route')
            .query({ fromLat: 50.34 });

        expect(res.status).to.equal(400);
        expect(res.body.message).to.include('(fromLat, fromLon, toLat, toLon, date, time) are required.');
    });

    it('should correctly process the route and append the calculated deviation from the database', async () => {
        const fakeOtpResponse = {
            data: {
                data: {
                    plan: {
                        itineraries: [{
                            legs: [{
                                mode: 'BUS',
                                duration: 600,
                                startTime: 1770462000000,
                                route: { shortName: 'M3' },
                                from: { name: 'Bytom Dworzec', stop: { gtfsId: '1234' } },
                                to: { name: 'Katowice Rynek' }
                            }]
                        }]
                    }
                }
            }
        };
        axiosPostStub.resolves(fakeOtpResponse);

        const fakeDbSamples = [
            { deviation: 2 },
            { deviation: 4 }
        ];
        dbQueryStub.resolves(fakeDbSamples);

        const res = await request(app)
            .get('/api/search-route')
            .query({
                fromLat: 50.34377,
                fromLon: 18.91225,
                toLat: 50.27091,
                toLon: 18.99703,
                date: '2026-06-09',
                time: '13:00'
            });

        expect(res.status).to.equal(200);
        expect(res.body).to.be.an('array');

        const itinerary = res.body[0];
        expect(itinerary).to.be.an('object');
        expect(itinerary.legs).to.be.an('array');

        const testedLeg = itinerary.legs[0];
        expect(testedLeg.route.shortName).to.equal('M3');
        expect(testedLeg.predictedSamplesCount).to.equal(2);
        expect(testedLeg.predictedDeviationMinutes).to.be.a('number');
        expect(testedLeg.expectedStartTime).to.exist;
    });
});