/**
 * Configuration object to be passed to MSAL instance on creation. 
 * For a full list of MSAL.js configuration parameters, visit:
 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/configuration.md 
 */

const msalConfig = {
    auth: {
        clientId: '1a216859-dca0-4c6a-9d27-4eb96dd00ab3', // This is the ONLY mandatory field that you need to supply.
        authority: 'https://login.microsoftonline.com/83918960-2218-4cd3-81fe-302a8e771da9', // Defaults to "https://login.microsoftonline.com/common"
        redirectUri:  window.location.origin + '/signin-oidc', // You must register this URI on Azure Portal/App Registration. Defaults to window.location.href e.g. http://localhost:3000/
        postLogoutRedirectUri: window.location.origin + '/signin-oidc',
        navigateToLoginRequestUrl: true, // If "true", will navigate back to the original request location before processing the auth code response.
    },
    cache: {
        cacheLocation: 'sessionStorage', // Configures cache location. "sessionStorage" is more secure, but "localStorage" gives you SSO.
        storeAuthStateInCookie: false, // set this to true if you have to support IE
    },
    system: {
        loggerOptions: {
            loggerCallback: (level, message, containsPii) => {
                if (containsPii) {
                    return;
                }
                switch (level) {
                    case msal.LogLevel.Error:
                        console.error(message);
                        return;
                    case msal.LogLevel.Info:
                        console.info(message);
                        return;
                    case msal.LogLevel.Verbose:
                        console.debug(message);
                        return;
                    case msal.LogLevel.Warning:
                        console.warn(message);
                        return;
                }
            },
        },
    },
};

/**
 * Scopes you add here will be prompted for user consent during sign-in.
 * By default, MSAL.js will add OIDC scopes (openid, profile, email) to any login request.
 * For more information about OIDC scopes, visit: 
 * https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-permissions-and-consent#openid-connect-scopes
 */
const loginRequest = {
  scopes: ["openid", "profile"],
};

/**
 * An optional silentRequest object can be used to achieve silent SSO
 * between applications by providing a "login_hint" property.
 */

// exporting config object for jest
if (typeof exports !== 'undefined') {
  module.exports = {
      msalConfig: msalConfig,
      loginRequest: loginRequest,
  };
}


function logout() {
    const myMSALObj = new msal.PublicClientApplication(msalConfig);
    const currentAccounts = myMSALObj.getAllAccounts();
    if(currentAccounts && currentAccounts.length == 1) {
        // Choose which account to logout from by passing a username.
        const logoutRequest = {
            account: myMSALObj.getAllAccounts()[0]//getAccountByUsername(username),
        };

        myMSALObj.logoutRedirect(logoutRequest);
    }
}