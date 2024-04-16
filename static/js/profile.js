// account = sessionStorage.getItem("customIdToken")
/* FYI this ^^^^ is outdated. To get the current user you now how to make a fetch
 request to fetch('/getUserInfo'). This responds with a json. The json contains 
 a 'loggedIn' field that contains a boolean to see if there's a logged in user. If
 there is a logged in user the json contains basic user info.
 ~Bryce */

 function checkProfileImage() {
  var img = document.getElementById('pfp');
  if (img.src === undefined || img.src === null || img.src === '') {
    img.src = '/static/images/users/default-pfp.png';
  }
}

function checkBannerImage() {
  var cover = document.querySelector('.cover');
  if (cover.style.backgroundImage === '' || cover.style.backgroundImage === 'none') {
    cover.style.backgroundImage = "url('/static/images/users/default-banner.png')";
  }
}


function openTab(evt, tabName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
  }

  checkProfileImage();
  checkBannerImage();