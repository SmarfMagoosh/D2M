// base code provided by chatGPT, significantly modified by Tommy
window.addEventListener('DOMContentLoaded', () => {
    const icon = document.getElementById('icon');
    const icon_img = document.getElementById('icon_img');

    const banner = document.getElementById('banner');
    const banner_img = document.getElementById('banner_img');

    icon.addEventListener('change', loadImg(icon, icon_img));
    banner.addEventListener('change', loadImg(banner, banner_img));
});

function loadImg(input, img){
    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        const imgUrl = e.target.result;

        // Show image in img element
        img.src = imgUrl;
        img.style.display = 'block';
    }

    reader.readAsDataURL(file);
}