window.addEventListener("DOMContentLoaded", () => {
    // create namespace for window
    window.create = {}

    // locate important elems
    window.create.textBoxes = [
        document.getElementById("text-1"),
        document.getElementById("text-2")
    ]
    window.create.meme = document.getElementById("meme")

    // get canvas and context for it
    window.create.canvas = document.getElementById("meme-img")
    setTimeout(() => {
        window.create.canvas.width = window.create.canvas.parentNode.clientWidth - 20
    }, 50)
    window.create.ctx = window.create.canvas.getContext("2d")

    // add event listeners to textboxes
    for (let tb of window.create.textBoxes) {
        tb.oninput = function() {
            document.getElementById("meme-" + tb.id).innerHTML = tb.value
        }
    }
})

function upload_base_image(input) {
    const MAX_FILE_SIZE = 1_000_000
    if (FileReader && input.files && input.files.length) {
        let base = input.files[0]
        if (base.size < MAX_FILE_SIZE) {
            let reader = new FileReader();
            reader.onload = function() {
                // get input image as <img>
                window.create.baseImg = new Image()
                window.create.baseImg.src = reader.result
                let aspectRatio = window.create.baseImg.naturalHeight / window.create.baseImg.naturalWidth
                window.create.dimensions = {
                    width: window.create.canvas.width, 
                    height: aspectRatio * window.create.canvas.width
                }

                // adjust width and height of img to fit meme and draw it
                setTimeout(() => {
                    window.create.canvas.height = window.create.dimensions.height
                    window.create.ctx.drawImage(
                        window.create.baseImg, 0, 0, 
                        window.create.canvas.width, 
                        window.create.canvas.height
                    )
                }, 50)
            }
            reader.readAsDataURL(base);
            input.remove()

            document.getElementById("fileInputLabel").remove()

            // Add text boxes
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
    // post body
    meme = {
        // textboxes for the meme
        textboxes: [],
        imgData: document.getElementById("meme-img").src,
        title: document.getElementById("post-title").value
    }
    for (let textarea of document.getElementsByClassName("text-box")) {
        meme.textboxes.push(textarea.value)
    }
    fetch(window.location.href, {
        method: "POST",
        body: JSON.stringify(meme),
        headers: { "Content-type": "application/json; charset=UTF-8" }
    });
}

function cancel_post() {
    window.location.replace(`${window.location.origin}/home`)
}

function adjust_spacing(elem) {
    window.create.canvas.height = window.create.dimensions.height * (1 + Number(elem.value))
    window.create.ctx.drawImage(
        window.create.baseImg,
        0,
        window.create.dimensions.height * elem.value,
        window.create.dimensions.width,
        window.create.dimensions.height
    )
}

function add_text_box(elem) {
    let cont = document.createElement("div")
    
    let box = document.createElement("textarea")
    box.placeholder = `Text #${elem.children.length + 1}`
    box.id = `text-${elem.children.length + 1}`
    box.classList = ['text-box']
    
    let btn = document.createElement("button")
    btn.classList = ['btn']
    btn.innerHTML = "<i class = 'fa fa-trash'></i>"
    btn.onclick = function(ev) {
        ev.target.parentNode.remove()
    }

    cont.appendChild(box)
    cont.appendChild(btn)
    elem.append(cont)
}