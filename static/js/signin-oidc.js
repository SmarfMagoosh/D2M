const forms = document.querySelector(".forms"),
      pwShowHide = document.querySelectorAll(".eye-icon"),
      links = document.querySelectorAll(".link");

pwShowHide.forEach(eyeIcon => {
    eyeIcon.addEventListener("click", () => {
        let pwFields = eyeIcon.parentElement.parentElement.querySelectorAll(".password");
        
        pwFields.forEach(password => {
            if(password.type === "password"){
                password.type = "text";
                eyeIcon.classList.replace("bx-hide", "bx-show");
                return;
            }
            password.type = "password";
            eyeIcon.classList.replace("bx-show", "bx-hide");
        })
        
    })
})      

links.forEach(link => {
    link.addEventListener("click", e => {
       forms.classList.toggle("show-signup");
    })
})

resetLinks = document.querySelectorAll(".reseter")

resetLinks.forEach(resetLink => {
    resetLink.addEventListener("click", e => {
    forms.classList.toggle("show-reset");
    })
})

function sendEmail() {
    fetch(`/genResetToken?username=Bryce`)
    .then(response => response.json())
    .then(data => {
        console.log(data.token)
        if(data.token) {
            fetch(`/sendResetEmail?username=Bryce&token=${data.token}`)
            // .then(response => response.json())
            // .then(data => {
            //     console.log(data)
            // })
        }
        // fetch(`/validate_reset_token?token=${data.token}`)
        // .then(response => response.json())
        // .then(data => {
        //     if(data.valid) {
        //         console.log("valid")
        //     }
        //     else {
        //         console.log("invalid")
        //     }
        // })
        // fetch(`/sendResetEmail?token=${response}`)   // <-- keep working here to take a variable as an input
    })
    // .then(response => response.json())
    // .then(data => {
    //     if (data.exists) {
    //         sessionStorage.setItem("customIdToken", data.email)
    //         window.location.href = "../home";
    //     } else {
    //         usernameField.value = ""
    //         passwordField.value = ""
    //     }
    // })
}