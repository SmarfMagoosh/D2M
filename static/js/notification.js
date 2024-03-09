window.addEventListener('DOMContentLoaded', () => {
    const notif_count = document.getElementById('notif_count');
    const notif_list = document.getElementById('notif_list');
    const count = 0;
    notif_count.innerText = count==0 ? "" : count;
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