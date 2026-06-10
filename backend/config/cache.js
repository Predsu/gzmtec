const nodeCache = require('node-cache');

const cache = new nodeCache({stdTTL: 86400});

module.exports = cache;