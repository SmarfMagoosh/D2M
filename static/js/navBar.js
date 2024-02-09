const btn = document.getElementById('signIn');

function setUserName() {
    const currentAccounts = myMSALObj.getAllAccounts();

    if (currentAccounts.length === 1) {
        btn.innerText = username
        btn.onclick = signOut
    }
    else {
        btn.innerText = "Sign-In"
        btn.onclick = signIn
    }
}

setUserName()
