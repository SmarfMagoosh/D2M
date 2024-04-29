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
        img.onload = () => {
            setColumnHeight(img)
        };
    });
    window.dispatchEvent(new Event('resize'));
});

function setColumnHeight(img) {
    var column = img.parentNode.parentNode; // Get the parent div.column
    var imgHeight = img.height; // Get the height of the image in pixels
    var fontSize = parseFloat(getComputedStyle(document.documentElement).fontSize); // Get the root font size in pixels
    var imgHeightREM = imgHeight / fontSize; // Convert the image height to REM units
    column.style.height = imgHeightREM + 'rem'; // Set the height of the column to match the image height in REM units
  }

