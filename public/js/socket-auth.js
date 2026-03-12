// Cliente Socket.io para gestión de autenticación

const socket = io()

async function updateAuthUI(isLoggedIn, user = null) {
    // Buscar elemento cada vez (DOM puede no estar listo al cargar script)
    const authContainer = document.getElementById('is_logged_in')
    
    if (!authContainer) {
        console.error('No se encontró el elemento #is_logged_in')
        return
    }

    // Guardar el usuario para usarlo al cambiar de idioma
    window.currentUser = user

    if (isLoggedIn) {
        const userName = user ? (user.firstName || user.email) : ''
        authContainer.innerHTML = `
            <h1 mtrans="text|logged_in"></h1>
            ${user ? `<p mtrans="text|welcome_user" data-username="${userName}"></p>` : ''}
        `
    } else {
        authContainer.innerHTML = '<h1 mtrans="text|not_logged_in"></h1>'
        window.currentUser = null
    }
    
    // Traducir los elementos recién creados
    await mtrans()
}

// Al conectar, verificar autenticación
socket.on('connect', () => {
    console.log('Conectado al servidor Socket.io')
    
    const rememberMe = localStorage.getItem('remember_me') === 'true'
    const token = localStorage.getItem('access_token')
    
    // Solo autenticar automáticamente si el usuario marcó "recuérdame"
    if (rememberMe && token) {
        socket.emit('authenticate', { token })
    } else {
        // No autenticado (sin token o sin remember_me)
        updateAuthUI(false)
    }
})

// Recibir estado de autenticación
socket.on('auth_status', (data) => {
    console.log('Estado de autenticación:', data)
    updateAuthUI(data.isLoggedIn, data.user)
})

// Escuchar cambios de autenticación en tiempo real
socket.on('auth_changed', (data) => {
    console.log('Cambio de autenticación detectado:', data)
    updateAuthUI(data.isLoggedIn, data.user)
})

// Manejar errores de conexión
socket.on('connect_error', (error) => {
    console.error('Error de conexión Socket.io:', error)
})

socket.on('disconnect', () => {
    console.log('Desconectado del servidor Socket.io')
})

// Función para notificar logout a otras pestañas
function notifyLogout() {
    socket.emit('logout')
}

// Exponer función global para usar desde session.js
window.socketAuth = {
    notifyLogout,
    socket
}
