$("document").ready(() => {
    //namespace for page
    const create = {}
    fetch("/getUserInfo")
        .then(response => response.ok ? response.json() : Promise.reject(response))
        .then(data => create.user = data)
    drawing_init(create)
    textbox_init(create)
    add_image_init(create)

    window.get_create = () => create
    $("#image-tool-bar").hide()
    $("#fileInputBtn").click(e => $("#fileInput").click())

    // no creating or viewing text boxes until image selected
    $("#new-box-btn").attr("disabled", true)

    // initialize spacing tools
    $("#spacing-tools").hide()
    $("#spacer").change(e => adjust_spacing(create, e.target.value, $("#space-arrangement").val()))
    $("#space-arrangement").change(e => adjust_spacing(create, $("#spacer").val(), e.target.value))

    // get canvas and context for it
    create.canvas =  $("#meme-img")[0]
    create.canvas.width = create.canvas.parentNode.clientWidth - 20
    create.drawing.canv.width = create.canvas.parentNode.clientWidth - 20
    create.ctx = create.canvas.getContext("2d")

    // add more event listeners
    $("#post-btn").click(post(create))
    $("#new-box-btn").click(e => add_text_box(create))
    $(".image-tool").click(e => update_tools(e.target.innerText))

    // event listeners for adding the base image
    $("#fileInput").change(e => upload_base_image(create, e.target))
    $(".template-card").click(e => init_meme(create, e.target.src.replace("/template-thumbnails", "/meme-templates")))
})

function adjust_spacing(create, value, position) {
    // save drawings
    const drawings = new Image()
    // drawings.crossOrigin="anonymous";
    drawings.src = create.drawing.canv.toDataURL()

    // set new height for image canvas and drawing canvas
    create.canvas.height = create.dimensions.height * (1 + value)
    create.drawing.canv.height = create.dimensions.height * (1 + value)

    // redraw base image
    create.ctx.drawImage(
        create.baseImg, 0,
        create.dimensions.height * value * position,
        create.dimensions.width,
        create.dimensions.height
    )
}

function init_meme(create, src) {
    create.baseImg = new Image();
    create.baseImg.src = src;
    // create.baseImg.crossOrigin="anonymous";
    create.baseImg.onload = function() {
        const aspectRatio = create.baseImg.naturalHeight / create.baseImg.naturalWidth
        create.dimensions = {
            width: create.canvas.width, 
            height: aspectRatio * create.canvas.width
        }

        // adjust width and height of img to fit meme and draw it
        create.canvas.height = create.dimensions.height;
        create.drawing.canv.height = create.dimensions.height;
        create.ctx.drawImage(
            create.baseImg, 0, 0, 
            create.canvas.width, 
            create.canvas.height
        )
        $("#template-modal-button").hide()
        $("#img-tool-bar").show()
    }
    add_text_box(create)
    add_text_box(create)
    $("#fileInputLabel").hide()
    $("#new-box-btn").attr("disabled", false)
    $("#list-opener").hide()
    $("#fileInputBtn").hide()
    $("#img-tool-bar").show()
    $("#image-tool-bar").show()
    $("#drawing").show()
}

function upload_base_image(create, input) {
    const MAX_FILE_SIZE = 4_000_000
    if (FileReader && input.files && input.files.length) {
        const base = input.files[0]
        if (base.size < MAX_FILE_SIZE) {
            const reader = new FileReader();
            reader.onload = () => init_meme(create, reader.result)
            reader.readAsDataURL(base);
        } else {
            alert(`That image is too large! we only accept files less than ${MAX_FILE_SIZE / 1_000_000}MB`);
        }
    }
}

function post(create) {
    return function() {
        meme = {
            spacing: $("#spacer").val(),
            space_arrangement: $("#space-arrangement").val(),
            textboxes: $.map($(".text-box"), elem => new MemeTextBox(create, elem)),
            imgData: create.canvas.toDataURL(),
            title: $("#post-title").val(),
            user: create.user.username,
        }

        const boxes = $(".meme-text");
        for (let textarea of boxes) {
            textarea.style.border = "none";
        }
        const grips = $(".ui-icon-gripsmall-diagonal-se");
        for (let grip of grips) {
            grip.hidden = true;
        }
        // take screenshot
        html2canvas($("#meme")[0], {useCORS: true, allowTaint: true})
            .then(canvas => {
                meme.thumbnailData = canvas.toDataURL('image/png');
            }).then(value => {
                fetch("/create", {
                    method: "POST",
                    body: JSON.stringify(meme),
                    headers: { "Content-type": "application/json; charset=UTF-8" }
                });
            })
            // .then(response => window.location.href = "/profile");
    }
}

class MemeTextBox {
    constructor(create, tb) {
        const meme_box = $(`#meme-${tb.id}`)
        this.text = tb.value
        this.width = tb.clientWidth / create.dimensions.width
        this.height = tb.clientHeight / create.dimensions.height
        this.top = meme_box[0].style.top == "" ? 0 : parseInt(meme_box[0].style.top)
        this.left = meme_box[0].style.left == "" ? 0 : parseInt(meme_box[0].style.left)
        this.top /= create.dimensions.height
        this.left /= create.dimensions.width
        this.id = tb.id.split("-")[1]
        this.settings = {
            alignment: $(`#alignment-${this.id}`).val(),
            font_size: $(`#fontsize-${this.id}`).val(),
            font: $(`#font-${this.id}`).val(),
            font_color: $(`#fontcolor-${this.id}`).val(),
            font_shadow: $(`#fontshadow-${this.id}`).val(),
            is_bold: $(`#bold-${this.id}`).val() == "on" ? true : false,
            is_italic: $(`#italics-${this.id}`).val() == "on" ? true : false,
            underlined: $(`#underline-${this.id}`).val() == "on" ? true : false,
            is_struckthrough: $(`#strikethrough-${this.id}`).val() == "on" ? true : false,
            has_shadow: $(`#shadow-${this.id}`).val() == "on" ? true : false,
            is_capitalized: $(`#capitals-${this.id}`).val() == "on" ? true : false,
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
    const p = elem.parent()
    elem.detach()
    p.append(elem)
}