
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
    usernameField = document.getElementById("resetUsername")

    fetch(`/checkUsername?username=${usernameField.value}`)
    .then(response => response.json())
    .then(data => {
        if(data.exists){
            document.getElementById("loader").style.display = "inline"
            fetch(`/genResetToken?username=${usernameField.value}`)
            .then(response => response.json())
            .then(data => {
                if(data.token) {
                    fetch(`/sendResetEmail?username=${usernameField.value}&token=${data.token}`)
                    .then(response => response.json())
                    .then(data => {
                        if(data.success) {
                            document.getElementById("loader").style.display = "none"
                            document.getElementById("emailSuccess").style.display = "inline"
                        }
                        else {
                            document.getElementById("loader").style.display = "none"
                            document.getElementById("emailError").style.display = "inline"
                            console.log("ERROR: the email did not send")
                        }
                    })
                }
            })
        }
        else {
            usernameField = document.getElementById("usernameDNE").style.display = "inline"
        }
    })
}