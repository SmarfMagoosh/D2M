// account = sessionStorage.getItem("customIdToken")
/* FYI this ^^^^ is outdated. To get the current user you now how to make a fetch
 request to fetch('/getUserInfo'). This responds with a json. The json contains 
 a 'loggedIn' field that contains a boolean to see if there's a logged in user. If
 there is a logged in user the json contains basic user info.
 ~Bryce */

 document.addEventListener('DOMContentLoaded', function() {
  checkImages();
});


 function checkImages() {
  gccEmail = document.getElementById('pfp').getAttribute('data-user')
  fetch(`/profile_json/${gccEmail}`)
    .then(response => response.json())
    .then(data => {
      document.getElementById('pfp').src = data.pfp; 
      document.querySelector('.cover').style.backgroundImage = `url('${data.banner}')`;
    })
    .catch(error => {
      console.error('Error fetching profile data:', error);
    });
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
    window.dispatchEvent(new Event('resize'));
  }

  window.addEventListener('resize', function() {
    var windowWidth = window.innerWidth;
    var columns = document.querySelectorAll('.column');
    
    if (windowWidth < 768) {
        // If window width is less than 768px, display one column
        columns.forEach(function(column) {
            column.style.width = '100%';
        });
    } else {
        // Otherwise, display three columns
        columns.forEach(function(column) {
            column.style.width = '30%';
        });
    }
});

  

  