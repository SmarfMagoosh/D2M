window.addEventListener("DOMContentLoaded", () => {
    // create namespace for window
    window.create = {}

    // locate important elems
    window.create.textBoxes = [
        document.getElementById("text-1"),
        document.getElementById("text-2")
    ]
    window.create.img = document.getElementById("meme-img")
    window.create.meme = document.getElementById("meme")
    for (let tb of window.create.textBoxes) {
        tb.oninput = function() {
            console.log(document.getElementById("meme-" + tb.id))
            document.getElementById("meme-" + tb.id).innerHTML = tb.value
        }
    }

})

function baseMemeUploaded(input) {
    const MAX_FILE_SIZE = 1_000_000
    if (FileReader && input.files && input.files.length) {
        let base = input.files[0]
        if (base.size < MAX_FILE_SIZE) {
            let reader = new FileReader();
            reader.onload = function() {
                window.create.img.src = reader.result
            }
            reader.readAsDataURL(base);
            input.hidden = true;
            window.create.img.hidden = false;
            document.getElementById("fileInputLabel").remove()

            let d1 = document.createElement("div");
            d1.classList = ["meme-text"]
            d1.style.top = "2rem"
            d1.id = "meme-text-1"

            let d2 = document.createElement("div");
            d2.classList = ["meme-text"]
            d2.style.bottom = "2rem"
            d2.id = "meme-text-2"

            window.create.meme.appendChild(d1)
            window.create.meme.appendChild(d2)
        } else {
            alert("That image is too large! we only accept files less than ______mb");
        }
    }
}

function post() {
    meme = {
        textboxes: [],
        imgData: document.getElementById("meme-img").src,
        title: document.getElementById("post-title").value
    }
    for (let textarea of document.getElementsByClassName("text-box")) {
        meme.textboxes.push({
            text: "hello world"
        })
    }
    fetch(window.location.href, {
        method: "POST",
        body: JSON.stringify(meme),
        headers: { "Content-type": "application/json; charset=UTF-8" }
    });
}

function cancelPost() {
    window.location.replace(`${window.location.origin}/home`)
}