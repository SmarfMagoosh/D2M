// Create the main myMSALObj instance
// configuration parameters are located at authConfig.js
const myMSALObj = new msal.PublicClientApplication(msalConfig);

let email = "";

/**
 * A promise handler needs to be registered for handling the
 * response returned from redirect flow. For more information, visit:
 * 
 */
myMSALObj.handleRedirectPromise()
.then(response => {
    if(response !== null) handleMSALLogin(response);
})
.catch((error) => {
    console.error(error);
});

function handleMSALLogin(response) {

    /**
     * To see the full list of response object properties, visit:
     * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/request-response-object.md#response
     */

    email = response.account.username

    fetch(`/check_user?gccEmail=${email}`)
    .then(response => response.json())
    .then(data => {
        if (data.exists) {
            fetch(`/login?email=${email}`)
            .then(response => {
                window.location.href = "/";})
        } else {
            formMode = document.getElementById("formMode");
            formMode.classList.toggle("show-register");
        }
    })
    .catch(error => {
        console.error('Error checking user:', error);
    });
}

function loginExisting() {
    usernameField = document.getElementById("existingUsername")
    passwordField = document.getElementById("existingPassword")
    username = usernameField.value
    password = passwordField.value

    fetch('/loginExisting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({
            username: username,
            password: password,
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.exists) {
            fetch(`/login?email=${data.email}`)
            .then(response => {
                window.location.href = "../home";
            })
        } else {
            document.getElementById("incorrectCredentials").style.display = "inline";
            usernameField.value = ""
            passwordField.value = ""
        }
    })
}

function signIn() {

    /**
     * You can pass a custom request object below. This will override the initial configuration. For more information, visit:
     * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/request-response-object.md#request
     */

    myMSALObj.loginRedirect(loginRequest);
}

function signOut() {
    logout()
}

function register() {
    usernameField = document.getElementById("newUsernameField")
    passwordField = document.getElementById("newPasswordField")

    return fetch('/add_user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({
            username: usernameField.value,
            gccEmail: email,
            backupPasswordHash: passwordField.value
        })
    })
    .then(response => response.json())
    .then(data => {
        if ((data.uniqueUsername) && (data.goodPassword)) {
            fetch(`/login?email=${email}`)
            .then(response => {
            window.location.href = "../home";
            })
        }
        else {
            invalidUsername = document.getElementById("invalidUsername")
            invalidPassword = document.getElementById("invalidPassword")

            if(!(data.uniqueUsername))
                invalidUsername.style.display = "inline"
            else
                invalidUsername.style.display = "none";

            if(!(data.goodPassword))
                invalidPassword.style.display = "inline"
            else
                invalidPassword.style.display = "none"
        }
    })
    .catch(error => console.error('Error:', error));
}