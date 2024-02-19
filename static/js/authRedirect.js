console.log("script start")

const myMSALObj = new msal.PublicClientApplication(msalConfig);
let username = "";
console.log(sessionStorage)

if(window.location.href != "http://localhost/home/") {
    if(!sessionStorage.getItem("customIdToken")) {
        myMSALObj.handleRedirectPromise()
        .then(handleResponse)
        .catch((error) => {
            console.log("error")
            console.error(error);
        });
    }
    else {
        console.log("going home baby")
        window.location.href = "../home";
    }
}

console.log("script end")

// function initiateSignIn(str)
// {
//     console.log("msal login")
//     /**
//      * A promise handler needs to be registered for handling the
//      * response returned from redirect flow. For more information, visit:
//      * 
//      */
//     myMSALObj.handleRedirectPromise()
//     .then(handleResponse)
//     .then(() => {
//         if(str == "MSAL") {
//             signIn()
//             // if account exists (check username and gccEmail) --> go to home page
//             // fetch(`/check_user?gccEmail=${username}`)
//             console.log("username: " + username) 
//             // else --> go to registration page
//         }
//     })
//     .catch((error) => {
//         console.error(error);
//     });
// }


function selectAccount () {
    /**
     * See here for more info on account retrieval: 
     * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-common/docs/Accounts.md
     */
    console.log("selectAccount start")

    const currentAccounts = myMSALObj.getAllAccounts();

    if (!currentAccounts) {
        return;
    } else if (currentAccounts.length > 1) {
        // Add your account choosing logic here
        console.warn("Multiple accounts detected.");
    } else if (currentAccounts.length === 1) {
        username = currentAccounts[0].username;
    }

    // console.log(sessionStorage)
    console.log("selectAccount end")
}

function handleResponse(response) {
    /**
     * To see the full list of response object properties, visit:
     * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/request-response-object.md#response
     */
    console.log("handleResponse start")
    console.log(response)
    console.log(username)

    // if (response !== null)  username = response.account.username;
    // else    selectAccount();

    // if(response === "YES")   {
    //     username = "Bryce"
    //     sessionStorage.setItem("customIdToken", username)
    //     window.location.href = "../home";
    // }

    if(username != null && response != null) {// && username != "") {
        username = response.account.username
        console.log("hello??????")
        console.log(username)
        fetch(`/check_user?gccEmail=${username}`)
        .then(response => response.json())
        .then(data => {
            // console.log(data);
            if (data.exists) {// && data.username !== null) {
                // this account already exists so this will just log them in
                // myMSALObj.loginRedirect(loginRequest);
                sessionStorage.setItem("customIdToken", username)
                window.location.href = "../home";
            } else {
                // this doesn't exist yet so now we want to add the user to the database and have them set a username/password
                console.log(`User with username ${username} does not exist yet`);
                // Make a fetch request to the root URL of your Flask application
                //this is where add user used to be
                sessionStorage.setItem("customIdToken", username)
                formMode = document.getElementById("formMode");
                formMode.classList.toggle("show-register");
            }
        })
        .catch(error => {
            console.error('Error checking user:', error);
        });
    }


    // if (response !== null) {
    //     username = response.account.username;

    //     fetch(`/check_user?gccEmail=${username}`)
    //     .then(response => response.json())
    //     .then(data => {
    //         console.log(data);
    //         if (data.exists && data.username !== null) {
    //             // this account already exists so this will just log them in
    //             console.log(`User with username ${username} exists`);
    //             console.log("GO HOME NOW")
    //             window.location.href = "../home";
    //         } else {
    //             // this doesn't exist yet so now we want to add the user to the database and have them set a username/password
    //             console.log(`User with username ${username} does not exist`);
    //             // Make a fetch request to the root URL of your Flask application
    //             fetch('/')
    //             .then(response => {
    //                 if (!response.ok) {
    //                     throw new Error('Network response was not ok');
    //                 }
    //                 // // Optionally handle the response if needed
    //                 // console.log('Fetch request successful');
    //                 // let form = /*new HTMLFormElement(*/document.getElementById("registerForm")/*)*/
    //                 // console.log(form)
    //             })
    //             .catch(error => {  console.error('There was a problem with your fetch operation:', error);  });

    //             //this is where add user used to be

    //             formMode = document.getElementById("formMode");
    //             formMode.classList.toggle("show-register");
    //         }
    //     })
    //     .catch(error => {
    //         console.error('Error checking user:', error);
    //     });
    // } else {
    //     console.log("selectaccounts")
    //     selectAccount();

    //     /**
    //      * If you already have a session that exists with the authentication server, you can use the ssoSilent() API
    //      * to make request for tokens without interaction, by providing a "login_hint" property. To try this, comment the 
    //      * line above and uncomment the section below.
    //      */

    //     // myMSALObj.ssoSilent(silentRequest).
    //     //     then(() => {
    //     //         const currentAccounts = myMSALObj.getAllAccounts();
    //     //         username = currentAccounts[0].username;
    //     //         welcomeUser(username);
    //     //         updateTable();
    //     //     }).catch(error => {
    //     //         console.error("Silent Error: " + error);
    //     //         if (error instanceof msal.InteractionRequiredAuthError) {
    //     //             signIn();
    //     //         }
    //     //     });
    // }

    console.log(username)
    console.log("handleResponse end")
}

function signIn() {
    /**
     * You can pass a custom request object below. This will override the initial configuration. For more information, visit:
     * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/request-response-object.md#request
     */
    console.log("signIn start")
    // fetch(`/check_user?gccEmail=${username}`)
    // .then(response => response.json())
    // .then(data => {
    //     // console.log(data);
    //     if (data.exists) {// && data.username !== null) {
    //         // this account already exists so this will just log them in
    //         // myMSALObj.loginRedirect(loginRequest);
    //         window.location.href = "../home";
    //     } else {
    //         // this doesn't exist yet so now we want to add the user to the database and have them set a username/password
    //         console.log(`User with username ${username} does not exist`);
    //         // Make a fetch request to the root URL of your Flask application
    //         //this is where add user used to be
    //         formMode = document.getElementById("formMode");
    //         formMode.classList.toggle("show-register");
    //     }
    // })
    // .catch(error => {
    //     console.error('Error checking user:', error);
    // });

    myMSALObj.loginRedirect(loginRequest);  
    console.log("signIn end")
}

function signOut() {
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
}

function addUser() {
    usernameField = document.getElementById("newUsernameField")
    passwordField = document.getElementById("newPasswordField")

    return fetch('/add_user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({
            username: usernameField.value,
            gccEmail: username,
            backupPasswordHash: passwordField.value
            // Add other fields as needed
        })
    })
    .then(response => {
        if (!response.ok) { throw new Error('Failed to add user'); }
        else    {
            sessionStorage.setItem("customIdToken", username)
            console.log("update session storage from addUser")
            // window.location.href = "../home";
        }
        // return response.json();
    })
    .catch(error => console.error('Error:', error));

    console.log("IT SHOULD BE GOING HOME");
}

function loginExisting() {
    tempUsername = document.getElementById("existingUsername").value
    tempPassword = document.getElementById("existingPassword").value


    // handleResponse("YES")
    // fetch(`/loginExisting?username=${tempUsername}&password=${tempPassword}`)
    // .then(response => {
    //     console.log(response);
    //     window.location.href = "../home";
    // })
    // .catch(error => console.error('Error:', error));
    // window.location.href = "../home";

    // IF LOGIN IS SUCCESSFUL
    sessionStorage.setItem("customIdToken", tempUsername)
    // console.log(sessionStorage)
    username = tempUsername
    console.log(username)
}

/***
 * return true is users logged in; false if not
 */
function userLoggedIn() {
    return (myMSALObj.getAllAccounts().length > 0 && sessionStorage.getItem("customIdToken"))
}