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








// Add an event listener for form submission
document.getElementById('comment-form').addEventListener('submit', function(event) {
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
    const postId = this.getAttribute('data-postId');
    console.log("I've been clicked by!");
    console.log(getCurrentUser);
    // Call the createLike function to create a new like for the post
    createLike(getCurrentUser(), postId, true)
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

document.getElementById('dislike-btn').addEventListener('click', function() {
    // Retrieve the post ID associated with the button
    const postId = this.getAttribute('data-postId');
    console.log("I've been clicked by!");
    console.log(getCurrentUser);
    // Call the createLike function to create a new like for the post
    createLike(getCurrentUser().gccEmail, postId, false)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            // Handle successful response
            console.log('New dislike created for post ID:', postId);
            // Optionally, update the UI to reflect the new like
        })
        .catch(error => {
            // Handle fetch errors
            console.error('Fetch error:', error);
        });
});

document.getElementById('bookmark-btn').addEventListener('click', function() {
    // Retrieve the post ID associated with the button
    const postId = this.getAttribute('data-postId');
    console.log("I've been clicked by!");
    console.log(getCurrentUser);
    // Call the createLike function to create a new like for the post
    createLike(getCurrentUser(), postId, false)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            // Handle successful response
            console.log('New dislike created for post ID:', postId);
            // Optionally, update the UI to reflect the new like
        })
        .catch(error => {
            // Handle fetch errors
            console.error('Fetch error:', error);
        });
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

function createLike(email, postId, isPositive) {
    return fetch('/createLike', {
        method: 'POST',
        body: JSON.stringify({ email: email, postId: postId, isPositive: isPositive }),
        headers: {
            'Content-Type': 'application/json'
        }
    });
}

function getCurrentUser() {
    return fetch('/getUserInfo')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.loggedIn) {
                // User is logged in, return user information
                return data;
            } else {
                // User is not logged in, return null or handle as needed
                return null;
            }
        })
        .catch(error => {
            // Handle fetch errors
            console.error('Fetch error:', error);
            return null;
        });
}

// Function to submit the report
function submitReport() {
    const reportText = document.getElementById('report-text').value;
    // Do something with the report text (e.g., send it to a server)
    console.log('Report submitted:', reportText);
    closePopup(); // Close the popup after submission
};

});