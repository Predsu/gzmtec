const apiStatusModel = require('../models/apiStatus.model');

const apiStatusController = {
    apiStatus: async (req, res) => {
        res.json(apiStatusModel.apiStatus);
    }
}

module.exports = apiStatusController;