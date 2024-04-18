function signOut() {
    /**
     * You can pass a custom request object below. This will override the initial configuration. For more information, visit:
     * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/request-response-object.md#request
     */

    fetch(`/logout`)
    .then(result => {
        sessionStorage.removeItem("customIdToken");
        logout()
        window.location.href = "/signin-oidc/";
    })

}

function setUsername(username) {
    usernameElem = document.getElementById("username")
    if (usernameElem) usernameElem.textContent = username
}

function goToSettings() {
    window.location.href = `/settings/`
}