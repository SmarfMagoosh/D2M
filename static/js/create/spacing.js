function spacing_init() {
    $("#spacing-tools").hide()
    $("#spacer").change(e => adjust_spacing(e.target.value, $("#space-arrangement").val()))
    $("#space-arrangement").change(e => adjust_spacing($("#spacer").val(), e.target.value))
}

function adjust_spacing(value, position) {
    console.log(position)
    window.canvas.height = window.create.dimensions.height * (1 + value)
    window.drawing.canv.height = window.create.dimensions.height * (1 + value)
    if (position == "top") {
        window.ctx.drawImage(
            window.create.baseImg, 0,
            window.create.dimensions.height * value,
            window.create.dimensions.width,
            window.create.dimensions.height
        )
    } else if (position == "bottom") {
        window.ctx.drawImage(
            window.create.baseImg, 0, 0,
            window.create.dimensions.width,
            window.create.dimensions.height
        )
    } else {
        window.ctx.drawImage(
            window.create.baseImg, 0,
            window.create.dimensions.height * value / 2,
            window.create.dimensions.width,
            window.create.dimensions.height
        )
    }
}