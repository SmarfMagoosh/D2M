$("document").ready(() => {
    // create namespace for window
    window.create = {}

    $("#new-box-btn").attr("disabled", true)

    // locate important elems
    window.create.textBoxes = [$("#text-1"), $("#text-2")]
    window.create.meme = $("#meme")[0];

    // get canvas and context for it
    window.create.canvas =  $("#meme-img")[0]
    window.create.canvas.width = window.create.canvas.parentNode.clientWidth - 20 // TODO: async issues
    window.create.ctx = window.create.canvas.getContext("2d")

    // Add text boxes
    $(".meme-text").hide()
    $(".meme-text").mouseover(e => {
        let x = $(e.target).parents(".text-box-container")
        let meme = x.parent()
        x.detach()
        meme.append(x)
    })
        
    // add event listeners to textboxes
    $(".text-box").on("input", e => {
        $(`#meme-${e.target.id}`).resizable("destroy")
        $(`#meme-${e.target.id}`).text(e.target.value)
        $(`#meme-${e.target.id}`).resizable({containment: "parent", handles: "n, ne, e, se, s, sw, w, nw"})
    })
    $("#fileInput").on("input", () => { upload_base_image($("#fileInput")[0]) })
    $(".template-card").click(e => {
        window.create.baseImg = new Image()
        window.create.baseImg.src = e.target.src.replace("/thumbnails", "/meme-templates")
        window.create.baseImg.onload = function() {
            let aspectRatio = window.create.baseImg.naturalHeight / window.create.baseImg.naturalWidth
            window.create.dimensions = {
                width: window.create.canvas.width, 
                height: aspectRatio * window.create.canvas.width
            }
            // adjust width and height of img to fit meme and draw it
            window.create.canvas.height = window.create.dimensions.height
            window.create.ctx.drawImage(
                window.create.baseImg, 0, 0, 
                window.create.canvas.width, 
                window.create.canvas.height
            )
            $(".text-box-container")
                .width(window.create.canvas.width)
                .height(window.create.canvas.height)
                .attr("style", "top: 0")
        }

        $("#fileInputLabel").remove()
        $(".meme-text").show()
        $(".meme-text").draggable({containment: "parent"}).resizable({containment: "parent", handles: "n, ne, e, se, s, sw, w, nw"})
        $("#new-box-btn").attr("disabled", false)
        $("#list-opener").remove()
        window.numboxes = 2
    })
    // add mor event listeners
    $("#post-btn").click(post)
    $("#cancel-btn").click(cancel_post)
    $("#spacer").click(e => adjust_spacing(e.target))
    $(".trash-btn").click(e => delete_box(e.target))
    $(".settings-btn").click(e => {
        let elem = e.target.tagName == "I" ? e.target.parentNode : e.target;
        $(elem.nextElementSibling).show();
    })
    $("#new-box-btn").click(e => add_text_box(e.target.parentNode.previousElementSibling))
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
                window.create.baseImg.onload = function() {
                    let aspectRatio = window.create.baseImg.naturalHeight / window.create.baseImg.naturalWidth
                    window.create.dimensions = {
                        width: window.create.canvas.width, 
                        height: aspectRatio * window.create.canvas.width
                    }

                    // adjust width and height of img to fit meme and draw it
                    window.create.canvas.height = window.create.dimensions.height
                    window.create.ctx.drawImage(
                        window.create.baseImg, 0, 0, 
                        window.create.canvas.width, 
                        window.create.canvas.height
                    )
                    $(".text-box-container")
                        .width(window.create.canvas.width)
                        .height(window.create.canvas.height)
                        .attr("style", "top: 0")
                }
                
            }
            reader.readAsDataURL(base);

            $("#fileInputLabel").remove()
            $(".meme-text").show()
            $(".meme-text").draggable({containment: "parent"}).resizable({containment: "parent", handles: "n, ne, e, se, s, sw, w, nw"})
            $("#new-box-btn").attr("disabled", false)
            $("#list-opener").remove()
            $("#meme-img").
            window.numboxes = 2
        } else {
            alert("That image is too large! we only accept files less than ______mb");
        }
    }
}

function post() {
    meme = {
        spacing: $("#spacer").val(),
        textboxes: [],
        imgData: window.create.canvas.toDataURL(),
        title: $("#post-title")[0].value
    }
    for (let textarea of $(".text-box")) {
        let tb = new MemeTextBox(textarea)
        meme.textboxes.push(tb)
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
    window.create.canvas.height = window.create.dimensions.height * (1 + elem.value)
    window.create.ctx.drawImage(
        window.create.baseImg, 0,
        window.create.dimensions.height * elem.value,
        window.create.dimensions.width,
        window.create.dimensions.height
    )
}

function add_text_box(elem) {
    window.numboxes += 1;
    let cont = $("<div></div>")

    let box = $("<textarea></textarea>")
        .attr("placeholder", `Enter Text`)
        .attr("id", `text-${window.numboxes}`)
        .attr("class", "text-box")

    let meme_text = $("<div></div>")
        .attr("class", "meme-text")
        .attr("style", "top: 50%")
        .attr("id", `meme-text-${window.numboxes}`)

    let btn1 = $("<button></button>")
        .attr("class", "btn settings-btn")
        .html("<i class = 'fa fa-gear'></i>")
        .on("click", e => function() { /* TODO: show modal for settings */})

    let btn2 = $("<button></button>")
        .attr("class", "btn trash-btn")
        .html("<i class = 'fa fa-trash'></i>")
        .click(e => delete_box(e.target))

    window.create.textBoxes.push(box);

    cont.append(box, btn1, btn2)
    elem.append(cont[0])
    $("#meme").append(
        $("<div class = 'text-box-container' style = 'top: 0'></div>")
            .html(`<div class = 'meme-text' id = 'meme-text-${window.numboxes}'></div>`)
    )
    $(".meme-text")
        .draggable({containment: "parent"})
        .resizable({containment: "parent", handles: "n, ne, e, se, s, sw, w, nw"})
        .mouseover(e => {
            let x = $(e.target).parents(".text-box-container")
            let meme = x.parent()
            x.detach()
            meme.append(x)
        })
    $(".text-box").on("input", e => {
        $(`#meme-${e.target.id}`).resizable("destroy")
        $(`#meme-${e.target.id}`).text(e.target.value)
        $(`#meme-${e.target.id}`).resizable({containment: "parent", handles: "n, ne, e, se, s, sw, w, nw"})
    })
}

function delete_box(btn) {
    while (btn.tagName != "DIV") { btn = btn.parentNode }
    let id = btn.children[0].id
    btn.remove()
    $(`#meme-${id}`).remove()
    window.numboxes -= 1
}

class MemeTextBox {
    constructor(tb) {
        // TODO: settings
        let meme_box = $(`#meme-${tb.id}`)
        this.text = tb.value
        this.width = tb.clientWidth / window.create.dimensions.width
        this.height = tb.clientHeight / window.create.dimensions.height
        this.top = meme_box[0].style.top == "" ? 0 : parseInt(meme_box[0].style.top)
        this.left = meme_box[0].style.left == "" ? 0 : parseInt(meme_box[0].style.left)
        this.top /= window.create.dimensions.height
        this.left /= window.create.dimensions.width
        this.id = tb.id
    }
}