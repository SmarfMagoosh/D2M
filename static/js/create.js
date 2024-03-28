$("document").ready(() => {
    //namespace for window
    window.create = {}
    drawing_init($("#drawing"))
    spacing_init()
    textbox_init()
    $("#image-tool-bar").hide()

    // no creating text boxes until image selected
    $("#new-box-btn").attr("disabled", true)
    $(".settings-menu").attr("disabled", true)
    $(".trash-btn").attr("disabled", true)

    // locate important elems
    window.create.meme = $("#meme")[0];

    // get canvas and context for it
    window.canvas =  $("#meme-img")[0]
    window.canvas.width = window.canvas.parentNode.clientWidth - 20
    window.drawing.canv.width = window.canvas.parentNode.clientWidth - 20
    window.ctx = window.canvas.getContext("2d")
        
    // add event listeners to textboxes
    $(".text-box").change(e => $(`#meme-${e.target.id}`).text(e.target.value))

    // add more event listeners
    $("#post-btn").click(post)
    $("#cancel-btn").click(cancel_post)
    $(".trash-btn").click(e => delete_box(e.target))
    
    $("#new-box-btn").click(add_text_box)
    $("#list-opener").click(e => $("#template-list").modal())
    $("#fileInputBtn, #fileInputBtn2").click(e => $("#fileInput").click())
    $(".image-tool").click(e => update_tools(e.target.innerText))

    $(".text-box-container").hide()

    // event listeners for adding the base image
    $("#fileInput").change(e => upload_base_image($("#fileInput")[0]))
    $(".template-card").click(e => {
        // create image of the clicked template
        window.create.baseImg = new Image()
        window.create.baseImg.src = e.target.src.replace("/template-thumbnails", "/meme-templates")
        window.create.baseImg.onload = function() {
            // get height and width of image
            let aspectRatio = window.create.baseImg.naturalHeight / window.create.baseImg.naturalWidth
            window.create.dimensions = {
                width: window.canvas.width, 
                height: aspectRatio * window.canvas.width
            }
            // adjust width and height of img to fit meme and draw it
            window.canvas.height = window.create.dimensions.height
            window.drawing.canv.height = window.create.dimensions.height
            window.ctx.drawImage(
                window.create.baseImg, 0, 0, 
                window.canvas.width, 
                window.canvas.height
            )
            // adjust text box widget to fit canvas
            $(".text-box-container")
                .width(window.canvas.width)
                .height(window.canvas.height)
                .attr("style", "top: 0")
            $("#template-modal-button").remove()
        }
        add_text_box()
        add_text_box()
        $("#fileInputLabel").remove()
        $("#new-box-btn").attr("disabled", false)
        $(".settings-menu").attr("disabled", false)
        $(".trash-btn").attr("disabled", false)
        $("#list-opener").remove()
        $("#fileInputBtn").remove()
        $("#img-tool-bar").show()
        $("#image-tool-bar").show()
        $("#drawing").show()
    })
})

function upload_base_image(input) {
    const MAX_FILE_SIZE = 4_000_000
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
                        width: window.canvas.width, 
                        height: aspectRatio * window.canvas.width
                    }

                    // adjust width and height of img to fit meme and draw it
                    window.canvas.height = window.create.dimensions.height;
                    window.create.draw.height = window.create.dimensions.height;
                    window.ctx.drawImage(
                        window.create.baseImg, 0, 0, 
                        window.canvas.width, 
                        window.canvas.height
                    )
                    $(".text-box-container").width(window.canvas.width)
                        .height(window.canvas.height).attr("style", "top: 0")
                    $("#template-modal-button").remove()
                    $("#img-tool-bar").show()
                }
            }
            reader.readAsDataURL(base);
            $("#fileInputLabel").remove()
            $(".meme-text").show()
            $(".meme-text").draggable({containment: "parent"}).resizable({containment: "parent", handles: "n, ne, e, se, s, sw, w, nw"})
            $("#new-box-btn").attr("disabled", false)
            $(".settings-menu").attr("disabled", false)
            $(".trash-btn").attr("disabled", false)
            $("#list-opener").remove()
            $("#fileInputBtn").remove()
            $("#image-tool-bar").show()
            $("#drawing").show()
            window.numboxes = 2
        } else {
            alert(`That image is too large! we only accept files less than ${MAX_FILE_SIZE / 1_000_000}mb`);
        }
    }
}

function post() {
    meme = {
        spacing: document.getElementById("space") === null ? 0 : $("#spacer").val(),
        textboxes: [],
        imgData: window.canvas.toDataURL(),
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
    }).then(response => window.location.href = "../profile");
}

function cancel_post() {
    window.location.replace(`${window.location.origin}/home`)
}

class MemeTextBox {
    constructor(tb) {
        let meme_box = $(`#meme-${tb.id}`)
        this.text = tb.value
        this.width = tb.clientWidth / window.create.dimensions.width
        this.height = tb.clientHeight / window.create.dimensions.height
        this.top = meme_box[0].style.top == "" ? 0 : parseInt(meme_box[0].style.top)
        this.left = meme_box[0].style.left == "" ? 0 : parseInt(meme_box[0].style.left)
        this.top /= window.create.dimensions.height
        this.left /= window.create.dimensions.width
        this.id = tb.id.split("-")[1]
        let int_id = tb.id.split("-")[1]
        this.settings = {
            alignment: $(`#alignment-${int_id}`).val(),
            font_size: $(`#font-size-${int_id}`).val(),
            font: $(`#font-${int_id}`).val(),
            font_color: $(`#font-color-${int_id}`).val(),
            font_shadow: $(`#font-shadow-${int_id}`).val(),
            is_bold: $(`#bold-${int_id}`).val(),
            is_italic: $(`#italics-${int_id}`).val(),
            underlined: $(`#underline-${int_id}`).val(),
            is_struckthrough: $(`#strikethrough-${int_id}`).val(),
            has_shadow: $(`#shadow-${int_id}`).val(),
            is_capitalized: $(`#capitals-${int_id}`).val(),
        }
    }
}

function update_tools(tool_bar) {
    if (tool_bar == "Adjust Spacing") {
        $("#image-tools").children().hide()
        $("#spacing-tools").show()
        $(".text-box-container").each((i, elem) => {
            console.log(elem)
            let meme = $(elem).parent()
            $(elem).detach()
            meme.append(elem)
        })
        enable_textboxes()
    } else if (tool_bar == "Draw") {
        $("#image-tools").children().hide()
        $("#drawing-tools").show()
        disable_textboxes()
        let x = $("#drawing")
        let meme = x.parent()
        x.detach()
        meme.append(x)
    } else if (tool_bar == "Add Image") {

    }
}