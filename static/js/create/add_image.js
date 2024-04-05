function add_image_init() {
    window.images = []
    $("#addImgInput").change(e => add_image(e))
    $("#addImgBtn").click(e => $("#fileInput").click())
    $("#uploadImgBtn").hide()
}

function add_image(e) {
    const MAX_FILE_SIZE = 2_000_000
    if (FileReader && e.target.files && e.target.files.length) {
        let base = e.target.files[0]
        if (base.size < MAX_FILE_SIZE) {
            const reader = new FileReader();
            reader.onload = () => {
                const newImg = new Image();
                newImg.src = reader.result;
                newImg.onload = () => {
                    const canv = $("#added-image-preview")[0]
                    const ctx = canv.getContext("2d")
                    let aspectRatio = newImg.naturalHeight / newImg.naturalWidth

                    canv.height = aspectRatio * canv.width;
                    ctx.drawImage(newImg, 0, 0, canv.width, canv.height)
                    $("#uploadImgBtn").show().click(e => {
                        const cont = $(`<div class = "image-container" style = "top: 0;"></div>`)
                        const widget = $(`<div class = "extra-img"></div>`)
                            .draggable({containment: "parent"})
                            .resizable({containment: "parent", handles: "n, ne, e, se, s, sw, w, nw"})
                            .width(canv.width)
                            .height(canv.heigh)
                            .mouseover(e => bring_to_front($(e.target)))
                            .append($(newImg))
                        cont.append(widget)
                        window.images.push($(newImg))
                        $("#meme").append(cont)
                    })
                }
            }
            reader.readAsDataURL(base);
        } else {
            alert(`That image is too large! we only accept files less than ${MAX_FILE_SIZE / 1_000_000}MB`);
        }
    }
}