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
    $(".image-tool").click(e => {
        const btns = $(".image-tool")
        btns.removeClass().addClass(["image-tool", "btn", "btn-dark"])
        $(e.target).removeClass("btn-dark").addClass("btn-secondary")
    })
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
    $("#fileInput").change(e => display_image(create, e.target))
    $(".template-card").click(e => {
        const img = new Image()
        img.src = e.target.src.replace("/template-thumbnails", "/meme-templates")
        img.onload = upload_base_image(create, img, null)
    })

    setTimeout(() => {
        if (window.remix !== undefined) {
            create.remix = window.remix;
            delete window.remix;
            init_remix(create);
        }
    }, 125);
})

function adjust_spacing(create, value, position) {
    const drawings = new Image()
    drawings.src = create.drawing.canv.toDataURL()

    create.canvas.height = create.dimensions.height * (1 + parseFloat(value))
    create.drawing.canv.height = create.dimensions.height * (1 + parseFloat(value))

    create.ctx.drawImage(
        create.baseImg, create.cropData.left, 
        create.cropData.top, create.cropData.width, 
        create.cropData.height, 0, 
        create.dimensions.height * parseFloat(value) * parseFloat(position),
        create.dimensions.width, create.dimensions.height)
}

function post(create) {
    return function(e) {
        if ($("#post-title").val() == "") {
            alert("You must give your post a title before posting!")
            // TODO: fix
        } else if (create.baseImg == undefined) {
            alert("You must upload an image before posting!")
            // TODO: fix
        } else {
            // assemble meme
            meme = {
                template: create.template,
                spacing: $("#spacer").val(),
                space_arrangement: $("#space-arrangement").val(),
                textboxes: $.map($(".text-box"), elem => new MemeTextBox(create, elem)),
                images: create.images.map(img => new ExtraImage(create, img)),
                imgData: create.baseImg.src,
                title: $("#post-title").val(),
                user: create.user.username,
                drawing: create.drawing.canv.toDataURL()
            }

            // take screenshot for saving
            $(".meme-component").css("border", "none")
            $("#meme-img").css("border", "none")
            html2canvas($("#meme")[0], {useCORS: true, allowTaint: true})
                .then(canvas => meme.thumbnailData = canvas.toDataURL('image/png'))
                .then(() => {
                    // send post to backend
                    fetch("/create/", {
                        method: "POST",
                        body: JSON.stringify(meme),
                        headers: { "Content-Type": "application/json" }
                    }).then(response => {
                        if (response.ok) {
                            window.location.href = "/profile/"
                        } else {
                            alert("Sorry, we had an issue posting this meme, please try again laters")
                        }
                    })
                })
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
        $(".image-container").each(enable_meme_component("image"))
        $("text-box-container").each(enable_meme_component("text-box"))
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
            $(elem)
                .draggable({containment: "parent"})
                .resizable({containment: "parent", handles: "all"})
                .mouseover(e => bring_to_front($(e.target).parents(`.${type}-container`)))
        }
    }
}

function disable_meme_component(i, elem) {
    try {
        $(elem).off("click").resizable("destroy").draggable("destroy")
    } catch (error) {}
}

function init_remix(create) {
    // upload base image
    const remixed_img = new Image()
    remixed_img.src = `${window.location.origin}/static/images/${create.remix.backImage}`
    remixed_img.onload = () => {
        upload_base_image(create, remixed_img, null)(null)

        // remove default text boxes
        $(".fa-trash").click()
        create.textboxes = []

        // set text boxes
        create.remix.textBoxes.forEach((tb, i) => {
            // create textbox and set text
            add_text_box(create)
            create.textboxes[i].children("textarea").val(tb.content).trigger("input")

            // adjust settings            
            $(`#alignment-${i}`).val(tb.alignment).trigger("change")
            $(`#fontsize-${i}`).val(tb.fontSize).trigger("change")
            $(`#font-${i}`).val(tb.font).trigger("change")
            $(`#fontcolor-${i}`).val(tb.color).trigger("change")
            $(`#fontshadow-${i}`).val(tb.shadowColor).trigger("change")
            if (tb.decorations[0]) { $(`#bold-${i}`).click() }
            if (tb.decorations[1]) { $(`#italics-${i}`).click() }
            if (tb.decorations[2]) { $(`#underline-${i}`).click() }
            if (tb.decorations[3]) { $(`#strikethrough-${i}`).click() }
            if (tb.decorations[4]) { $(`#shadow-${i}`).click() }
            if (tb.decorations[5]) { $(`#capitals-${i}`).click() }
            $(`#shadow-${i}`).trigger("change")
            $(`#meme-text-${i}`).parent(".meme-component")
                .css("top", tb.top).css("left", tb.left)
                .width(tb.width).height(tb.height)
        })

        // set temporary title
        $("#post-title").val(create.remix.title)

        // set spacing
        $("#spacer").val(create.remix.spacing).trigger("change")
        $("#space-arrangement").val(create.remix.space_arrangement).trigger("change")

        // draw on canvas
        const draw = new Image()
        draw.src = create.remix.draw
        draw.onload = () => create.drawing.ctx.drawImage(draw, 0, 0)
        
        // add extra images
        create.remix.extraImages.forEach((img, i) => {
            const cont = $(`<div class = 'image-container' style = "top: 0"></div>`)
            const em = new Image()
            em.src = img.image
            const box = $(`<div class = 'meme-component' style = 'top: 0' id = "image-${i}"></div>`)
            cont.append(box)
            $("#meme").append(cont)
            enable_meme_component("image")(0, box)
            box.append($(em).width("100%").height("100$"))
            box.width(img.width).height(img.height).css("left", img.left).css("top", img.top)
        })
    }
}

class MemeTextBox {
    constructor(create, tb) {
        this.id = tb.id.split("-")[1]
        const mb = $(`#meme-text-${this.id}`).parent(".meme-component")
        this.text = tb.value
        this.width = mb.width()
        this.height = mb.height()
        this.top = mb.css("top")
        this.left = mb.css("left")
        this.id = tb.id.split("-")[1]
        this.settings = {
            alignment: $(`#alignment-${this.id}`).val(),
            font_size: $(`#fontsize-${this.id}`).val(),
            font: $(`#font-${this.id}`).val(),
            font_color: $(`#fontcolor-${this.id}`).val(),
            font_shadow: $(`#fontshadow-${this.id}`).val(),
            is_bold: $(`#bold-${this.id}`).prop("checked"),
            is_italic: $(`#italics-${this.id}`).prop("checked"),
            underlined: $(`#underline-${this.id}`).prop("checked"),
            is_struckthrough: $(`#strikethrough-${this.id}`).prop("checked"),
            has_shadow: $(`#shadow-${this.id}`).prop("checked"),
            is_capitalized: $(`#capitals-${this.id}`).prop("checked"),
        }
    }
}

class ExtraImage {
    constructor(create, img) {
        this.src = img.children()[0].src
        this.top = img.css("top")
        this.left = img.css("left")
        this.width = img.width()
        this.height = img.height()
    }
}