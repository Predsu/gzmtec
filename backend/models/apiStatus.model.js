const apiStatusModel = {
    apiStatus: async () => {
        return { working: true, time: new Date().toISOString() };
    }
}

module.exports = apiStatusModel;