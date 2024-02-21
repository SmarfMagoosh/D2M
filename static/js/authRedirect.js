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
            sessionStorage.setItem("customIdToken", email)
            window.location.href = "../home";
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

    fetch(`/loginExisting?username=${username}&password=${password}`)
    .then(response => response.json())
    .then(data => {
        if (data.exists) {
            sessionStorage.setItem("customIdToken", data.email)
            window.location.href = "../home";
        } else {
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

    /**
     * You can pass a custom request object below. This will override the initial configuration. For more information, visit:
     * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/request-response-object.md#request
     */

    // Choose which account to logout from by passing a username.
    const logoutRequest = {
        account: myMSALObj.getAccountByUsername(username),
        postLogoutRedirectUri: 'http://localhost:3000/signout', // Simply remove this line if you would like navigate to index page after logout.

    };

    myMSALObj.logoutRedirect(logoutRequest);
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
            // Add other fields as needed
        })
    })
    .then(() => {
        sessionStorage.setItem("customIdToken", email)
        window.location.href = "../home";
    })
    .catch(error => console.error('Error:', error));
}