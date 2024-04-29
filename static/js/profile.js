
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
    var columns = document.querySelectorAll('.column');

    columns.forEach(function(column) {
      var img = column.querySelector('img');
      setColumnHeight(img);
    });
  });

  function setColumnHeight(img) {
    var column = img.parentNode.parentNode; // Get the parent div.column
    var imgHeight = img.height; // Get the height of the image in pixels

    // Set the flex property to adjust the height dynamically
    column.style.flex = '1 1 auto';
    column.style.height = imgHeight + 'px'; // Set column height to match the image height
  }