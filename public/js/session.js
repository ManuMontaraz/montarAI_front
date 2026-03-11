let timeoutRefreshToken = setTimeout(()=>{},99999999)

function checkRememberMe(){
    const rememberMe = localStorage.getItem("remember_me") === "true"
    const accessToken = localStorage.getItem("access_token")
    
    if(rememberMe && accessToken){
        console.log("Attempting to restore session...")
        refresh_token()
        .then(() => {
            return get_current_user()
        })
        .then(user => {
            if(user){
                console.log("Session restored successfully:", user)
                alert("Sesión restaurada correctamente")
            }
        })
        .catch(error => {
            console.error("Failed to restore session:", error)
        })
    }
}

function logout(event){
    if(event) event.preventDefault()
    const accessToken = localStorage.getItem("access_token")

    fetch(`/api/auth/logout?lang=${get_language()}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`
        },
        credentials: "include"
    })
    .then(response => response.json())
    .then(data => {
        console.log("Logout response:", data)
        clearTimeout(timeoutRefreshToken)
        localStorage.removeItem("access_token")
        alert(data.message || "Sesión cerrada correctamente")
        // Opcional: redirigir a login
        // window.location.href = "/login"
    }).catch(error => {
        console.error("Error en logout:", error)
        clearTimeout(timeoutRefreshToken)
        localStorage.removeItem("access_token")
        localStorage.removeItem("remember_me")
    })
}

function logout_all_devices(event){
    if(event) event.preventDefault()
    const accessToken = localStorage.getItem("access_token")

    fetch(`/api/auth/logout-all-devices?lang=${get_language()}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`
        },
        credentials: "include"
    })
    .then(response => response.json())
    .then(data => {
        console.log("Logout all devices response:", data)
        clearTimeout(timeoutRefreshToken)
        localStorage.removeItem("access_token")
        alert(data.message || "Sesión cerrada en todos los dispositivos")
        // Opcional: redirigir a login
        // window.location.href = "/login"
    }).catch(error => {
        console.error("Error en logout-all-devices:", error)
        clearTimeout(timeoutRefreshToken)
        localStorage.removeItem("access_token")
        localStorage.removeItem("remember_me")
    })
}

function get_current_user(){
    const accessToken = localStorage.getItem("access_token")

    if(!accessToken){
        return Promise.resolve(null)
    }

    return fetch(`/api/auth/me?lang=${get_language()}`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${accessToken}`
        }
    })
    .then(response => {
        if(!response.ok){
            throw new Error("No autorizado")
        }
        return response.json()
    })
    .then(data => {
        console.log("Current user:", data)
        return data
    }).catch(error => {
        console.error("Error obteniendo usuario:", error)
        return null
    })
}

function register_user(event){
    event.preventDefault();
    let email = document.getElementById("register_email").value;
    let password = document.getElementById("register_password").value;
    let repeatPassword = document.getElementById("register_repeat_password").value;
    let firstName = document.getElementById("register_first_name").value;
    let lastName = document.getElementById("register_last_name").value;
    let phone = document.getElementById("register_phone").value;
    //let submit = document.getElementById("register_submit").value;

    if(email === "" || password === "" || repeatPassword === "" || firstName === "" || lastName === ""){
        mtrans("warn_fill_fields").then(data=>{
            alert(data)
        })
        return;
    }

    if(password !== repeatPassword){
        mtrans("warn_password_not_match").then(data=>{
            alert(data)
        })
        return;
    }

    fetch(`https://api.mntr.es/api/auth/register?lang=${get_language()}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email: email,
            password: password,
            firstName: firstName,
            lastName: lastName,
            phone: phone
        })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message)
    }).catch(error => {
        console.error("Error:", error)
        mtrans("error_registering_user").then(data=>{
            alert(data)
        })
    });
}

function login(event){
    event.preventDefault()
    let email = document.getElementById("login_email").value
    let password = document.getElementById("login_password").value
    let rememberMe = document.getElementById("login_remember_me").checked

    if(email === "" || password === ""){
        mtrans("warn_fill_fields").then(data=>{
            alert(data)
        })
        return
    }

    fetch(`/api/auth/login?lang=${get_language()}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email: email,
            password: password
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log({data})
        clearTimeout(timeoutRefreshToken)
        alert(data.message)
        localStorage.setItem("access_token",data.accessToken)
        localStorage.setItem("remember_me",rememberMe.toString())

        console.log(localStorage.getItem("access_token"))

        if(data.accessToken && data.expiresIn){
            timeoutRefreshToken = setTimeout(()=>{
                refresh_token()
            },data.expiresIn*1000)
        }
    }).catch(error => {
        console.error("Error:", error)
        mtrans("error_logging_in").then(data=>{
            alert(data)
        })
    })
}

function refresh_token(){
    const accessToken = localStorage.getItem("access_token")

    console.log("Refreshing token...")
    console.log("Access token:", accessToken)

    return fetch(`/api/auth/refresh-token?lang=${get_language()}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`
        },
        credentials: "include"
    })
    .then(response => response.json())
    .then(data => {
        console.log({data})
        clearTimeout(timeoutRefreshToken)

        if(data.accessToken){
            localStorage.setItem("access_token",data.accessToken)
        }

        console.log("New access token:", localStorage.getItem("access_token"))

        if(data.expiresIn){
            timeoutRefreshToken = setTimeout(()=>{
                refresh_token()
            },data.expiresIn*1000)
        }

        return "ok"
    }).catch(error => {
        console.error("Error refreshing token:", error)
        localStorage.removeItem("access_token")
        localStorage.removeItem("remember_me")
        throw error
    })
}

document.addEventListener('DOMContentLoaded', checkRememberMe)