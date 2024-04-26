document.addEventListener('DOMContentLoaded', function () {
    $(window).resize( function() {
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
    $(window).trigger('resize');
});

