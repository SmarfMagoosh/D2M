account = sessionStorage.getItem("customIdToken")
dynamicLogin()

const myMSALObj = new msal.PublicClientApplication(msalConfig);

function signOut() {
    /**
     * You can pass a custom request object below. This will override the initial configuration. For more information, visit:
     * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/request-response-object.md#request
     */

    sessionStorage.removeItem("customIdToken");

    const currentAccounts = myMSALObj.getAllAccounts();
    if(currentAccounts && currentAccounts.length == 1) {
        // Choose which account to logout from by passing a username.
        const logoutRequest = {
            account: myMSALObj.getAllAccounts()[0]//getAccountByUsername(username),
            // postLogoutRedirectUri: 'http://localhost', // Simply remove this line if you would like navigate to index page after logout.
        };

        myMSALObj.logoutRedirect(logoutRequest);
    }

    location.reload();
}

function dynamicLogin() {
    var loginButton = document.getElementById("loginButton");
    var logoutButton = document.getElementById("logoutButton");

    if (account !== null) {
        loginButton.style.display = "none";
        logoutButton.style.display = "block";
    } else {
        loginButton.style.display = "block";
        logoutButton.style.display = "none";
    }
}