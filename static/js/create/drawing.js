function drawing_init() {
    const canvas = $("#drawing")
    window.drawing = {
        canv: canvas[0],
        mouseStart: null,
        ctx: canvas[0].getContext("2d"),
        last: new Date(),
        timeout: 25,
        erase: false,
        eraseDown: false,
        color: $("#color").val(),
        thickness: $("#thickness").val(),
    }
    window.drawing.ctx.lineCap = "round";
    window.drawing.ctx.lineJoin = "round";

    canvas.mousedown(drawMousedown);
    canvas.mouseup(drawMouseup);
    canvas.mousemove(drawMousemove);
    canvas.hide()
    $("#drawing-tools").hide()
    $("#color").change(e => {
        $(e.target).css("background-color", e.target.value)
        window.drawing.color = e.target.value
    })
    $("#color").css("background-color", $("#color").val()).css("border", "none")
    $("#thickness").on("change", e => window.drawing.thickness = e.target.value)
    $("#erase").click(e => {
        $("#erase").toggleClass("btn-danger btn-outline-danger");
        window.drawing.erase = !window.drawing.erase;
    })
}

function drawMousedown(e) {
    if (e.buttons % 2 == 1 && !window.drawing.erase) { 
        window.drawing.mouseStart = {'x': e.offsetX, 'y': e.offsetY};
        window.drawing.ctx.beginPath();
        window.drawing.ctx.moveTo(window.drawing.mouseStart.x, window.drawing.mouseStart.y);
    } else if (window.drawing.erase) {
        window.drawing.ctx.clearRect(
            e.offsetX - window.drawing.thickness / 2,
            e.offsetY - window.drawing.thickness / 2,
            window.drawing.thickness,
            window.drawing.thickness
        )
    }
}

function drawMouseup(e) {
    if (e.buttons & 2 == 0 && !window.drawing.erase) {
        // end the path
        draw({'x': e.offsetX, 'y': e.offsetY});
        window.drawing.ctx.closePath();
        window.drawing.mouseStart = null;
    }
}

function drawMousemove(e) {
    const now = new Date();
    if ((now - window.drawing.last) < window.drawing.timeout) { return; }
    window.drawing.last = now;

    if (window.drawing.mouseStart !== null && e.buttons % 2 == 1  && !window.drawing.erase) {
        // when not in erase mode, continue the path and draw line segment
        window.drawing.mouseStart = {'x': e.offsetX, 'y': e.offsetY};
        draw(window.drawing.mouseStart);
    } else if (e.buttons % 2 == 1 && window.drawing.erase) {
        // when in erase mode, clear the rectangle around the cursor
        window.drawing.ctx.clearRect(
            e.offsetX - window.drawing.thickness / 2,
            e.offsetY - window.drawing.thickness / 2,
            window.drawing.thickness,
            window.drawing.thickness
        )
    }
}

function draw(end) {
    // draw line as part of existing path
    window.drawing.ctx.lineWidth = window.drawing.thickness;
    window.drawing.ctx.strokeStyle = window.drawing.color;
    window.drawing.ctx.lineTo(end.x, end.y);
    window.drawing.ctx.stroke();
}