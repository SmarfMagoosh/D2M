// Get the URL parameters
const urlParams = new URLSearchParams(window.location.search);
// Get the token parameter from the URL
const token = urlParams.get('token');

valid = false

fetch(`/validate_reset_token?token=${token}`)
.then(response => response.json())
.then(data => {
    valid = data.valid
    if(!valid) {
        document.getElementById("resetDisplay").style.display = "none"
        document.getElementById("faultyLinkDisplay").style.display = "inline"
    }
    else {
        document.getElementById("resetDisplay").style.display = "inline"
        document.getElementById("faultyLinkDisplay").style.display = "none"        
    }
})

function reset() {
    if(!valid) return

    newPassword = document.getElementById("newPassword").value
    fetch(`/setPassword?token=${token}&password=${newPassword}`)
    .then(response => response.json())
    .then(data => {
        if(data.success) {
            fetch(`/login?email=${data.email}`)
            window.location.href = "../home";
        }
    })
}