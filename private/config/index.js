const dotenv = require('dotenv')

dotenv.config()

module.exports = {
    PORT: process.env.PORT,
    DNS: process.env.DNS,
    API_BASE_URL: process.env.API_BASE_URL || 'https://api.mntr.es'
}
