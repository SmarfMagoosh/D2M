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

function openTab(evt, tabName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
  }