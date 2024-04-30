function textbox_init(create) {
    create.textboxes = []
}

function add_text_box(create) {
    const style = localStorage.getItem("theme") == "dark" ? "light" : "dark"
    console.log(style)
    const textbox = $(`
    <div style = "display: flex; justify-content: left">
        <textarea placeholder = "Enter Text" id = "text-${create.textboxes.length}" class = "form-control text-box" rows = "1" style = "resize: none" maxlength = "100"></textarea>
        <div class = "dropdown">
            <button class = "btn btn-${style} settings-menu" type = "button"><i class = "fa-solid fa-gear"></i></button>
            <div class = "dropdown-menu">${settings_menu(create.textboxes.length)}</div>
        </div>
        <button class = "btn btn-danger trash-btn"><i class = "fa-solid fa-trash"></i></button>
    </div>`)
    $("#text-tool-bar").append(textbox[0]);

    $("#meme").append($(`
        <div class = 'text-box-container' style = 'top: 0'>
            <div class = 'meme-component' style = 'height: 3rem;'>
                <div class = 'meme-text' id = 'meme-text-${create.textboxes.length}' style='color: rgb(0, 0, 0);'></div>
            </div>
        </div>`))
    $(".meme-component").each(enable_meme_component)

    $(".text-box").on("input", e => $(`#meme-${e.target.id}`).text(e.target.value))
    $(".trash-btn").click(e => delete_box(create, e.target))

    textbox.children(".dropdown").children(".settings-menu").click(e => {
        if (e.target.tagName == "I") {
            $(e.target).parent().next(".dropdown-menu").slideToggle() 
        } else { 
            $(e.target).next(".dropdown-menu").slideToggle() 
        }
    })

    create.textboxes.push(textbox)
    
    const id = e => parseInt(e.target.id.split("-")[1])
    $(".settings-alignment").off("change").change(e => $(`#meme-text-${id(e)}`).css("text-align", e.target.value))
    $(".settings-font-size").off("change").change(e => $(`#meme-text-${id(e)}`).css("font-size", `${e.target.value}px`))
    $(".settings-font").off("change").change(e => $(`#meme-text-${id(e)}`).css({"font-family": e.target.value}))
    $(".settings-font-color").off("change").change(e => $(`#meme-text-${id(e)}`).css("color", e.target.value))
    $(".settings-font-shadow").off("change").change(e => $(`#meme-text-${id(e)}`).css("-webkit-text-stroke", `${e.target.value} 2px`))
    $(".settings-bold").off("change").change(e => $(`#meme-text-${id(e)}`).toggleClass("bold"))
    $(".settings-italics").off("change").change(e => $(`#meme-text-${id(e)}`).toggleClass("italics"))
    $(".settings-underline").off("change").change(e => $(`#meme-text-${id(e)}`).toggleClass("underline"))
    $(".settings-strikethrough").off("change").change(e => $(`#meme-text-${id(e)}`).toggleClass("strike"))
    $(".settings-capitals").off("change").change(e => $(`#meme-text-${id(e)}`).toggleClass("all-caps"))
    $(".settings-shadow").off("change").change(e => {
        if ($(e.target).prop("checked")) {
            $(`#meme-text-${id(e)}`).css("-webkit-text-stroke", `${$(`#fontshadow-${id(e)}`).val()} 2px`)
        } else {
            $(`#meme-text-${id(e)}`).css("-webkit-text-stroke", "white 0px")
        }
    })
}

function delete_box(create, btn) {
    btn = $(btn).closest("div")
    const id = btn[0].children[0].id
    btn.remove()
    $(`#meme-${id}`).parents(".text-box-container").remove()
    delete create.textboxes[id.split("-")[1]]
}

function settings_menu(x) {
    return `
<div>
    <label for = "alignment-${x}">Alignment:</label>
    <select id = "alignment-${x}" class = "form-control settings-alignment">
        <option value = "center">Center</option>
        <option value = "left">Left</option>
        <option value = "right">Right</option>
    </select>
</div>
<div>
    <label for = "fontsize-${x}">Font Size:</label>
    <input type = "number" min = "1" max = "100" id = "fontsize-${x}" value = "32" class = "form-control settings-font-size">
</div>
<div>
    <label for = "font-${x}">Font:</label>
    <select id = "font-${x}" class = "form-control settings-font">
        <option value="Arial, sans-serif">Arial</option>
        <option value="'Arial Black', sans-serif">Arial Black</option>
        <option value="'Comic Sans MS', cursive">Comic Sans MS</option>
        <option value="'Courier New', monospace">Courier New</option>
        <option value="Georgia, serif">Georgia</option>
        <option value="Impact, sans-serif" selected>Impact</option>
        <option value="'Times New Roman', Times, serif">Times New Roman</option>
        <option value="'Trebuchet MS', sans-serif">Trebuchet MS</option>
        <option value="Verdana, Geneva, sans-serif">Verdana</option>
        <option value="'Lucida Console', Monaco, monospace">Lucida Console</option>
        <option value="'Lucida Sans Unicode', 'Lucida Grande', sans-serif">Lucida Sans Unicode</option>
        <option value="'Palatino Linotype', 'Book Antiqua', Palatino, serif">Palatino Linotype</option>
        <option value="Tahoma, Geneva, sans-serif">Tahoma</option>
        <option value="Geneva, Tahoma, sans-serif">Geneva</option>
        <option value="Helvetica, Arial, sans-serif">Helvetica</option>
        <option value="'Book Antiqua', Palatino, serif">Book Antiqua</option>
        <option value="Calibri, Candara, Arial, sans-serif">Calibri</option>
        <option value="Cambria, Georgia, serif">Cambria</option>
        <option value="Garamond, Baskerville, 'Baskerville Old Face', 'Hoefler Text', 'Times New Roman', serif">Garamond</option>
        <option value="'Century Gothic', sans-serif">Century Gothic</option>
    </select>
</div>
<div class = "d-flex justify-content-between">
    <div style = "width: 50%;">
        <label for = "font-color-${x}">Color:</label>
        <input type = "color" id = "fontcolor-${x}" value = "#000000" class = "form-control settings-font-color">
    </div>
    <div style = "width: 50%;">
        <label for = "font-shadow-${x}">Outline:</label>
        <input type = "color" id = "fontshadow-${x}" value = "#ffffff" class = "form-control settings-font-shadow">
    </div>
</div>
<div class = "d-flex justify-content-end">
    <div style = "width: 45%;">
        <input type = "checkbox" id = "bold-${x}" class = "form-check-input settings-bold">
        <label for = "bold-${x}">Bold</label>
    </div>
    <div style = "width: 45%;">
        <input type = "checkbox" id = "italics-${x}" class = "form-check-input settings-italics">
        <label for = "italics-${x}">Italics</label>
    </div>
</div>
<div class = "d-flex justify-content-end">
    <div style = "width: 45%;">
        <input type = "checkbox" id = "underline-${x}" class = "form-check-input settings-underline">
        <label for = "underline-${x}">Underline</label>
    </div>
    <div style = "width: 45%;">
        <input type = "checkbox" id = "strikethrough-${x}" class = "form-check-input settings-strikethrough">
        <label for = "strikethrough-${x}">Strike</label>
    </div>
</div>
<div class = "d-flex justify-content-end">
    <div style = "width: 45%;">
        <input type = "checkbox" id = "shadow-${x}" class = "form-check-input settings-shadow">
        <label for = "shadow-${x}">Shadow</label>
    </div>
    <div style = "width: 45%;">
        <input type = "checkbox" id = "capitals-${x}" class = "form-check-input settings-capitals">
        <label for = "capitals-${x}">All Caps</label>
    </div>
</div>`
}