// post.js
document.addEventListener('DOMContentLoaded', function () {
    // Assuming you have a script tag somewhere in your HTML where you can embed JavaScript
    window.post = {}
    

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
        var commentId
    $('#deleteCommentBtn').click(function() {
        // Show the confirmation modal
        $('#confirmCommentDeleteModal').modal('show');
        commentId = this.getAttribute('data-commentId');
    });

    $('#confirmCommentDeleteBtn').click(function() {
        // Submit the delete post form
        const commentID = commentId;
        console.log("Id: " + commentId)
        fetch('/deleteComment/' + commentID, {
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
            window.location.reload();
        })
        .catch(function(error) {
            // Handle network errors or server errors
            console.error('Error:', error);
        });
    });
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
            (window.location.reload());
        })
        .catch(error => {
            // Handle fetch errors
            console.error('Fetch error:', error);
        });
    })
});
var likeButton = document.getElementById('like-btn');
var dislikeButton = document.getElementById('dislike-btn');
var bookmarkButton = document.getElementById('bookmark-btn');

function toggleButtonColor(buttonId) {
    var button = document.getElementById(buttonId);
    
    if (button === likeButton) {
        if (button.style.backgroundColor !== 'red') {
            button.style.backgroundColor = 'red';
            dislikeButton.style.backgroundColor = '#9c9c9c';
        } else {
            button.style.backgroundColor = '';
            dislikeButton.style.backgroundColor = '';
        }
    } else if(button === dislikeButton) {
        if (button.style.backgroundColor !== 'red') {
            button.style.backgroundColor = 'red';
            likeButton.style.backgroundColor = '#9c9c9c';
        } else {
            button.style.backgroundColor = '';
            likeButton.style.backgroundColor = '';
        }
    }
    else{
        if (button.style.backgroundColor !== 'red') {
            button.style.backgroundColor = 'red';
        } else {
            button.style.backgroundColor = '';
        }
    }
}



document.getElementById('like-btn').addEventListener('click', function() {
    // Retrieve the post ID associated with the button
    toggleButtonColor('like-btn');
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
    toggleButtonColor('dislike-btn');
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
    toggleButtonColor('bookmark-btn');
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
    return fetch('/create_bookmark', {
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

async function toggleButtons() {
    const currentUser = await getCurrentUser();
    const userId = currentUser.id; // Assuming the user object has an 'id' property

    const userLikedPost = likeButton.getAttribute('data-liked');
    const userDislikedPost = dislikeButton.getAttribute('data-disliked');
    const userBookmarkedPost = bookmarkButton.getAttribute('data-bookmark');

    if (userLikedPost == true ) {
        likeButton.style.backgroundColor = 'red';
        dislikeButton.style.backgroundColor = '';
    } else if (userDislikedPost == true){
        likeButton.style.backgroundColor = '';
        dislikeButton.style.backgroundColor = 'red';
    }
    if (userBookmarkedPost == true) {
        bookmarkButton.style.backgroundColor = 'red';
    }
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

toggleButtons();
});