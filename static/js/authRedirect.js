// Create the main myMSALObj instance
// configuration parameters are located at authConfig.js
const myMSALObj = new msal.PublicClientApplication(msalConfig);

let username = "";

/**
 * A promise handler needs to be registered for handling the
 * response returned from redirect flow. For more information, visit:
 * 
 */
myMSALObj.handleRedirectPromise()
    .then(handleResponse)
    .catch((error) => {
        console.error(error);
    });

function selectAccount () {
    console.log("RUN: selectAccount")
    /**
     * See here for more info on account retrieval: 
     * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-common/docs/Accounts.md
     */

    const currentAccounts = myMSALObj.getAllAccounts();
    console.log("currentAccounts")
    console.log(currentAccounts)

    if (!currentAccounts) {
        console.log("1")
        return;
    } else if (currentAccounts.length > 1) {
        console.log("2")
        // Add your account choosing logic here
        console.warn("Multiple accounts detected.");
    } else if (currentAccounts.length === 1) {
        console.log("3")
        username = currentAccounts[0].username;
        setUserName()
        // welcomeUser(username);
        // updateTable();
    }
    else {
        console.log("4")
    }
    console.log("END: selectAccount")

}

function handleResponse(response) {

    /**
     * To see the full list of response object properties, visit:
     * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/request-response-object.md#response
     */
    console.log("RUN: handleResponse")
    if (response !== null) {
        console.log("response != null")
        console.log(response)
        username = response.account.username;
        setUserName()
        // welcomeUser(username);
        // updateTable();
    } else {
        console.log("response == null")
        selectAccount();

        /**
         * If you already have a session that exists with the authentication server, you can use the ssoSilent() API
         * to make request for tokens without interaction, by providing a "login_hint" property. To try this, comment the 
         * line above and uncomment the section below.
         */

        // myMSALObj.ssoSilent(silentRequest).
        //     then(() => {
        //         const currentAccounts = myMSALObj.getAllAccounts();
        //         username = currentAccounts[0].username;
        //         welcomeUser(username);
        //         updateTable();
        //     }).catch(error => {
        //         console.error("Silent Error: " + error);
        //         if (error instanceof msal.InteractionRequiredAuthError) {
        //             signIn();
        //         }
        //     });
    }
    console.log("END: handleResponse")
}

function signIn() {
    console.log("RUN: signIn")
    /**
     * You can pass a custom request object below. This will override the initial configuration. For more information, visit:
     * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/request-response-object.md#request
     */

    myMSALObj.loginRedirect(loginRequest);
    console.log("END: signIn")
}

function signOut() {
    console.log("RUN: signOut")
    /**
     * You can pass a custom request object below. This will override the initial configuration. For more information, visit:
     * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/request-response-object.md#request
     */

    // Choose which account to logout from by passing a username.
    const logoutRequest = {
        account: myMSALObj.getAccountByUsername(username),
        // postLogoutRedirectUri: 'http://localhost', // Simply remove this line if you would like navigate to index page after logout.

    };

    myMSALObj.logoutRedirect(logoutRequest);
    console.log("END: signOut")
}
