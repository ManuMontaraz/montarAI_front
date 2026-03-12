const { Server } = require('socket.io')
const config = require('../config')

let io = null

function initSocketIO(server) {
    io = new Server(server, {
        cors: {
            origin: true,
            credentials: true
        }
    })

    io.on('connection', (socket) => {
        console.log('Cliente conectado:', socket.id)

        socket.on('authenticate', async (data) => {
            try {
                const { token } = data
                
                if (!token) {
                    socket.emit('auth_status', { isLoggedIn: false })
                    socket.isAuthenticated = false
                    return
                }

                // Validar token con la API
                const response = await fetch(`${config.API_BASE_URL}/api/auth/me`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })

                if (response.ok) {
                    const responseData = await response.json()
                    // La API devuelve { user: { ...datos } }, extraer el usuario real
                    const user = responseData.user || responseData
                    socket.isAuthenticated = true
                    socket.userId = user.id
                    socket.emit('auth_status', { 
                        isLoggedIn: true, 
                        user: user 
                    })
                    console.log('Usuario autenticado:', user.email)
                } else {
                    socket.isAuthenticated = false
                    socket.emit('auth_status', { isLoggedIn: false })
                }
            } catch (error) {
                console.error('Error validando token:', error)
                socket.isAuthenticated = false
                socket.emit('auth_status', { isLoggedIn: false })
            }
        })

        socket.on('logout', () => {
            if (socket.userId) {
                // Notificar a otras pestañas del mismo usuario
                socket.broadcast.emit('auth_changed', { 
                    userId: socket.userId,
                    isLoggedIn: false 
                })
            }
            socket.isAuthenticated = false
            socket.userId = null
            socket.emit('auth_status', { isLoggedIn: false })
        })

        socket.on('disconnect', () => {
            console.log('Cliente desconectado:', socket.id)
        })
    })

    return io
}

function getIO() {
    if (!io) {
        throw new Error('Socket.io no inicializado')
    }
    return io
}

function broadcastAuthChange(userId, isLoggedIn) {
    if (io) {
        io.emit('auth_changed', { userId, isLoggedIn })
    }
}

module.exports = {
    initSocketIO,
    getIO,
    broadcastAuthChange
}
