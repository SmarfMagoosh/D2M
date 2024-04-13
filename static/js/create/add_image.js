function add_image_init(create) {
    create.images = []
    $("#addImgBtn").click(e => $("#fileInput").click())
    $("#uploadImgBtn").hide()
}

function display_image(create, input) {
    const img = new Image()
    const canv = $("#added-image-preview")[0]
    const ctx = canv.getContext("2d")
    const baseImg = create.baseImg === undefined ? true : false
    const MAX_FILE_SIZE = baseImg ? 4_000_000 : 2_000_000
    if (FileReader && input.files && input.files.length) {
        const base = input.files[0]
        if (base.size < MAX_FILE_SIZE) {
            const reader = new FileReader();
            reader.onload = () => {
                img.src = reader.result
                img.onload = () => {
                    const aspectRatio = img.naturalHeight / img.naturalWidth
                    canv.height = aspectRatio * canv.width;
                    ctx.drawImage(img, 0, 0, canv.width, canv.height)
                    const cont = $(`<div class = 'text-box-container' style = 'backdrop-filter: brightness(50%);'></div>`).width(canv.width);
                    const box = $( `<div class = 'meme-component' style = 'backdrop-filter: brightness(200%);' id = 'cropper'></div`)
                        .width('100%')
                        .height('100%')
                        .draggable({containment: "parent"})
                        .resizable({containment: "parent", handles: "all"})
                    cont.append(box);
                    $(canv).parent().append(cont);
                }
                $("#uploadImgBtn")
                    .show().off("click")
                    .click((baseImg ? upload_base_image : upload_extra_image)(create, img, canv))
            }
            reader.readAsDataURL(base);
        }
    }
}

const upload_base_image = (create, img, display) => function(e) {
    cropBaseImage(create, img, display, $("#cropper"));

    $("#img-btns").hide()
    $("#img-tool-bar").show()
    if (create.textboxes.length == 0) {
        add_text_box(create)
        add_text_box(create)
    }
    $("#fileInputLabel").hide()
    $("#new-box-btn").attr("disabled", false)
    $("#list-opener").hide()
    $("#fileInputBtn").hide()
    $("#img-tool-bar").show()
    $("#image-tool-bar").show()
    $("#drawing").show()
    $("#uploadImgBtn").hide()
    reset_canvas()
    $("#switch-btn").show()
}

const upload_extra_image = (create, img, display) => function(e) {
    const extra_canv = cropExtraImage(create, img, display, $("#cropper"))
        .attr("id", `image-${create.images.length}`)

    $("#meme")
        .append($(`<div class = 'image-container' style = 'top: 0'></div>`)
        .append($("<div class = 'meme-component'></div>").append(extra_canv)))
    $(".meme-component").each(enable_meme_component("image"))
    $("#uploadImgBtn").hide()
    reset_canvas()
}

function reset_canvas() {
    const canv = $("#added-image-preview")[0]
    const ctx = canv.getContext("2d")
    ctx.clearRect(0, 0, canv.width, canv.height)
    canv.height = 0;
    $("#cropper").parent().remove()
}

function cropBaseImage(create, img, display, crop) {
    const scaledRatio = img.naturalWidth / display.width;
    const aspectRatio = crop.height() / crop.width();

    const [top, left] = [scaledRatio * parseInt(crop.css("top")), scaledRatio * parseInt(crop.css("left"))];
    const [width, height] = [scaledRatio * crop.width(), scaledRatio * crop.height()];

    create.dimensions = {
        width: create.canvas.width, 
        height: aspectRatio * create.canvas.width
    }

    create.canvas.height = create.canvas.width * aspectRatio;
    create.drawing.height = create.canvas.height;
    create.baseImg = img;
    create.cropData = {
        left: left,
        top: top,
        width: width,
        height: height
    }
    create.ctx.drawImage(create.baseImg, 
        create.cropData.left, create.cropData.top, create.cropData.width, create.cropData.height,
        0, 0, create.canvas.width, create.canvas.height
    )
}

function cropExtraImage(create, img, display, crop) {
    const scaledRatio = img.naturalWidth / display.width;
    const aspectRatio = crop.height() / crop.width();

    const [top, left] = [scaledRatio * parseInt(crop.css("top")), scaledRatio * parseInt(crop.css("left"))];
    const [width, height] = [scaledRatio * crop.width(), scaledRatio * crop.height()];

    const canv = $("<canvas></canvas>");
    const ctx = canv[0].getContext("2d");

    if (aspectRatio > 1) {
        canv[0].height = create.canvas.height / 3;
        canv[0].width = canv[0].height / aspectRatio;
    } else {
        canv[0].width = create.canvas.width / 3;
        canv[0].height = canv[0].width * aspectRatio;
    }

    ctx.drawImage(img, left, top, height, width, 0, 0, canv[0].width, canv[0].height);

    create.images.push({
        img: canv[0].toDataURL(),
        top: top,
        left: left,
        width: width,
        height: height
    })

    const cont = $(`<div class = 'image-container' style = 'top: 0'></div>`);
    cont.width(canv[0].width).height(canv[0].height).append(canv)
    canv.width("100%").height("100%")

    return canv;
}