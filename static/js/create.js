$("document").ready(() => {
    window.switching = true;

    const create = {}
    window.get_create = () => create
    create.btns = localStorage.theme === "dark" ? "light" : "dark"
    $(".btn-dark").removeClass("btn-dark").addClass(`btn-${create.btns}`)
    fetch("/getUserInfo/")
        .then(response => response.ok ? response.json() : Promise.reject(response))
        .then(data => create.user = data)
    drawing_init(create)
    textbox_init(create)
    add_image_init(create)
    $("#main-content-div").toggleClass("row shadow")

    $("#image-tool-bar").hide()
    $(".image-tool").click(e => {
        const btns = $(".image-tool")
        btns.removeClass().addClass(["image-tool", "btn", "btn-secondary"])
        $(e.target).removeClass("btn-secondary").addClass(`btn-${create.btns}`)
    })
    $("#new-box-btn").attr("disabled", true)
    $("#spacing-tools").hide()
    $("#spacer").change(e => adjust_spacing(create, e.target.value, $("#space-arrangement").val()))
    $("#space-arrangement").change(e => adjust_spacing(create, $("#spacer").val(), e.target.value))

    create.canvas =  $("#meme-img")[0]
    create.canvas.width = create.canvas.parentNode.clientWidth
    create.drawing.canv.width = create.canvas.width
    $("#meme").css("width", create.canvas.width)
    create.ctx = create.canvas.getContext("2d")

    $("#post-btn").click(post(create))
    $("#save-btn").click(save(create))
    $("#new-box-btn").click(e => add_text_box(create))
    $(".image-tool").click(e => update_tools(e.target.innerText))
    $("#save-display-dismiss").click(e => $("#save-display").modal("toggle"))

    $("#switch-btn").hide()
    $("#fileInput").change(e => display_image(create, e.target))
    $(".card").click(e => {
        const img = new Image()
        img.src = $(e.target).closest(".card").find("img").attr("src").replace("/template-thumbnails", "/meme-templates")
        img.onload = upload_base_image(create, img, null)
        $("#close").click()
    })

    setTimeout(() => {
        if (window.remix !== undefined) {
            create.remix = window.remix;
            delete window.remix;
            init_remix(create);
        }
    }, 50);

    create.colors = ["primary", "success", "warning", "info"];
    create.tagTemplate = $("#create-tag-template");
    create.tagDropdownBtn = $("#c-tag-dropdown-btn");
    create.tagSearchBar = $("#cTagInput");

    cInsertTag(create, "no tag", "secondary");
    fetch(`/API/taglist/`)
        .then(validateJSON)
        .then(data => {
                for (const tag of data) {
                    cInsertTag(create, `#${tag}`, getCColor(create, tag));
                }
            }
        );
    
    const tagList = document.getElementsByClassName("c-tag-badge");
    create.tagSearchBar.on('input', event => {
        const query = event.target.value.toLowerCase();
        create.tagDropdownBtn[0].innerText = query==="" ? "no tag" : `#${query}`;

        const classList = create.tagDropdownBtn.attr("class").split(' ')
        for (let i=0; i<classList.length; i++){
            if(classList[i].includes("btn-")) {
                create.tagDropdownBtn.removeClass(classList[i]).addClass(`btn-${query==="" ? "secondary" : getCColor(create, query)}`)
                break;
            }
        }

        let count = 0;
        for (let i = 0; i < tagList.length; i++) {
            if(tagList[i].innerText === "template") continue;
            if(tagList[i].innerText === "no tag" && query !== ""){
                tagList[i].hidden = true;
                continue;
            }
            const tagContainsQuery = tagList[i].innerText.toLowerCase().includes(query);
            tagList[i].hidden = !tagContainsQuery || count >= maxtagsvisible;
            if(tagContainsQuery) count++;
        }
    });

    $("#template-search").on("input", e => {
        const query = e.target.value.toLowerCase()
        function filter(i, elem) {
            if (elem.innerText.toLowerCase().includes(query)) {
                $(elem).show()
            } else {
                $(elem).hide()
            }
        }
        if (query === "") {
            $(".meme-template").show()
        } else {
            $(".meme-template").each(filter)
        }
    })
})

function adjust_spacing(create, value, position) {
    const drawings = new Image()
    drawings.src = create.drawing.canv.toDataURL()

    value = value === null ? 0 : value
    create.canvas.height = create.dimensions.height * (1 + parseFloat(value))
    create.drawing.canv.height = create.dimensions.height * (1 + parseFloat(value))

    create.canvas.width = create.canvas.parentNode.clientWidth
    create.drawing.canv.width = create.canvas.width
    $("#meme").css("width", create.canvas.width)

    create.ctx.drawImage(
        create.baseImg, create.cropData.left, 
        create.cropData.top, create.cropData.width, 
        create.cropData.height, 0, 
        create.dimensions.height * parseFloat(value) * parseFloat(position),
        create.dimensions.width, create.dimensions.height)
}

function post(create) {
    return function(e) {
        if (create.user === undefined) {
            alert("You must be signed in to post a meme!")
        } else if ($("#post-title").val() == "") {
            alert("You must give your post a title before posting!")
        } else if (create.baseImg == undefined) {
            alert("You must upload an image before posting!")
        } else {
            // assemble meme
            $("#post-btn").html("<span class='spinner-border' role='status'></span>")
            const textBoxes = []
            $(".text-box").each((i, elem) => {
                if ($(elem).attr("id") !== undefined) {
                    const box = new MemeTextBox(create, elem)
                    textBoxes.push(box)
                }
            })
            meme = {
                template: create.template,
                spacing: $("#spacer").val(),
                space_arrangement: $("#space-arrangement").val(),
                textboxes: textBoxes,
                images: create.images.map(img => new ExtraImage(create, img)),
                imgData: create.baseImg.src,
                title: $("#post-title").val(),
                user: create.user.username,
                drawing: create.drawing.canv.toDataURL(),
                tag: create.tagDropdownBtn.text() === "no tag" ? "" : create.tagDropdownBtn.text().substring(1)
            }

            // take screenshot for saving
            $(".meme-component").css("border", "none")
            $("#meme-img").removeClass("border")
            html2canvas($("#meme")[0], {useCORS: true, allowTaint: true})
                .then(canvas => meme.thumbnailData = canvas.toDataURL('image/png'))
                .then(() => {
                    // send post to backend
                    fetch("/create/", {
                        method: "POST",
                        body: JSON.stringify(meme),
                        headers: { "Content-Type": "application/json" }
                    })
                    .then(response => {
                        if(response.ok)
                            return response.json()
                        else{
                            alert("Sorry, we had an issue posting this meme, please try again laters")
                            return Promise.reject(response)
                        }
                    })
                    .then(data => {
                        console.log(data)
                        if(data.postID !== -1){
                            window.location.href = `/post/${data.postID}`
                        }
                        else{
                            window.location.href = "/profile/"
                        }
                    })
                })
            }
        } 
}

function save(create) {
    return function(e) {
        if (create.baseImg == undefined) {
            alert("You must upload an image before posting!")
        } else {
            // take screenshot for saving
            $(".meme-component").css("border", "none")
            $("#meme-img").css("border", "none")
            html2canvas($("#meme")[0], {useCORS: true, allowTaint: true}).then(display_save)
        }
    } 
}

function display_save(canvas) {
    $("#save-display").modal('toggle')
    const a = $("#meme-download")
    const img = $("#assembled-meme").width("100%")
    const src = canvas.toDataURL("image/png")
    a.attr("href", src.replace("image/png", "image/octet-stream"))
        .attr("download", "your-meme.png")
    img.attr("src", src)
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
    } else {
        $(".text-box-container").each((i, elem) => bring_to_front($(elem)))
        $(".meme-component").each(enable_meme_component)
    }
}

function bring_to_front(elem) {
    const p = elem.parent()
    elem.detach()
    p.append(elem)
}

function enable_meme_component(i, elem) {
    const type = $(elem).parent().hasClass("image-container") ? "image" : "text-box"
    try {
        $(elem).resizable("option", "disabled")
    } catch (error) {
        $(elem)
            .draggable({containment: "parent"})
            .resizable({containment: "parent", handles: "all"})
            .mouseover(e => bring_to_front($(e.target).parents(`.${type}-container`)))
    }
}

function disable_meme_component(i, elem) {
    try {
        $(elem).off("mouseover").resizable("destroy").draggable("destroy")
    } catch (error) {}
}

function init_remix(create) {
    // upload base image
    const remixed_img = new Image()
    remixed_img.src = create.remix.backImage
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
            enable_meme_component(0, box)
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
        console.log()
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

function getCColor(create, text){
    return create.colors[Math.abs(text.hashCode())%create.colors.length]
}

//Thanks to esmiralha on stackoverflow for this
//https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript
String.prototype.hashCode = function() {
    var hash = 0,
      i, chr;
    if (this.length === 0) return hash;
    for (i = 0; i < this.length; i++) {
      chr = this.charCodeAt(i);
      hash = ((hash << 5) - hash) + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  }

function cInsertTag(create, tag, color){
    const new_tag = create.tagTemplate.clone();

    new_tag.text(tag).addClass(`btn-${color}`).attr("hidden", false)

    new_tag.click(() => {
        const classList = create.tagDropdownBtn.attr("class").split(' ')
        for (let i=0; i<classList.length; i++){
            if(classList[i].includes("btn-")) {
                create.tagDropdownBtn.removeClass(classList[i]).addClass(`btn-${color}`)
                break;
            }
        }
        create.tagDropdownBtn[0].innerText = tag;
        create.tagSearchBar[0].value = tag==="no tag" ? "" : tag.substring(1);
    });

    new_tag.attr("id", "");

    create.tagTemplate.parent().append(new_tag);
}