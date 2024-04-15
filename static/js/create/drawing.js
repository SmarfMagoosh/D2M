function drawing_init(create) {
    const canvas = $("#drawing")
    create.drawing = {
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
    create.drawing.ctx.lineCap = "round";
    create.drawing.ctx.lineJoin = "round";

    canvas.mousedown(drawMousedown(create));
    canvas.mouseup(drawMouseup(create));
    canvas.mousemove(drawMousemove(create));
    canvas.hide()
    $("#drawing-tools").hide()
    $("#color").change(e => {
        $(e.target).css("background-color", e.target.value)
        create.drawing.color = e.target.value
    })
    $("#color").css("background-color", $("#color").val()).css("border", "none")
    $("#thickness").on("change", e => create.drawing.thickness = e.target.value)
    $("#erase").click(e => {
        $("#erase").toggleClass("btn-danger btn-outline-danger");
        create.drawing.erase = !create.drawing.erase;
    })
}

function drawMousedown(create) {
    return function(e) {
        if (e.buttons % 2 == 1 && !create.drawing.erase) { 
            create.drawing.mouseStart = {'x': e.offsetX, 'y': e.offsetY};
            create.drawing.ctx.beginPath();
            create.drawing.ctx.moveTo(create.drawing.mouseStart.x, create.drawing.mouseStart.y);
        } else if (create.drawing.erase) {
            create.drawing.ctx.clearRect(
                e.offsetX - create.drawing.thickness / 2,
                e.offsetY - create.drawing.thickness / 2,
                create.drawing.thickness,
                create.drawing.thickness
            )
        }
    }
}

function drawMouseup(create) {
    return function(e) {
        if (e.buttons % 2 == 0 && !create.drawing.erase) {
            draw(create, {'x': e.offsetX, 'y': e.offsetY});
            create.drawing.ctx.closePath();
            create.drawing.mouseStart = null;
        }
    }
}

function drawMousemove(create) {
    return function(e) {
        const now = new Date();
        if ((now - create.drawing.last) < create.drawing.timeout) { return; }
        create.drawing.last = now;

        if (create.drawing.mouseStart !== null && e.buttons % 2 == 1  && !create.drawing.erase) {
            console.log("drawing")
            create.drawing.mouseStart = {'x': e.offsetX, 'y': e.offsetY};
            draw(create, create.drawing.mouseStart);
        } else if (e.buttons % 2 == 1 && create.drawing.erase) {
            console.log("erasing")
            create.drawing.ctx.clearRect(
                e.offsetX - create.drawing.thickness / 2,
                e.offsetY - create.drawing.thickness / 2,
                create.drawing.thickness,
                create.drawing.thickness
            )
        }
    }
}

function draw(create, end) {
    create.drawing.ctx.lineWidth = create.drawing.thickness;
    create.drawing.ctx.strokeStyle = create.drawing.color;
    create.drawing.ctx.lineTo(end.x, end.y);
    create.drawing.ctx.stroke();
}