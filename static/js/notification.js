document.addEventListener("DOMContentLoaded", async () => {
    //get elements
    const notif_count = document.getElementById('notif_count');
    const notif_list = document.getElementById('notif_list');
    //load the timer
    await fetch("/API/get_notifications/<string:gccEmail>")//TODO: get gcc email from somewhere
        .then(validateJSON)
        .then(loadList);
    //set up the pause/play and skip buttons
    toggleBtn.addEventListener("click", toggle);
    skipBtn.addEventListener("click", changeState)
});
//TODO: edit this so that it no longer is for timers
/**
 * sets the list up with the data received from the backend
 * @param {JSON} actionData the data for the list of notifications
 */
async function loadList(actionData){
    /**
     * receive data from 
     * {
     * "a": active? (true=running, false=paused)
     * "w": working? (true=working, false=break)
     * "s": start time (only sent if running)
     * "t": time left in seconds (if start time is included, then remove time passed since starting)
     * "c": cycle number
     * }
     */
    timeLeft = actionData.t;
    cycle = actionData.c;
    if(actionData.w) {
        timer_div.className = "work";
        is_working = true;
    }
    else {
        timer_div.className = "break";
        is_working = false;
    }
    active = actionData.a;
    toggleBtn.innerText = active ? "Pause" : "Start";
    toggleBtn.className = active ? "btn btn-warning btn-sm":"btn btn-success btn-sm";
    if (active) {
        //if the timer is already active, then some other page must have started it
        timeLeft -= Math.floor((new Date()-new Date(actionData.s))/1000); //figure out how much time is left
        if(timeLeft <= 0){
            //if it somehow already finished during page transition, finish it
            changeState();
        }
        else{
            //otherwise resume the timer
            num_loops_active++;
            timerLoop();
        }
    }else{
        timer.innerText = timerText(timeLeft);
    }
}