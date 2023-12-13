window.addEventListener("DOMContentLoaded", () => {
    window.create = {}
    window.create.meme = document.getElementById("meme-base")
})

function baseMemeUploaded(input) {
    const MAX_FILE_SIZE = 1_000_000
    if (FileReader && input.files && input.files.length) {
        let base = input.files[0]
        if (base.size < MAX_FILE_SIZE) {
            let reader = new FileReader();
            reader.onload = function() {
                document.getElementById("meme-base").src = reader.result;
            }
            reader.readAsDataURL(base);
            input.hidden = true;
        } else {
            document.getElementById("meme-base").alt = "That image is too large!";
        }
    }
}