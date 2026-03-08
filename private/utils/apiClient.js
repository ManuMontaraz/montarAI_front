const config = require('../config')

async function fetchFromAPI(endpoint, options = {}) {
    const url = `${config.API_BASE_URL}/api${endpoint}`
    const response = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        }
    })
    return response
}

module.exports = { fetchFromAPI }
