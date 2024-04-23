email = ""
let unameAlert = null;
let emailAlert = null;
let wrongPswdAlert = null;
let matchAlert = null;
let lengthAlert = null;
let successAlert = null;
let changePassword = null;
let confirmPassword = null;
let submitButtn = null;
let icon_img = null;
let banner_img = null;
window.addEventListener('DOMContentLoaded', () => {
    const icon = document.getElementById('icon');
    icon_img = document.getElementById('icon_img');
    icon.addEventListener('change', (event) => loadImg(event, icon_img));
    if (icon_img.src.charAt(icon_img.src.length - 1) !== "#"){
        icon_img.hidden = false;
    }

    const banner = document.getElementById('banner');
    banner_img = document.getElementById('banner_img');
    banner.addEventListener('change', (event) => loadImg(event, banner_img));
    if (banner_img.src.charAt(banner_img.src.length - 1) !== "#"){
        banner_img.hidden = false;
    }

    changePassword = document.getElementById("change_password");
    confirmPassword = document.getElementById("confirm_password");
    submitButtn = document.getElementById("submit");

    changePassword.addEventListener("input", (event) => {
        verifyPswds();
    })
    confirmPassword.addEventListener("input", (event) => {
        verifyPswds();
    })

    unameAlert = document.getElementById("invalidUsername");
    emailAlert = document.getElementById("invalidEmail");
    wrongPswdAlert = document.getElementById("wrongPassword");
    matchAlert = document.getElementById("passwordMatchError");
    lengthAlert = document.getElementById("invalidLength");
    successAlert = document.getElementById("success");
});

// code by chatGPT, modified by Tommy to work in this project
function loadImg(event, img){
    const file = event.target.files[0];
    if (file){
        const reader = new FileReader();
        reader.onload = function(e) {
            const imgUrl = e.target.result;

            // Show image in img element
            img.src = imgUrl;
            img.hidden = false;
        }

        reader.readAsDataURL(file);
    }
}

function verifyPswds(){
    if(changePassword.value !== confirmPassword.value){
        matchAlert.hidden = false;
        submitButtn.disabled = true;
    }else{
        matchAlert.hidden = true;
        submitButtn.disabled = false;
    }
    if(changePassword.value != "" && (changePassword.value.length < 8 || changePassword.value.length > 256)){
        lengthAlert.hidden = false
    }
    else {
        lengthAlert.hidden = true
    }
}

function applyChanges() {

    // Get the form element
    var form = document.querySelector('form');

    // Create an object to store field values
    var formData = {};

    // Iterate over the form elements
    Array.from(form.elements).forEach(function(element) {
        // Check if the element is an input field and has a name
        if ((element.nodeName === 'INPUT' || element.nodeName === 'TEXTAREA') && element.name) {
            // Add the field value to the formData object
            formData[element.name] = element.value;
        }
    });

    formData["icon"] = icon_img.src;
    formData["banner"] = banner_img.src;


    // validate the new settings entered in the fields
    fetch("/settings", {
        method: "POST",
        body: JSON.stringify(formData),
        headers: { "Content-type": "application/json; charset=UTF-8" }
    })
    .then(response => response.json())
    .then(data => {
        console.log(data)
        // show appropriate alerts based on reponse

        unameAlert.hidden = data.usernameUnique;

        emailAlert.hidden = data.validEmail;

        if(data.passwordUpdate){
            wrongPswdAlert.hidden = data.oldPasswordMatch;

            lengthAlert.hidden = data.newPasswordValid

            matchAlert.hidden = data.newPasswordMatch;
        }
    
        successAlert.hidden = !data.success;
    })
}