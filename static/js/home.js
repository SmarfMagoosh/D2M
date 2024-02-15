const myMSALObj = new msal.PublicClientApplication(msalConfig);
const currentAccounts = myMSALObj.getAllAccounts();
if (!currentAccounts) {
    console.log("!currentAccounts")
} else if (currentAccounts.length > 1) {
    // Add your account choosing logic here
    console.log("Multiple accounts detected.");
} else if (currentAccounts.length == 1) {
    myMSALObj.acquireTokenSilent({
        account: currentAccounts[0],
        scopes: ["openid"]
    }).then(response => {
        console.log(response)
        console.log(response.account.idTokenClaims.name + " is logged in")
    });
}
else {
    console.log("no one is logged in")
}    
console.log(sessionStorage)


function signOut() {
    /**
     * You can pass a custom request object below. This will override the initial configuration. For more information, visit:
     * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/request-response-object.md#request
     */

    // Choose which account to logout from by passing a username.
    const logoutRequest = {
        account: myMSALObj.getAllAccounts()[0]//getAccountByUsername(username),
        // postLogoutRedirectUri: 'http://localhost', // Simply remove this line if you would like navigate to index page after logout.
    };

    myMSALObj.logoutRedirect(logoutRequest);
}