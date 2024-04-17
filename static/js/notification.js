let notif_template = null
document.addEventListener("DOMContentLoaded", async () => {
    //get elements
    const notif_count = document.getElementById('notif-count');//callout on notifications
    const notif_count_dd = document.getElementById('notif-count-dd');//count inside of the notification dropdown
    notif_template = document.getElementById('notif-template');//div containing sample notification

    //load the notifications
    await fetch(`/API/get_notifications/`)
        .then(validateJSON)
        .then(data => {
                for (const notif of data.list) {
                    insert_notification(notif);
                }
                const l = data.list.length
                notif_count.innerText = l
                notif_count_dd.innerText = l
                if (l>0) notif_count.removeAttribute("hidden")
                if (data.logged_in) document.getElementById('notifications').removeAttribute("hidden")
            }
        );
});

async function insert_notification(notification){
    /**
     * notification contains:
     * title, time, text, and id
     */
    const container = document.getElementById("flashcards-container");

    const nDiv = notif_template.cloneNode(true);
    nDiv.removeAttribute("id");

    // nDiv.id = notification.id;
    nDiv.removeAttribute("hidden");

    const time = nDiv.querySelector(".notif-time");
    const title = nDiv.querySelector(".notif-title");
    const text = nDiv.querySelector(".notif-text");
    const link = nDiv.querySelector(".notif-link");

    time.innerText = notification.time;
    title.innerText = notification.title;
    text.innerText = notification.text;
    link.href = notification.link;

    const closeBtn = nDiv.querySelector(".btn-close");
    closeBtn.addEventListener("click", () => { 
        fetch(
            `/API/delete_notification/${notification.id}`,
            {method:"GET"}
        )
        nDiv.remove();
    });
    

    notif_template.parentElement.appendChild(nDiv);
}

/**
   * Validate a response to ensure the HTTP status code indcates success.
   * 
   * @param {Response} response HTTP response to be checked
   * @returns {object} object encoded by JSON in the response
   */
function validateJSON(response) {
    if (response.ok) {
        return response.json();
    } else {
        return Promise.reject(response);
    }
}