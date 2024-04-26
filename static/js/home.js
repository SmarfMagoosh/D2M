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

document.addEventListener('DOMContentLoaded', function () {
    const images = document.querySelectorAll(".image-link");

    images.forEach((img) => {
        setColumnHeight(img);
    });
    window.dispatchEvent(new Event('resize'));
});

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
