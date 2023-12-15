// post.js

document.addEventListener('DOMContentLoaded', function () {
    // Assuming you have a script tag somewhere in your HTML where you can embed JavaScript

    // Get the JSON data passed from the backend
    var postData = /* Retrieve the data from your server or define it here */null ;

    // Create HTML content dynamically
    var htmlContent = '<h2>' + postData.title + '</h2>' +
                      '<p><strong>Author:</strong> ' + postData.author + '</p>' +
                      '<p><strong>Content:</strong> ' + postData.content + '</p>';
                      // Add more properties as needed

    // Insert the HTML content into the post-container div
    document.getElementById('post-container').innerHTML = htmlContent;
});
