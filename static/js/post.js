// post.js
document.addEventListener('DOMContentLoaded', function () {
    // Assuming you have a script tag somewhere in your HTML where you can embed JavaScript
    window.post = {}
    
//THE REPORT BUTTON

// Get references to elements
// Get the report button and report popup elements
const reportPopup = document.getElementById('report-popup');
reportPopup.style.display = 'none'; 


$(document).ready(function() {
    // Event listener for delete button click
    $('#deletePostBtn').click(function() {
        // Show the confirmation modal
        $('#confirmDeleteModal').modal('show');
    });

    // Event listener for confirm delete button click
    $('#confirmDeleteBtn').click(function() {
        // Submit the delete post form
        console.log("hellloo");
        const postID = this.getAttribute('data-postId');
        
        fetch('/deletePost/' + postID, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
        })
        .then(function(response) {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(function(data) {
            // Handle successful response
            // Redirect to the profile page after successful deletion
            window.location.href = '/profile/';
        })
        .catch(function(error) {
            // Handle network errors or server errors
            console.error('Error:', error);
        });
    });
});

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

    getCurrentUser().then(function(result) {
        // Assuming 'attribute' is the attribute you want to grab from the result
        var currentUsernameEmail = result.gccEmail;
        // Now you can use the 'attribute' variable as needed
        // Call the createReport function to create a new comment
    createReport(reportValue, currentUsernameEmail, postID)
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        // Handle successful response
        // Optionally, update the UI or perform other actions
        window.location.reload();  // Reload the page to display the new comment
    })
    .catch(error => {
        // Handle fetch errors
        console.error('Fetch error:', error);
    })
    // .then(window.location.reload())
    ;
    })
    
});



// Event listener for click event on copy button
document.getElementById('copy-link-btn').addEventListener('click', () => {

    var copyText = window.location.href;
  
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


// Add an event listener for form submission
document.getElementById('comment-form').addEventListener('submit', function(event) {
    // Prevent the default form submission behavior
    event.preventDefault();

    // Get the value of the comment input field
    const commentValue = document.getElementById('comment-box').value;

    // You also need to retrieve the username and postID from somewhere
    var postId = this.getAttribute('data-postId');

    getCurrentUser().then(function(result) {
        // Assuming 'attribute' is the attribute you want to grab from the result
        var currentUsername = result.username;
        // Now you can use the 'attribute' variable as needed
        createComment(commentValue, currentUsername, postId)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            // Handle successful response
            // Optionally, update the UI to reflect the new like
        })
        .catch(error => {
            // Handle fetch errors
            console.error('Fetch error:', error);
        });
        window.location.reload();
    })
});


document.getElementById('like-btn').addEventListener('click', function() {
    // Retrieve the post ID associated with the button
    const postId = this.getAttribute('data-postId');
     getCurrentUser().then(function(result) {
        // Assuming 'attribute' is the attribute you want to grab from the result
        var currentUsernameEmail = result.gccEmail;
        // Now you can use the 'attribute' variable as needed
        createLike(currentUsernameEmail, postId, true)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            // Handle successful response
            // Optionally, update the UI to reflect the new like
        })
        .catch(error => {
            // Handle fetch errors
            console.error('Fetch error:', error);
        });
    })
});

document.getElementById('dislike-btn').addEventListener('click', function() {
    // Retrieve the post ID associated with the button
    const postId = this.getAttribute('data-postId');
     getCurrentUser().then(function(result) {
        // Assuming 'attribute' is the attribute you want to grab from the result
        var currentUsernameEmail = result.gccEmail;
        // Now you can use the 'attribute' variable as needed
        createLike(currentUsernameEmail, postId, false)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            // Handle successful response
            // Optionally, update the UI to reflect the new like
        })
        .catch(error => {
            // Handle fetch errors
            console.error('Fetch error:', error);
        });
    })
});

document.getElementById('bookmark-btn').addEventListener('click', function() {
    // Retrieve the post ID associated with the button
    const postId = this.getAttribute('data-postId');
    getCurrentUser().then(function(result) {
        // Assuming 'attribute' is the attribute you want to grab from the result
        var currentUsernameEmail = result.gccEmail;
        // Now you can use the 'attribute' variable as needed
        createBookmark(currentUsernameEmail, postId)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            // Handle successful response
            // Optionally, update the UI to reflect the new like
        })
        .catch(error => {
            // Handle fetch errors
            console.error('Fetch error:', error);
        });
    })
    // Call the createLike function to create a new like for the post
    
});


function createBookmark(userEmail, postID) {
    return fetch('/create_like', {
        method: 'POST',
        body: JSON.stringify({ userEmail: userEmail, postID: postID}),
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        // Handle successful response
        // Optionally, update the UI or perform other actions
        return response;
    })
    .catch(error => {
        // Handle fetch errors
        console.error('Fetch error:', error);
    });
}

function createLike(userEmail, postID, positive) {
    return fetch('/create_like', {
        method: 'POST',
        body: JSON.stringify({ userEmail: userEmail, postID: postID, positive: positive }),
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        // Handle successful response
        // Optionally, update the UI or perform other actions
        return response;
    })
    .catch(error => {
        // Handle fetch errors
        console.error('Fetch error:', error);
    });
}

function createReport(reason, userEmail, postID) {

    // Make a POST request to the Flask route
    return fetch('/create_report', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            reason: reason,
            userEmail: userEmail,
            postID: postID
        }) // Convert data to JSON format
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        // Handle successful response
        // Optionally, update the UI or perform other actions
        return response;
    })
    .catch(error => {
        // Handle fetch errors
        console.error('Fetch error:', error);
    });
}

function createComment(content, username, postID) {
    // Make a POST request to the Flask route
    return fetch('/create_comment', {
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
        // Optionally, update the UI or perform other actions
        return response;
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