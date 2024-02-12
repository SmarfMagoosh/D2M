function searchUsers() {
    const searchInput = document.getElementById('searchInput').value;
    
    // Make an AJAX request to your Flask route
    fetch(`/search?username=${searchInput}`)
        .then(response => response.json())
        .then(data => {
            displaySearchResults(data);
        })
        .catch(error => {
            console.error('Error fetching search results:', error);
        });
}

function displaySearchResults(results) {
    const searchResultsDropdown = document.getElementById('searchResultsDropdown');
    searchResultsDropdown.innerHTML = ''; // Clear previous results

    if (results.length === 0) {
        searchResultsDropdown.innerHTML = '<div>No results found</div>';
        return;
    }

    results.forEach(user => {
        const userElement = document.createElement('div');
        userElement.textContent = `${user.username}`;
        userElement.classList.add('dropdown-item');
        userElement.addEventListener('click', () => {
            // Handle click on dropdown item (e.g., navigate to user profile)
            console.log(`Clicked on ${user.username}`);
        });
        searchResultsDropdown.appendChild(userElement);
    });

    // Show the dropdown
    searchResultsDropdown.style.display = 'block';
}

document.addEventListener('click', function(event) {
    const dropdown = document.getElementById('searchResultsDropdown');
    const searchInput = document.getElementById('searchInput');

    // Check if the clicked element is outside the dropdown and search input
    if (event.target !== dropdown && event.target !== searchInput) {
        // If so, hide the dropdown
        dropdown.style.display = 'none';
    }
});
