// post.js
document.addEventListener('DOMContentLoaded', function () {
    // Assuming you have a script tag somewhere in your HTML where you can embed JavaScript
    window.post = {}

    setButtons();
    // get correct color for the tag
    const tag = $("#post-tag").text().trim();
    if(tag === "no tag"){
        $("#post-tag").addClass("badge-secondary");
    }
    else{
        var hash = 0, i, chr;
        for (i = 1; i < tag.length; i++) {
            chr = tag.charCodeAt(i);
            hash = ((hash << 5) - hash) + chr;
            hash |= 0; // Convert to 32bit integer
        }
        const colors = ["primary", /*"secondary",*/ "success", "warning", "info"/*, "danger"*/];
        $("#post-tag").addClass(`badge-${colors[Math.abs(hash)%colors.length]}`)
    }

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

function getLikeButton() {
    return document.getElementById('like-btn');
}
function getDislikeButton() {
    return document.getElementById('dislike-btn');
}
function getBookmarkButton() {
    return document.getElementById('bookmark-btn');
}

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
        fetchNumLikes(postID);
        return response;
    })
    .catch(error => {
        // Handle fetch errors
        console.error('Fetch error:', error);
        fetchNumLikes(postID);
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

async function setButtons() {
    const userLikedPost = getLikeButton().getAttribute('data-liked');
    const userDislikedPost = getDislikeButton().getAttribute('data-disliked');
    const userBookmarkedPost = getBookmarkButton().getAttribute('data-bookmark');

    console.log("Liked: "+userLikedPost);
    console.log("Disiked: "+userDislikedPost);
    console.log("Bookmarked: "+userBookmarkedPost);

    if (userLikedPost === 'True') {
        getLikeButton().style.backgroundColor = 'red';
        getDislikeButton().style.backgroundColor = '';
    } else if (userDislikedPost === 'True'){
        getLikeButton().style.backgroundColor = '';
        getDislikeButton().style.backgroundColor = 'red';
    }
    if (userBookmarkedPost === 'True') {
        getBookmarkButton().style.backgroundColor = 'red';
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


//DOES NOT WORK YET
async function fetchNumLikes(postID) {
    try {
        const response = await fetch('/get_num_likes/'+postID);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const numLikes = await response.text(); // Assuming the response is text
        $('#num-likes').text(numLikes);
    } catch (error) {
        console.error('Error fetching number of likes:', error);
    }
}

window.addEventListener('resize', function() {
    var windowWidth = window.innerWidth;
    var mainContentDiv = document.getElementById('main-content-div');
    var leftContent = document.getElementById('left-content');
    var rightContent = document.getElementById('right-content');
  
    if (windowWidth < 786) {
      // If window width is less than 786px, stack left content on top of right content
      mainContentDiv.style.gridTemplateColumns = '100%';
      leftContent.style.width = '100%';
      leftContent.style.marginRight = '0';
      rightContent.style.width = '100%';
      rightContent.style.padding = '0';
    } else {
      // Otherwise, display both contents side by side
      mainContentDiv.style.gridTemplateColumns = '50% 70%';
      leftContent.style.width = 'auto';
      leftContent.style.marginRight = '1rem';
      rightContent.style.width = 'auto';
      rightContent.style.padding = '1rem';
    }
  });



});