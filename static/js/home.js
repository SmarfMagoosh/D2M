const myMSALObj = new msal.PublicClientApplication(msalConfig);

const currentAccounts = myMSALObj.getAllAccounts();

if (!currentAccounts) {
    console.log("!currentAccounts")
} else if (currentAccounts.length > 1) {
    // Add your account choosing logic here
    console.warn("Multiple accounts detected.");
} else if (currentAccounts.length === 1) {
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