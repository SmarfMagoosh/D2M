// base code provided by chatGPT, significantly modified by Tommy
window.addEventListener('DOMContentLoaded', () => {
    const icon = document.getElementById('icon');
    const icon_img = document.getElementById('icon_img');

    const banner = document.getElementById('banner');
    const banner_img = document.getElementById('banner_img');

    icon.addEventListener('change', (event) => loadImg(event, icon_img));
    banner.addEventListener('change', (event) => loadImg(event, banner_img));
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