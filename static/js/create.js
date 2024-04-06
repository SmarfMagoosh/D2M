$("document").ready(() => {
    $("#image-tool-bar").hide()

    // create namespace for window
    window.create = {}
    window.settings_menu = x => `
        <div>
            <label for = "alignment-${x}">Alignment:</label>
            <select id = "alignment-${x}" class = "form-control settings-alignment">
                <option value = "center">Center</option>
                <option value = "left">Left</option>
                <option value = "right">Right</option>
            </select>
        </div>
        <div>
            <label for = "font-size-${x}">Font Size:</label>
            <input type = "number" min = "1" max = "100" id = "font-size-${x}" value = "32" class = "form-control settings-font-size">
        </div>
        <div>
            <label for = "font-${x}">Font:</label>
            <select id = "font-${x}" class = "form-control settings-font">
                <option value="Arial, sans-serif;">Arial</option>
                <option value="'Arial Black', sans-serif;">Arial Black</option>
                <option value="'Comic Sans MS', cursive;">Comic Sans MS</option>
                <option value="'Courier New', monospace;">Courier New</option>
                <option value="Georgia, serif;">Georgia</option>
                <option value="Impact, sans-serif;" selected>Impact</option>
                <option value="'Times New Roman', Times, serif;">Times New Roman</option>
                <option value="'Trebuchet MS', sans-serif;">Trebuchet MS</option>
                <option value="Verdana, Geneva, sans-serif;">Verdana</option>
                <option value="'Lucida Console', Monaco, monospace;">Lucida Console</option>
                <option value="'Lucida Sans Unicode', 'Lucida Grande', sans-serif;">Lucida Sans Unicode</option>
                <option value="'Palatino Linotype', 'Book Antiqua', Palatino, serif;">Palatino Linotype</option>
                <option value="Tahoma, Geneva, sans-serif;">Tahoma</option>
                <option value="Geneva, Tahoma, sans-serif;">Geneva</option>
                <option value="Helvetica, Arial, sans-serif;">Helvetica</option>
                <option value="'Book Antiqua', Palatino, serif;">Book Antiqua</option>
                <option value="Calibri, Candara, Arial, sans-serif;">Calibri</option>
                <option value="Cambria, Georgia, serif;">Cambria</option>
                <option value="Garamond, Baskerville, 'Baskerville Old Face', 'Hoefler Text', 'Times New Roman', serif;">Garamond</option>
                <option value="'Century Gothic', sans-serif;">Century Gothic</option>
            </select>
        </div>
        <div class = "two-items">
            <div>
                <label for = "font-color-${x}">Color:</label>
                <input type = "color" id = "font-color-${x}" value = "#000000" class = "form-control settings-font-color">
            </div>
            <div>
                <label for = "font-shadow-${x}">Outline:</label>
                <input type = "color" id = "font-shadow-${x}" value = "#ffffff" class = "form-control settings-font-shadow">
            </div>
        </div>
        <div class = "two-items">
            <div>
                <input type = "checkbox" id = "bold-${x}" class = "form-check-input settings-bold">
                <label for = "bold-${x}">Bold</label>
            </div>
            <div>
                <input type = "checkbox" id = "italics-${x}" class = "form-check-input settings-italics">
                <label for = "italics-${x}">Italics</label>
            </div>
        </div>
        <div class = "two-items">
            <div>
                <input type = "checkbox" id = "underline-${x}" class = "form-check-input settings-underline">
                <label for = "underline-${x}">Underline</label>
            </div>
            <div>
                <input type = "checkbox" id = "strikethrough-${x}" class = "form-check-input settings-strikethrough">
                <label for = "strikethrough-${x}">Strike</label>
            </div>
        </div>
        <div class = "two-items">
            <div>
                <input type = "checkbox" id = "shadow-${x}" class = "form-check-input settings-shadow" checked>
                <label for = "shadow-${x}">Shadow</label>
            </div>
            <div>
                <input type = "checkbox" id = "capitals-${x}" class = "form-check-input settings-capitals" checked>
                <label for = "capitals-${x}">All Caps</label>
            </div>
        </div>
    `

    // no create text boxes until image selected
    $("#new-box-btn").attr("disabled", true)
    $(".settings-menu").attr("disabled", true)
    $(".trash-btn").attr("disabled", true)

    // locate important elems
    window.create.textBoxes = [$("#text-1"), $("#text-2")]
    window.create.meme = $("#meme")[0];
    window.create.draw = $("#drawing")[0];

    // get canvas and context for it
    window.canvas =  $("#meme-img")[0]
    window.canvas.width = window.canvas.parentNode.clientWidth - 20
    window.create.draw.width = window.canvas.parentNode.clientWidth - 20
    window.ctx = window.canvas.getContext("2d")

    const canv = $("#drawing")[0]
    window.drawing = {
        mouseStart: null,
        ctx: canv.getContext("2d"),
        last: new Date(),
        timeout: 25,
        erase: false,
        eraseDown: false
    }
    window.drawing.ctx.lineCap = "round";
    window.drawing.ctx.lineJoin = "round";

    $("#drawing").mousedown(drawMousedown);
    $("#drawing").mouseup(drawMouseup);
    $("#drawing").mousemove(drawMousemove);

    // Add text boxes
    $(".meme-text").hide()
    $(".meme-text").mouseover(e => {
        let x = $(e.target).parents(".text-box-container")
        let meme = x.parent()
        x.detach()
        meme.append(x)
    })
        
    // add event listeners to textboxes
    $(".text-box").on("input", e => {
        $(`#meme-${e.target.id}`).resizable("destroy")
        $(`#meme-${e.target.id}`).text(e.target.value)
        $(`#meme-${e.target.id}`).resizable({containment: "parent", handles: "n, ne, e, se, s, sw, w, nw"})
    })

    // event listeners for adding the base image
    $("#fileInput").on("input", () => { upload_base_image($("#fileInput")[0]) })
    $(".template-card").click(e => {
        window.create.baseImg = new Image()
        window.create.baseImg.src = e.target.src.replace("/template-thumbnails", "/meme-templates")
        window.create.baseImg.onload = function() {
            let aspectRatio = window.create.baseImg.naturalHeight / window.create.baseImg.naturalWidth
            window.create.dimensions = {
                width: window.canvas.width, 
                height: aspectRatio * window.canvas.width
            }
            // adjust width and height of img to fit meme and draw it
            window.canvas.height = window.create.dimensions.height
            window.create.draw.height = window.create.dimensions.height
            window.ctx.drawImage(
                window.create.baseImg, 0, 0, 
                window.canvas.width, 
                window.canvas.height
            )
            $(".text-box-container")
                .width(window.canvas.width)
                .height(window.canvas.height)
                .attr("style", "top: 0")
            $("#template-modal-button").remove()
        }

        $("#fileInputLabel").remove()
        $(".meme-text").show()
        $(".meme-text").draggable({containment: "parent"}).resizable({containment: "parent", handles: "n, ne, e, se, s, sw, w, nw"})
        $("#new-box-btn").attr("disabled", false)
        $(".settings-menu").attr("disabled", false)
        $(".trash-btn").attr("disabled", false)
        $("#list-opener").remove()
        $("#fileInputBtn").remove()
        $("#img-tool-bar").show()
        $("#template-list").modal()
        $("#image-tool-bar").show()
        $("#drawing").show()
        window.numboxes = 2
    })
    // add mor event listeners
    $("#post-btn").click(post)
    $("#cancel-btn").click(cancel_post)
    $(".trash-btn").click(e => delete_box(e.target))
    $(".settings-menu").click(e => {
        if (e.target.tagName == "I") {
            $(e.target).parent().next(".dropdown-menu").toggle()
        } else {
            $(e.target).next(".dropdown-menu").toggle()
        }
    })
    $("#new-box-btn").click(e => add_text_box(e.target.parentNode.previousElementSibling))
    $("#list-opener").click(e => $("#template-list").modal())
    $("#fileInputBtn, #fileInputBtn2").click(e => $("#fileInput").click())
    $(".image-tool").click(e => update_tools(e.target.innerText))
    $("#text-1").next().children(".dropdown-menu").html(window.settings_menu(1))
    $("#text-2").next().children(".dropdown-menu").html(window.settings_menu(2))

    // text box settings event listeners
    $(".settings-alignment").on("input", e => {
        let id = parseInt(e.target.id.split("-")[1])
        $(`#meme-text-${id}`).css("text-align", e.target.value)
    })
    $(".settings-font-size").on("input", e => {
        let id = parseInt(e.target.id.split("-")[2])
        $(`#meme-text-${id}`).css("font-size", `${e.target.value}px`)
    })
    $(".settings-font").on("input", e => {
        let id = parseInt(e.target.id.split("-")[1])
        $(`#meme-text-${id}`).css("font-family", e.target.value)
    })
    $(".settings-font-color").on("input", e => {
        let id = parseInt(e.target.id.split("-")[2])
        $(`#meme-text-${id}`).css("color", e.target.value)
    })
    $(".settings-font-shadow").on("input", e => {
        let id = parseInt(e.target.id.split("-")[2])
        $(`#meme-text-${id}`).css("-webkit-text-stroke", `${e.target.value} 1px`)
    })
    $(".settings-bold").on("input", e => {
        let id = parseInt(e.target.id.split("-")[1])
        $(`#meme-text-${id}`).toggleClass("bold")
    })
    $(".settings-italics").on("input", e => {
        let id = parseInt(e.target.id.split("-")[1])
        $(`#meme-text-${id}`).toggleClass("italics")
    })
    $(".settings-underline").on("input", e => {
        let id = parseInt(e.target.id.split("-")[1])
        $(`#meme-text-${id}`).toggleClass("underline")
    })
    $(".settings-strikethrough").on("input", e => {
        let id = parseInt(e.target.id.split("-")[1])
        $(`#meme-text-${id}`).toggleClass("strike")
    })
    $(".settings-capitals").on("input", e => {
        let id = parseInt(e.target.id.split("-")[1])
        $(`#meme-text-${id}`).toggleClass("all-caps")
    })
    $(".settings-shadow").on("input", e => {
        let id = parseInt(e.target.id.split("-")[1])
        $(`#meme-text-${id}`).toggleClass("no-shadow")
    })
    $(".text-box-container").hide()
    $("#drawing").hide()
})

function upload_base_image(input) {
    const MAX_FILE_SIZE = 4_000_000
    if (FileReader && input.files && input.files.length) {
        let base = input.files[0]
        if (base.size < MAX_FILE_SIZE) {
            let reader = new FileReader();
            reader.onload = function() {
                // get input image as <img>
                window.create.baseImg = new Image()
                window.create.baseImg.src = reader.result
                window.create.baseImg.onload = function() {
                    let aspectRatio = window.create.baseImg.naturalHeight / window.create.baseImg.naturalWidth
                    window.create.dimensions = {
                        width: window.canvas.width, 
                        height: aspectRatio * window.canvas.width
                    }

                    // adjust width and height of img to fit meme and draw it
                    window.canvas.height = window.create.dimensions.height;
                    window.create.draw.height = window.create.dimensions.height;
                    window.ctx.drawImage(
                        window.create.baseImg, 0, 0, 
                        window.canvas.width, 
                        window.canvas.height
                    )
                    $(".text-box-container").width(window.canvas.width)
                        .height(window.canvas.height).attr("style", "top: 0")
                    $("#template-modal-button").remove()
                    $("#img-tool-bar").show()
                }
            }
            reader.readAsDataURL(base);
            $("#fileInputLabel").remove()
            $(".meme-text").show()
            $(".meme-text").draggable({containment: "parent"}).resizable({containment: "parent", handles: "n, ne, e, se, s, sw, w, nw"})
            $("#new-box-btn").attr("disabled", false)
            $(".settings-menu").attr("disabled", false)
            $(".trash-btn").attr("disabled", false)
            $("#list-opener").remove()
            $("#fileInputBtn").remove()
            $("#image-tool-bar").show()
            $("#drawing").show()
            window.numboxes = 2
        } else {
            alert(`That image is too large! we only accept files less than ${MAX_FILE_SIZE / 1_000_000}mb`);
        }
    }
}

function post() {
    meme = {
        spacing: document.getElementById("space") === null ? 0 : $("#spacer").val(),
        textboxes: [],
        imgData: window.canvas.toDataURL(),
        title: $("#post-title")[0].value
    }
    let boxes = $(".text-box")
    for (let textarea of boxes) {
        let tb = new MemeTextBox(textarea)
        meme.textboxes.push(tb)
        // hijack this part, then make another later
        textarea.style.border = "none"
    }
    // take screenshot
    html2canvas(window.canvas).then(canvas => {
        meme.thumbnailData = canvas.toDataURL('image/png');
    })
    // restore the textboxes
    for (let textarea of boxes) {
        textarea.style.border = ""
    }
    fetch(window.location.href, {
        method: "POST",
        body: JSON.stringify(meme),
        headers: { "Content-type": "application/json; charset=UTF-8" }
    }).then(response => window.location.href = "../profile");
    
}

function cancel_post() {
    window.location.replace(`${window.location.origin}/home`)
}

function adjust_spacing(elem) {
    window.canvas.height = window.create.dimensions.height * (1 + elem.value)
    window.create.draw.height = window.create.dimensions.height * (1 + elem.value)
    window.ctx.drawImage(
        window.create.baseImg, 0,
        window.create.dimensions.height * elem.value,
        window.create.dimensions.width,
        window.create.dimensions.height
    )
}

function add_text_box(elem) {
    window.numboxes += 1;
    let cont = $("<div></div>")

    let box = $("<textarea></textarea>")
        .attr("placeholder", "Enter Text")
        .attr("id", `text-${window.numboxes}`)
        .attr("class", "form-control text-box")
        .attr("rows", 1)
        .attr("style", "resize: none;")

    let meme_text = $("<div></div>")
        .attr("class", "meme-text")
        .attr("style", "top: 50%")
        .attr("id", `meme-text-${window.numboxes}`)

    let btn1 = $("<button></button>")
        .attr("class", "btn settings-menu")
        .attr("type", "button")
        .html("<i class = 'fa fa-gear'></i>")

    let dropdown_menu = $(`<div class = 'dropdown-menu'>${window.settings_menu(window.numboxes)}</div>`)

    let btn2 = $("<button></button>")
        .attr("class", "btn trash-btn")
        .html("<i class = 'fa fa-trash'></i>")
        .click(e => delete_box(e.target))

    window.create.textBoxes.push(box);

    cont.append(box, $("<div class = 'dropdown'></div>").append(btn1, dropdown_menu), btn2)
    elem.append(cont[0])
    $("#meme").append(
        $("<div class = 'text-box-container' style = 'top: 0'></div>")
            .html(`<div class = 'meme-text' id = 'meme-text-${window.numboxes}'></div>`)
    )
    $(".meme-text")
        .draggable({containment: "parent"})
        .resizable({containment: "parent", handles: "n, ne, e, se, s, sw, w, nw"})
        .mouseover(e => {
            let x = $(e.target).parents(".text-box-container")
            let meme = x.parent()
            x.detach()
            meme.append(x)
        })
    $(".text-box").on("input", e => {
        $(`#meme-${e.target.id}`).resizable("destroy")
        $(`#meme-${e.target.id}`).text(e.target.value)
        $(`#meme-${e.target.id}`).resizable({containment: "parent", handles: "n, ne, e, se, s, sw, w, nw"})
    })
    btn1.click(e => {
        if (e.target.tagName == "I") {
            $(e.target).parent().next(".dropdown-menu").toggle()
        } else {
            $(e.target).next(".dropdown-menu").toggle()
        }
    })
    
    // set up text box settings event listeners
    $(".settings-alignment").on("input", e => {
        let id = parseInt(e.target.id.split("-")[1])
        $(`#meme-text-${id}`).css("text-align", e.target.value)
    })
    $(".settings-font-size").on("input", e => {
        let id = parseInt(e.target.id.split("-")[2])
        $(`#meme-text-${id}`).css("font-size", `${e.target.value}px`)
    })
    $(".settings-font").on("input", e => {
        let id = parseInt(e.target.id.split("-")[1])
        $(`#meme-text-${id}`).css("font-family", e.target.value)
    })
    $(".settings-font-color").on("input", e => {
        let id = parseInt(e.target.id.split("-")[2])
        $(`#meme-text-${id}`).css("color", e.target.value)
    })
    $(".settings-font-shadow").on("input", e => {
        let id = parseInt(e.target.id.split("-")[2])
        $(`#meme-text-${id}`).css("-webkit-text-stroke", `${e.target.value} 1px`)
    })
    $(".settings-bold").on("input", e => {
        let id = parseInt(e.target.id.split("-")[1])
        $(`#meme-text-${id}`).toggleClass("bold")
    })
    $(".settings-italics").on("input", e => {
        let id = parseInt(e.target.id.split("-")[1])
        $(`#meme-text-${id}`).toggleClass("italics")
    })
    $(".settings-underline").on("input", e => {
        let id = parseInt(e.target.id.split("-")[1])
        $(`#meme-text-${id}`).toggleClass("underline")
    })
    $(".settings-strikethrough").on("input", e => {
        let id = parseInt(e.target.id.split("-")[1])
        $(`#meme-text-${id}`).toggleClass("strike")
    })
    $(".settings-capitals").on("input", e => {
        let id = parseInt(e.target.id.split("-")[1])
        $(`#meme-text-${id}`).toggleClass("all-caps")
    })
    $(".settings-shadow").on("input", e => {
        let id = parseInt(e.target.id.split("-")[1])
        $(`#meme-text-${id}`).toggleClass("no-shadow")
    })
}

function delete_box(btn) {
    while (btn.tagName != "DIV") { btn = btn.parentNode }
    let id = btn.children[0].id
    btn.remove()
    $(`#meme-${id}`).remove()
}

class MemeTextBox {
    constructor(tb) {
        // TODO: settings
        let meme_box = $(`#meme-${tb.id}`)
        this.text = tb.value
        this.width = tb.clientWidth / window.create.dimensions.width
        this.height = tb.clientHeight / window.create.dimensions.height
        this.top = meme_box[0].style.top == "" ? 0 : parseInt(meme_box[0].style.top)
        this.left = meme_box[0].style.left == "" ? 0 : parseInt(meme_box[0].style.left)
        this.top /= window.create.dimensions.height
        this.left /= window.create.dimensions.width
        this.id = tb.id.split("-")[1]
        let int_id = tb.id.split("-")[1]
        this.settings = {
            alignment: $(`#alignment-${int_id}`).val(),
            font_size: $(`#font-size-${int_id}`).val(),
            font: $(`#font-${int_id}`).val(),
            font_color: $(`#font-color-${int_id}`).val(),
            font_shadow: $(`#font-shadow-${int_id}`).val(),
            is_bold: $(`#bold-${int_id}`).val(),
            is_italic: $(`#italics-${int_id}`).val(),
            underlined: $(`#underline-${int_id}`).val(),
            is_struckthrough: $(`#strikethrough-${int_id}`).val(),
            has_shadow: $(`#shadow-${int_id}`).val(),
            is_capitalized: $(`#capitals-${int_id}`).val(),
        }
    }
}

function update_tools(tool_bar) {
    if (tool_bar == "Adjust Spacing") {
        $("#image-tools").html(`
        <select id = "spacer" class = "form-control">
            <option value = ".0" selected>0% </option>
            <option value = ".1">10%</option>
            <option value = ".2">20%</option>
            <option value = ".3">30%</option>
            <option value = ".4">40%</option>
            <option value = ".5">50%</option>
            <option value = ".6">60%</option>
            <option value = ".7">70%</option>
            <option value = ".8">80%</option>
            <option value = ".9">90%</option>
        </select>
        `)
        $("#spacer").click(e => adjust_spacing(e.target))
        $(".text-box-container").show()
    } else if (tool_bar == "Draw") {
        $("#image-tools").html(`
        <div>
            <label for = "color">Color</label>
            <input type = "color" id = "color" value = "#000000" class = "form-control">
        </div>
        <div>
            <label for = "thickness">Brush Size</label>
            <input type = "number" id = "thickness" value = "10" min = "0" max = "100" class = "form-control">
        </div>
        <div>
            <button class = "btn btn-danger" id = "erase">Erase</button>
        </div>
        `)
        //drawing event listeners
        $("#color").on("change", e => {
            $(e.target).css("background-color", e.target.value)
        })
        $("#color").css("background-color", $("#color").val()).css("border", "none")
        $(".text-box-container").hide()
        $("#erase").click(e => {
            $("#erase").toggleClass("btn-danger btn-outline-danger");
            window.drawing.erase = !window.drawing.erase;
        })
    } else if (tool_bar == "Filters") {
        $("#image-tools").html(`
        `)
    } else if (tool_bar == "Add Image") {
        $("#image-tools").html(`
        `)
    } else {
        $("#image-tools").empty()
    }
}

function drawMousedown(e) {
    if (e.buttons % 2 == 1 && !window.drawing.erase) { 
        window.drawing.mouseStart = {
            'x': e.offsetX,
            'y': e.offsetY
        };
        window.drawing.ctx.beginPath();
        window.drawing.ctx.moveTo(window.drawing.mouseStart.x, window.drawing.mouseStart.y);
    } else if (window.drawing.erase) {
        const thickness = $("#thickness").val();
        window.drawing.ctx.clearRect(
            e.offsetX - thickness / 2,
            e.offsetY - thickness / 2,
            $("#thickness").val(),
            $("#thickness").val()
        )
    }
}

function drawMouseup(e) {
    if (e.buttons & 2 == 0 && !window.drawing.erase) {
        const end = {
            'x': e.offsetX,
            'y': e.offsetY
        };
        const color = $("#color").val();
        draw(end, color);
        window.drawing.ctx.closePath();
        window.drawing.mouseStart = null;
    }
}

function drawMousemove(e) {
    const now = new Date();
    if ((now - window.drawing.last) < window.drawing.timeout) { return; }
    window.drawing.last = now;

    if (window.drawing.mouseStart !== null && e.buttons % 2 == 1  && !window.drawing.erase) {
        const next = {
            'x': e.offsetX,
            'y': e.offsetY
        };
        const color = $("#color").val();
        draw(next, color);
        window.drawing.mouseStart = next;
        console.log(window.drawing.erase);
    } else if (e.buttons % 2 == 1 && window.drawing.erase) {
        console.log("erasing")
        const thickness = $("#thickness").val();
        window.drawing.ctx.clearRect(
            e.offsetX - thickness / 2,
            e.offsetY - thickness / 2,
            $("#thickness").val(),
            $("#thickness").val()
        )
    }
}

function draw(end, color) {
    // draw this line locally
    window.drawing.ctx.lineWidth = $("#thickness").val();
    window.drawing.ctx.strokeStyle = color;
    window.drawing.ctx.lineTo(end.x, end.y);
    window.drawing.ctx.stroke();
}