
$("document").ready(() => {
    // create namespace for window
    window.create = {}

    // locate important elems
    window.create.textBoxes = [$("#text-1"), $("#text-2")]
    window.create.meme = $("#meme")[0];

    // get canvas and context for it
    window.create.canvas =  $("#meme-img")[0]
    window.create.canvas.width = window.create.canvas.parentNode.clientWidth - 20 // TODO: async issues
    window.create.ctx = window.create.canvas.getContext("2d")

    // Add text boxes
    $("#meme").append(
        $("<div></div>").attr("class", "meme-text").attr("id", "meme-text-1")
        .attr("style", "top: 2rem").text(window.create.textBoxes[0].value).hide(),
        $("<div></div>").attr("class", "meme-text").attr("id", "meme-text-2")
        .attr("style", "bottom: 2rem").text(window.create.textBoxes[1].value).hide()
    );
    $(".meme-text").draggable()
    $(".meme-text").resizable()

    // add event listeners to textboxes
    $(".text-box").on("input", e => $(`#meme-${e.target.id}`).text(e.target.value))
    $("#fileInput").on("input", () => { upload_base_image($("#fileInput")[0]) })

    // add mor event listeners
    $("#post-btn").click(post)
    $("#cancel-btn").click(cancel_post)
    $("#spacer").click(e => adjust_spacing(e.target))
    $(".trash-btn").click(e => delete_box(e.target.parentNode.children[0], e.target))
    $("#new-box-btn").click(e => add_text_box(e.target.parentNode.previousElementSibling))
})

function upload_base_image(input) {
    const MAX_FILE_SIZE = 1_000_000
    if (FileReader && input.files && input.files.length) {
        let base = input.files[0]
        if (base.size < MAX_FILE_SIZE) {
            let reader = new FileReader();
            reader.onload = async function() {
                // get input image as <img>
                window.create.baseImg = new Image()
                window.create.baseImg.src = reader.result
                let aspectRatio = window.create.baseImg.naturalHeight / window.create.baseImg.naturalWidth
                window.create.dimensions = {
                    width: window.create.canvas.width, 
                    height: aspectRatio * window.create.canvas.width
                }

                // adjust width and height of img to fit meme and draw it 
                window.create.canvas.height = window.create.dimensions.height // TODO: async issues
                window.create.ctx.drawImage(
                    window.create.baseImg, 0, 0, 
                    window.create.canvas.width, 
                    window.create.canvas.height
                )
            }
            reader.readAsDataURL(base);
            input.remove()

            $("#fileInputLabel").remove()
            $(".meme-text").show()
        } else {
            alert("That image is too large! we only accept files less than ______mb");
        }
    }
}

function post() {
    meme = {
        textboxes: [],
        imgData: window.create.canvas.toDataURL(),
        title: $("#post-title")[0].value
    }
    for (let textarea of $(".text-box")) {
        meme.textboxes.push(textarea.value)
    }
    console.log(meme)
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
        window.create.baseImg, 0,
        window.create.dimensions.height * elem.value,
        window.create.dimensions.width,
        window.create.dimensions.height
    )
}

function add_text_box(elem) {
    // create container
    let cont = document.createElement("div")
    
    //create and style textbox
    let box = document.createElement("textarea")
    box.placeholder = `Text #${elem.children.length + 1}`
    box.id = `text-${elem.children.length + 1}`
    box.classList = ['text-box']
    box.oninput = function() {
        document.getElementById("meme-" + box.id).innerHTML = box.value
    }

    // create and style div of text to be displayed on the meme
    let meme_text = document.createElement("div");
    meme_text.classList = ["meme-text"]
    meme_text.style.top = "50%"
    meme_text.id = `meme-text-${elem.children.length + 1}`
    
    // create and style the delete button
    let btn = document.createElement("button")
    btn.classList = ['btn']
    btn.innerHTML = "<i class = 'fa fa-trash'></i>"
    btn.onclick = function(ev) {
        delete_box(ev.target.parentNode.children[0].id, ev.target)
    }

    window.create.textBoxes.push(box);

    // append everything to respective elements
    cont.appendChild(box)
    cont.appendChild(btn)
    elem.append(cont)
    window.create.meme.appendChild(meme_text)
}

function delete_box(id, btn) {
    btn.remove();
    document.getElementById(id).remove();
    document.getElementById(`meme-${id}`).remove();
}