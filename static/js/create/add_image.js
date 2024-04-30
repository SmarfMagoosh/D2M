function add_image_init(create) {
    create.images = []
    $("#switch-btn").click(e => {
        window.switching = true
        $("#image-modal-header").text("Upload Base Image")
    })
    $("#addImgBtn").click(e => $("#fileInput").click())
    $("#uploadImgBtn").hide()
    $("#upload-close").click(e => {    
        $(`#${$(e.target).attr("data-dismiss")}`).modal("close")
    })
    $("#image-modal-button").click(e => {
        if (create.baseImg === undefined) {
            window.switching = true;
        } else {
            window.switching = false;
        }
        $("#image-modal-header").text("Insert Additional Image")
        $(`#${$(e.target).attr("data-dismiss")}`).modal("open")
    })
}

function display_image(create, input) {
    const img = new Image()
    const canv = $("#added-image-preview")[0]
    const ctx = canv.getContext("2d")
    const baseImg = window.switching
    const MAX_FILE_SIZE = baseImg ? 4_000_000 : 2_000_000
    if (FileReader && input.files && input.files.length) {
        const base = input.files[0]
        img.id = base.name
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
        } else {
            alert(`That file is too large! We only accept files less than ${MAX_FILE_SIZE / 1_000_000}MB`)
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
    const box = cropExtraImage(create, img, display, $("#cropper"))
        .attr("id", `image-${create.images.length}`)

    $("#meme")
        .append($(`<div class = 'image-container' style = 'top: 0'></div>`).append(box));
    $(".meme-component").each(enable_meme_component)
    $("#uploadImgBtn").hide()
    reset_canvas()

    const style = localStorage.getItem("theme") == "dark" ? "dark" : "light"
    const tool = $(`
    <div style = "display: flex; justify-content: left;">
        <textarea style = "width: 22.75rem" class = "form-control text-box bg-${style}" readonly = "true">${img.id}</textarea>
        <button class = "btn btn-danger img-trash-btn"><i class = "fa-solid fa-trash"></i></button>
    </div>`)
    $("#text-tool-bar").append(tool)
    $(".img-trash-btn").click(e => {
        const name = $(e.target).parents("#text-tool-bar > div").children("textarea").val()
        for (let i = 0; i < create.images.length; i++) {
            if (create.images[i] === undefined) {
                continue;
            }
            if (create.images[i].children("img").attr("id") == name) {
                $(create.images[i]).parents(".image-container").remove()
                $(e.target).parents("#text-tool-bar > div").remove()
                delete create.images[i];
                break;
            }
        }
    })
}

function reset_canvas() {
    const canv = $("#added-image-preview")[0]
    const ctx = canv.getContext("2d")
    ctx.clearRect(0, 0, canv.width, canv.height)
    canv.height = 0;
    $("#cropper").parent().remove()
}

function cropBaseImage(create, img, display, crop) {
    create.template = true
    let [top, left, width, height] = [0, 0, img.naturalWidth, img.naturalHeight]
    let aspectRatio = img.naturalHeight / img.naturalWidth
    if (display !== null) {
        create.template = false

        const scaledRatio = img.naturalWidth / display.width;
        aspectRatio = crop.height() / crop.width();

        [top, left] = [scaledRatio * parseInt(crop.css("top")), scaledRatio * parseInt(crop.css("left"))];
        [width, height] = [scaledRatio * crop.width(), scaledRatio * crop.height()];
    }
    

    create.dimensions = {
        width: create.canvas.width, 
        height: aspectRatio * create.canvas.width
    }

    create.canvas.height = create.dimensions.height;
    create.drawing.canv.height = create.dimensions.height;
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

    while (canv[0].height >= create.canvas.height || canv[0].width >= create.canvas.width) {
        canv[0].height /= 2
        canv[0].width /= 2
    }

    ctx.drawImage(img, left, top, width, height, 0, 0, canv[0].width, canv[0].height);

    const croppedImg = new Image()
    croppedImg.src = canv[0].toDataURL();

    croppedImg.id = img.id

    const cont = $(`<div class = 'meme-component' style = 'top: 0'></div>`);
    cont.width(canv[0].width).height(canv[0].height).append($(croppedImg))
    $(croppedImg).width("100%").height("100%")

    create.images.push(cont)
    return cont;
}