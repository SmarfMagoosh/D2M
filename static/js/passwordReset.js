// Get the URL parameters
const urlParams = new URLSearchParams(window.location.search);
// Get the token parameter from the URL
const token = urlParams.get('token');

fetch(`/validate_reset_token?token=${token}`)
.then(response => response.json())
.then(data => {
    if(data.valid) {
        console.log("valid")
    }
    else {
        console.log("invalid")
    }
})

function reset() {
    newPassword = document.getElementById("newPassword").value
    fetch(`/setPassword?token=${token}&password=${newPassword}`)
    .then(response => response.json())
    .then(data => {
        if(data.success) {
            console.log("valid")
            sessionStorage.setItem("customIdToken", data.email)
            window.location.href = "../home";
        }
        else {
            console.log("invalid")
        }
    })
}