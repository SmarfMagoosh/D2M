$("document").ready(() => {
    const create = {}
    fetch("/getUserInfo")
        .then(response => response.ok ? response.json() : Promise.reject(response))
        .then(data => create.user = data)
    drawing_init(create)
    textbox_init(create)
    add_image_init(create)

    window.get_create = () => create
    $("#image-tool-bar").hide()
    $("#new-box-btn").attr("disabled", true)
    $("#spacing-tools").hide()
    $("#spacer").change(e => adjust_spacing(create, e.target.value, $("#space-arrangement").val()))
    $("#space-arrangement").change(e => adjust_spacing(create, $("#spacer").val(), e.target.value))

    create.canvas =  $("#meme-img")[0]
    create.canvas.width = create.canvas.parentNode.clientWidth - 20
    create.drawing.canv.width = create.canvas.parentNode.clientWidth - 20
    create.ctx = create.canvas.getContext("2d")

    $("#post-btn").click(post(create))
    $("#new-box-btn").click(e => add_text_box(create))
    $(".image-tool").click(e => update_tools(e.target.innerText))

    $("#switch-btn").hide()
    $("#fileInput").change(e => display_image(create, e.target))//upload_base_image(create, e.target))
    $(".template-card").click(e => {
        const img = new Image()
        img.src = e.target.src.replace("/template-thumbnails", "/meme-templates")
        img.onload = upload_base_image(create, img)
    })
})

function adjust_spacing(create, value, position) {
    const drawings = new Image()
    // drawings.crossOrigin="anonymous";
    drawings.src = create.drawing.canv.toDataURL()

    create.canvas.height = create.dimensions.height * (1 + value)
    create.drawing.canv.height = create.dimensions.height * (1 + value)

    create.ctx.drawImage(
        create.baseImg, create.cropData.left, 
        create.cropData.top, create.cropData.width, 
        create.cropData.height, 0, 
        create.dimensions.height * value * position, 
        create.dimensions.width, create.dimensions.height)
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
        $("#meme-img")[0].style.border = "none"
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
        $(".meme-component").each(enable_meme_component)
    } else if (tool_bar == "Draw") {
        $("#drawing-tools").show()
        $(".meme-component").each(disable_meme_component)
        bring_to_front($("#drawing"))
    }
}

function bring_to_front(elem) {
    const p = elem.parent()
    elem.detach()
    p.append(elem)
}

function enable_meme_component(type) {
    return (i, elem) => {
        try {
            $(elem).resizable("option", "disabled")
        } catch (error) {
            $(elem).draggable({containment: "parent"})
                .resizable({containment: "parent", handles: "n, ne, e, se, s, sw, w, nw"})
                .mouseover(e => bring_to_front($(e.target).parents(`.${type}-container`)))
        }
    }
}

function disable_meme_component(i, elem) {
    $(elem).off("click").resizable("destroy").draggable("destroy")
}