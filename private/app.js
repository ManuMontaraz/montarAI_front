// Copyright (C) 2025 Manu Montaraz

const express = require('express')
const http = require('http')
const dns = require('dns')
const config = require('./config')
const routes = require('./routes')

const app = express()

app.use(express.json())

const server = http.createServer(app)

dns.lookup(config.DNS, (error, address) => {
    if (error) {
        console.error(`No se pudo resolver el dominio: ${config.DNS}`)
        console.error(error)
        process.exit(1)
    }

    console.log(`Dirección IP del proxy: ${address}`)
    app.set('trust proxy', address)
    
    app.use(routes)

    server.listen(config.PORT, () => {
        console.log(`Servidor HTTP escuchando en http://localhost:${config.PORT}`)
    })
})

module.exports = { app, server }
