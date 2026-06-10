const express = require("express")
const router = express.Router()
const deviationOperationsController = require('../../controllers/deviationOperations.controller')
const tripPlannerController = require('../../controllers/tripPlanner.controller')
const apiStatusController = require("../../controllers/apiStatus.controller")
const sdipService = require('../../services/sdip.service')

router.use('/deviations/estimate', deviationOperationsController.estimateDeviation)
router.use('/trip/search', tripPlannerController.searchRoute)
router.use('/status', apiStatusController.apiStatus)

router.get('/stops', async (req, res) => {
    try {
        const stops = await sdipService.getAllStops();
        res.status(200).json(stops);
    } catch (error) {
        console.error("Błąd pobierania przystanków dla autocomplete:", error.message);
        res.status(500).json({ message: "Błąd serwisu SDIP" });
    }
});

module.exports = router;