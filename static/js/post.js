// post.js

document.addEventListener('DOMContentLoaded', function () {
    // Assuming you have a script tag somewhere in your HTML where you can embed JavaScript
    window.post = {}

    
//THE REPORT BUTTON

// Get references to elements
const reportButton = document.getElementById('report-btn');
const reportPopup = document.getElementById('report-popup');

// Event listener for the report button
reportButton.addEventListener('click', openPopup);

    closePopup;
    
    
// Get reference to the copy button
const copyButton = document.getElementById('copy-link-btn');

// Event listener for click event on copy button
copyButton.addEventListener('click', () => {
    
   CopyText();

    // Provide some visual feedback to the user
    // copyButton.textContent = 'URL Copied!';
    // setTimeout(() => {
    //     copyButton.textContent = 'Copy Link';
    // }, 2000); // Reset button text after 2 seconds
});




  //THE REMIX BUTTON
const remixButton = document.getElementById('remix-btn');

// Event listener for click event on copy button
remixButton.addEventListener('click', () => {
    
    window.location.href = "../../create"
    //Not implemented lmao
 
});






// Get a reference to the form element
const commentForm = document.getElementById('comment-form');

// Add an event listener for form submission
commentForm.addEventListener('submit', function(event) {
    // Prevent the default form submission behavior
    event.preventDefault();

    // Get the value of the comment input field
    const commentInput = document.getElementById('comment-box');
    const commentValue = commentInput.value;
    
    
    

    // Perform any action you want with the comment value

    window.location.reload();

});


});

function CopyText() {
    // Get the text field
    var copyText = window.location.href;
    console.log(copyText);
  
    // Copy the text inside the text field
    navigator.clipboard.writeText(copyText);
    
    // Alert the copied text
    alert("Copied the text: " + copyText);
};

// Function to open the popup
function openPopup() {
    reportPopup.classList.toggle("show")
};

// Function to close the popup
function closePopup() {
    reportPopup.classList.toggle("hide")
};

// Function to submit the report
function submitReport() {
    const reportText = document.getElementById('report-text').value;
    // Do something with the report text (e.g., send it to a server)
    console.log('Report submitted:', reportText);
    closePopup(); // Close the popup after submission
};
