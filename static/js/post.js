// post.js

document.addEventListener('DOMContentLoaded', function () {
    // Assuming you have a script tag somewhere in your HTML where you can embed JavaScript
    window.post = {}

    
//THE REPORT BUTTON

// Get references to elements
const reportButton = document.getElementById('report-btn');
const reportPopup = document.getElementById('report-popup');


// Event listener for click event on copy button
document.getElementById('copy-link-btn').addEventListener('click', () => {

    var copyText = window.location.href;
    console.log(copyText);
  
    // Copy the text inside the text field
    navigator.clipboard.writeText(copyText);
    
    // Alert the copied text
    alert("Copied the text: " + copyText);
    // Provide some visual feedback to the user
    // copyButton.textContent = 'URL Copied!';
    // setTimeout(() => {
    //     copyButton.textContent = 'Copy Link';
    // }, 2000); // Reset button text after 2 seconds
});

// Event listener for click event on remix button
document.getElementById('remix-btn').addEventListener('click', () => {
    
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

document.getElementById('like-btn').addEventListener('click', function() {
    // Retrieve the post ID associated with the button
    const postId = this.closest('.post').dataset.postId;

    // Call the createLike function to create a new like for the post
    createLike('user@example.com', postId, true)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            // Handle successful response
            console.log('New like created for post ID:', postId);
            // Optionally, update the UI to reflect the new like
        })
        .catch(error => {
            // Handle fetch errors
            console.error('Fetch error:', error);
        });
});

const dislikeButton = document.getElementById('like-btn');

dislikeButton.addEventListener('click', () => {
    
    window.location.href = "../../create"
    //Not implemented lmao
 
});  



function createLike(email, postId, isPositive) {
    return fetch('/createLike', {
        method: 'POST',
        body: JSON.stringify({ email: email, postId: postId, isPositive: isPositive }),
        headers: {
            'Content-Type': 'application/json'
        }
    });
}


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

});