// post.js

document.addEventListener('DOMContentLoaded', function () {
    // Assuming you have a script tag somewhere in your HTML where you can embed JavaScript
    window.post = {}
    
    
// Get reference to the copy button
const copyButton = document.getElementById('copy-link-btn');

// Event listener for click event on copy button
copyButton.addEventListener('click', () => {
    
   CopyText();

    // Provide some visual feedback to the user
    copyButton.textContent = 'URL Copied!';
    setTimeout(() => {
        copyButton.textContent = 'Copy URL to Clipboard';
    }, 2000); // Reset button text after 2 seconds
});

function CopyText() {
    // Get the text field
    var copyText = window.location.href;
    console.log(copyText);
  
    // Copy the text inside the text field
    navigator.clipboard.writeText(copyText);
    
    // Alert the copied text
    alert("Copied the text: " + copyText);
  }


  //THE REMIX BUTTON
const remixButton = document.getElementById('remix-btn');

// Event listener for click event on copy button
remixButton.addEventListener('click', () => {
    
    window.location.href = "../../create"
    //Not implemented lmao
 
});

//THE REPORT BUTTON

// Get references to elements
const reportButton = document.getElementById('report-btn');
const reportPopup = document.getElementById('report-popup');

// Function to open the popup
function openPopup() {
    reportPopup.style.display = 'block';
}

// Function to close the popup
function closePopup() {
    reportPopup.style.display = 'none';
}

// Function to submit the report
function submitReport() {
    const reportText = document.getElementById('report-text').value;
    // Do something with the report text (e.g., send it to a server)
    console.log('Report submitted:', reportText);
    closePopup(); // Close the popup after submission
}

// Event listener for the report button
reportButton.addEventListener('click', openPopup);


});
