const express = require("express")
const router = express.Router()
const deviationOperationsController = require('../../controllers/deviationOperations.controller')
const tripPlannerController = require('../../controllers/tripPlanner.controller')
const apiStatusController = require("../../controllers/apiStatus.controller")

router.use('/deviations/estimate', deviationOperationsController.estimateDeviation)
router.use('/trip/search', tripPlannerController.searchRoute)
router.use('/status', apiStatusController.apiStatus)

module.exports = router;