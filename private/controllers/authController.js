const { fetchFromAPI } = require('../utils/apiClient')

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: '/'
}

async function login(request, response) {
    const { email, password } = request.body
    const lang = request.query.lang || 'es'

    const apiResponse = await fetchFromAPI(`/auth/login?lang=${lang}`, {
        method: 'POST',
        body: JSON.stringify({ email, password })
    })

    const data = await apiResponse.json()

    if (apiResponse.ok && data.refreshToken) {
        response.cookie('refreshToken', data.refreshToken, COOKIE_OPTIONS)
        const { refreshToken, ...responseData } = data
        return response.status(apiResponse.status).json(responseData)
    }

    response.status(apiResponse.status).json(data)
}

async function refreshToken(request, response) {
    const refreshToken = request.cookies.refreshToken
    const lang = request.query.lang || 'es'

    if (!refreshToken) {
        return response.status(401).json({ message: 'No se encontró refresh token' })
    }

    const apiResponse = await fetchFromAPI(`/auth/refresh-token?lang=${lang}`, {
        method: 'POST',
        body: JSON.stringify({ refreshToken })
    })

    const data = await apiResponse.json()

    if (apiResponse.ok && data.refreshToken) {
        response.cookie('refreshToken', data.refreshToken, COOKIE_OPTIONS)
        const { refreshToken: newRefreshToken, ...responseData } = data
        return response.status(apiResponse.status).json(responseData)
    }

    if (!apiResponse.ok) {
        response.clearCookie('refreshToken', { path: '/' })
    }

    response.status(apiResponse.status).json(data)
}

async function logout(request, response) {
    const accessToken = request.headers.authorization
    const lang = request.query.lang || 'es'

    const apiResponse = await fetchFromAPI(`/auth/logout?lang=${lang}`, {
        method: 'POST',
        headers: accessToken ? { 'Authorization': accessToken } : {}
    })

    response.clearCookie('refreshToken', { path: '/' })
    const data = await apiResponse.json()
    response.status(apiResponse.status).json(data)
}

async function logoutAllDevices(request, response) {
    const accessToken = request.headers.authorization
    const lang = request.query.lang || 'es'

    const apiResponse = await fetchFromAPI(`/auth/logout-all-devices?lang=${lang}`, {
        method: 'POST',
        headers: accessToken ? { 'Authorization': accessToken } : {}
    })

    response.clearCookie('refreshToken', { path: '/' })
    const data = await apiResponse.json()
    response.status(apiResponse.status).json(data)
}

async function getMe(request, response) {
    const accessToken = request.headers.authorization
    const lang = request.query.lang || 'es'

    if (!accessToken) {
        return response.status(401).json({ message: 'No autorizado' })
    }

    const apiResponse = await fetchFromAPI(`/auth/me?lang=${lang}`, {
        method: 'GET',
        headers: { 'Authorization': accessToken }
    })

    const data = await apiResponse.json()
    response.status(apiResponse.status).json(data)
}

module.exports = {
    login,
    refreshToken,
    logout,
    logoutAllDevices,
    getMe
}
