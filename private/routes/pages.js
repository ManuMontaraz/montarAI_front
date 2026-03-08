const express = require('express')
const router = express.Router()
const fs = require('fs')
const path = require('path')

router.get('/', async (request, response) => {
    const language = 'es'
    const filePath = path.join(__dirname, '..', '..', 'public', 'html', 'index.html')
    
    fs.readFile(filePath, 'utf8', (error, html) => {
        if (error) {
            return response.status(500).send('Error leyendo el archivo')
        }
        let replacedHtml = html.replaceAll('[language]', language)
        response.set('Content-Type', 'text/html')
        response.send(replacedHtml)
    })
})

module.exports = router
