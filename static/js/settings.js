email = ""
// base code provided by chatGPT, significantly modified by Tommy
window.addEventListener('DOMContentLoaded', () => {
    const icon = document.getElementById('icon');
    const icon_img = document.getElementById('icon_img');

    const banner = document.getElementById('banner');
    const banner_img = document.getElementById('banner_img');

    icon.addEventListener('change', (event) => loadImg(event, icon_img));
    banner.addEventListener('change', (event) => loadImg(event, banner_img));

    //get all warning message elements
    alerts = document.getElementsByClassName("bruh")
});

function loadImg(event, img){
    const file = event.target.files[0];
    if (file){
        const reader = new FileReader();
        reader.onload = function(e) {
            const imgUrl = e.target.result;

            // Show image in img element
            console.log(img.src)
            img.src = imgUrl;
            console.log(img.src)
            img.style.display = 'block';
        }

        reader.readAsDataURL(file);
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


    // validate the new settings entered in the fields
    fetch(`/checkNewSettings/?info=${JSON.stringify(formData)}`)
    .then(response => response.json())
    .then(data => {

        // show appropriate alerts based on reponse

        if(data.usernameUpdate && !data.usernameUnique) alerts[0].classList.add("showBruh")
        else alerts[0].classList.remove("showBruh")

        if(data.emailUpdate && !data.validEmail) alerts[1].classList.add("showBruh")
        else alerts[1].classList.remove("showBruh")

        if(data.passwordUpdate){
            if(!data.oldPasswordMatch) alerts[2].classList.add("showBruh")
            else alerts[2].classList.remove("showBruh")

            if(!data.newPasswordValid) alerts[3].classList.add("showBruh")
            else alerts[3].classList.remove("showBruh")

            if(!data.newPasswordMatch) alerts[4].classList.add("showBruh")
            else alerts[4].classList.remove("showBruh")
        }
    
        // upon data valid, update settings in db
        if(data.success) {
            fetch(`/settings/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            })
            .then(reponse => {
                // indicate update success
                alerts[5].classList.add("success")
            })
        }
    })
}