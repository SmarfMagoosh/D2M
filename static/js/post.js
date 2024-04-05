// post.js
document.addEventListener('DOMContentLoaded', function () {
    // Assuming you have a script tag somewhere in your HTML where you can embed JavaScript
    window.post = {}
    
    
    
//THE REPORT BUTTON

// Get references to elements
// Get the report button and report popup elements
const reportPopup = document.getElementById('report-popup');
reportPopup.style.display = 'none'; 

$("#report-btn").click(e => {
    reportPopup.style.display = 'block';
});

$("#cancel-btn").click(e => {
    reportPopup.style.display = 'none';    
});

$("#submit-btn").click(e => {
    e.preventDefault();

    // Get the value of the comment input field
    const reportValue = document.getElementById('report-text').value;

    // You also need to retrieve the username and postID from somewhere
    const user = getCurrentUser();  // Assuming you have a function to get the current user
    const postID = $(e.target).attr('data-postId');
    console.log(reportValue)
    console.log(getCurrentUser().username)
    console.log(postID)

    // Call the createReport function to create a new comment
    createReport(reportValue, "u1", postID)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            // Handle successful response
            console.log('New report created successfully');
            // Optionally, update the UI or perform other actions
            window.location.reload();  // Reload the page to display the new comment
        })
        .catch(error => {
            // Handle fetch errors
            console.error('Fetch error:', error);
        });
        window.location.reload();  
});






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
    const commentValue = document.getElementById('comment-box').value;

    // You also need to retrieve the username and postID from somewhere
    const user = getCurrentUser();  // Assuming you have a function to get the current user
    const postID = this.getAttribute('data-postId');
    console.log(commentValue)
    console.log(getCurrentUser().username)
    console.log(postID)

    // Call the createComment function to create a new comment
    createComment(commentValue, "u1", postID)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            // Handle successful response
            console.log('New comment created successfully');
            // Optionally, update the UI or perform other actions
            window.location.reload();  // Reload the page to display the new comment
        })
        .catch(error => {
            // Handle fetch errors
            console.error('Fetch error:', error);
        });
        window.location.reload();
});


document.getElementById('like-btn').addEventListener('click', function() {
    // Retrieve the post ID associated with the button
    const postId = this.getAttribute('data-postId');
    console.log("I've been clicked by!");
    console.log(getCurrentUser);
    // Call the createLike function to create a new like for the post
    createLike(getCurrentUser, postId, true)
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

function createReport(reason, username, postID) {

    // Make a POST request to the Flask route
    fetch('/create_report', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            reason: reason,
            username: username,
            postID: postID
        }) // Convert data to JSON format
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        // Handle successful response
        console.log('Okay I built the report');b
        // Optionally, update the UI or perform other actions
    })
    .catch(error => {
        // Handle fetch errors
        console.error('Fetch error:', error);
    });
}

function createComment(content, username, postID) {

    // Make a POST request to the Flask route
    fetch('/create_comment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            content: content,
            username: username,
            postID: postID
        }) // Convert data to JSON format
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        // Handle successful response
        console.log('Okay I built the comment');
        // Optionally, update the UI or perform other actions
    })
    .catch(error => {
        // Handle fetch errors
        console.error('Fetch error:', error);
    });
}

async function getCurrentUser() {
    try {
        const response = await fetch('/getUserInfo');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        if (data.loggedIn) {
            // User is logged in, return user information
            return data;
        } else {
            // User is not logged in, return null or handle as needed
            return null;
        }
    } catch (error) {
        // Handle fetch errors
        console.error('Fetch error:', error);
        return null;
    }
}



});