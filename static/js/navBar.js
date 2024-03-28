// account = sessionStorage.getItem("customIdToken")
account = ""
username = ""

fetch('/getUserInfo')
.then(response => response.json())
.then(data => {
    console.log(data)

    if(data.loggedIn) {
        account = data.gccEmail
        username = data.username
        fetch(`/getUsername?gccEmail=${account}`)
        .then(response => {
            return response.text()
        })
        .then(data => {
            username = data
            setUsername(data)
        })
    }
    else {
        document.getElementById('settingsButton').style.display = 'none'
    }
    
    dynamicLogin()
})

const myMSALObj = new msal.PublicClientApplication(msalConfig);

function signOut() {
    /**
     * You can pass a custom request object below. This will override the initial configuration. For more information, visit:
     * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/request-response-object.md#request
     */

    fetch(`/logout`)
    sessionStorage.removeItem("customIdToken");

    logout()

    window.location.href = "../home";
}

function dynamicLogin() {
    var loginButton = document.getElementById("loginButton");
    var logoutButton = document.getElementById("logoutButton");

    if (account !== "") {
        loginButton.style.display = "none";
        logoutButton.style.display = "block";
    } else {
        loginButton.style.display = "block";
        logoutButton.style.display = "none";
    }
}

function setUsername(username) {
    document.getElementById("username").textContent = username
}

function goToSettings() {
    window.location.href = `/settings`
}