function signOut() {
    /**
     * You can pass a custom request object below. This will override the initial configuration. For more information, visit:
     * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/request-response-object.md#request
     */

    fetch(`/logout`)
    .then(result => {
        sessionStorage.removeItem("customIdToken");
        logout()
        window.location.href = "../home";
    })

}

// function dynamicLogin() {
//     var loginButton = document.getElementById("loginButton");
//     var logoutButton = document.getElementById("logoutButton");
//     var profileButton = document.getElementById("profileButton");

//     if (loginButton && logoutButton && profileButton){
//         if (account !== "") {
//             loginButton.style.display = "none";
//             logoutButton.style.display = "block";
//             profileButton.style.display = "block";
//         } else {
//             loginButton.style.display = "block";
//             logoutButton.style.display = "none";
//             profileButton.style.display = "none";
//         }
//     }
// }

function setUsername(username) {
    usernameElem = document.getElementById("username")
    if (usernameElem) usernameElem.textContent = username
}

function goToSettings() {
    window.location.href = `/settings`
}