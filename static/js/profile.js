account = sessionStorage.getItem("customIdToken")

username = ""

if(account !== null) {
    fetch(`/getUsername?gccEmail=${account}`)
    .then(response => {
        return response.text()
    })
    .then(data => {
        username = data
        setUsername(data)
    })
}

function setUsername(username) {
    document.getElementById("username").textContent = username
}