$("document").ready(() => {
    //namespace for window
    window.create = {}
    drawing_init()
    textbox_init()
    add_image_init()
    $("#image-tool-bar").hide()
    $("#fileInputBtn").click(e => $("#fileInput").click())

    // no creating or viewing text boxes until image selected
    $("#new-box-btn").attr("disabled", true)

    // initialize spacing tools
    $("#spacing-tools").hide()
    $("#spacer").change(e => adjust_spacing(e.target.value, $("#space-arrangement").val()))
    $("#space-arrangement").change(e => adjust_spacing($("#spacer").val(), e.target.value))

    // get canvas and context for it
    window.canvas =  $("#meme-img")[0]
    window.canvas.width = window.canvas.parentNode.clientWidth - 20
    window.drawing.canv.width = window.canvas.parentNode.clientWidth - 20
    window.ctx = window.canvas.getContext("2d")

    // add more event listeners
    $("#post-btn").click(post)
    $("#cancel-btn").click(cancel_post)
    $("#new-box-btn").click(add_text_box)
    $(".image-tool").click(e => update_tools(e.target.innerText))

    // event listeners for adding the base image
    $("#fileInput").change(e => upload_base_image(e.target))
    $(".template-card").click(e => init_meme(e.target.src.replace("/template-thumbnails", "/meme-templates")))
})

function adjust_spacing(value, position) {
    // save drawings
    const drawings = new Image()
    drawings.src = window.drawing.canv.toDataURL()

    // set new height for image canvas and drawing canvas
    window.canvas.height = window.create.dimensions.height * (1 + value)
    window.drawing.canv.height = window.create.dimensions.height * (1 + value)

    // redraw base image
    window.ctx.drawImage(
        window.create.baseImg, 0,
        window.create.dimensions.height * value * position,
        window.create.dimensions.width,
        window.create.dimensions.height
    )

    // TODO: redraw drawings translated correctly
}

function init_meme(src) {
    window.create.baseImg = new Image();
    window.create.baseImg.src = src;
    window.create.baseImg.onload = function() {
        let aspectRatio = window.create.baseImg.naturalHeight / window.create.baseImg.naturalWidth
        window.create.dimensions = {
            width: window.canvas.width, 
            height: aspectRatio * window.canvas.width
        }

        // adjust width and height of img to fit meme and draw it
        window.canvas.height = window.create.dimensions.height;
        window.drawing.canv.height = window.create.dimensions.height;
        window.ctx.drawImage(
            window.create.baseImg, 0, 0, 
            window.canvas.width, 
            window.canvas.height
        )
        $("#template-modal-button").hide()
        $("#img-tool-bar").show()
    }
    add_text_box()
    add_text_box()
    $("#fileInputLabel").hide()
    $("#new-box-btn").attr("disabled", false)
    $("#list-opener").hide()
    $("#fileInputBtn").hide()
    $("#img-tool-bar").show()
    $("#image-tool-bar").show()
    $("#drawing").show()
}

function upload_base_image(input) {
    const MAX_FILE_SIZE = 4_000_000
    if (FileReader && input.files && input.files.length) {
        let base = input.files[0]
        if (base.size < MAX_FILE_SIZE) {
            let reader = new FileReader();
            reader.onload = () => init_meme(reader.result)
            reader.readAsDataURL(base);
        } else {
            alert(`That image is too large! we only accept files less than ${MAX_FILE_SIZE / 1_000_000}MB`);
        }
    }
}

function post() {
    meme = {
        spacing: $("#spacer").val(),
        space_arrangement: $("#space-arrangement").val(),
        textboxes: $.map($(".text-box"), elem => new MemeTextBox(elem)),
        imgData: window.canvas.toDataURL(),
        title: $("#post-title").val()
    }
    // fetch(window.location.href, {
    //     method: "POST",
    //     body: JSON.stringify(meme),
    //     headers: { "Content-type": "application/json; charset=UTF-8" }
    // }).then(response => window.location.href = "/profile");
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
        this.settings = {
            alignment: $(`#alignment-${this.id}`).val(),
            font_size: $(`#font-size-${this.id}`).val(),
            font: $(`#font-${this.id}`).val(),
            font_color: $(`#font-color-${this.id}`).val(),
            font_shadow: $(`#font-shadow-${this.id}`).val(),
            is_bold: $(`#bold-${this.id}`).val(),
            is_italic: $(`#italics-${this.id}`).val(),
            underlined: $(`#underline-${this.id}`).val(),
            is_struckthrough: $(`#strikethrough-${this.id}`).val(),
            has_shadow: $(`#shadow-${this.id}`).val(),
            is_capitalized: $(`#capitals-${this.id}`).val(),
        }
    }
}

function update_tools(tool_bar) {
    $("#image-tools").children().hide()
    if (tool_bar == "Adjust Spacing") {
        $("#spacing-tools").show()
        $(".text-box-container").each((i, elem) => bring_to_front($(elem)))
        enable_textboxes()
    } else if (tool_bar == "Draw") {
        $("#drawing-tools").show()
        disable_textboxes()
        bring_to_front($("#drawing"))
    }
}

function bring_to_front(elem) {
    let p = elem.parent()
    elem.detach()
    p.append(elem)
}