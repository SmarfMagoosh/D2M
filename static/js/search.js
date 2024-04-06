let tagTemplate = null;
let tagDropdownBtn = null
const colors = ["primary", /*"secondary",*/ "success", "warning", /*"info",*/ "danger"];
const maxtagsvisible = 30;
document.addEventListener("DOMContentLoaded", async () => {
    // taglist should only have one element when loading in
    tagTemplate = document.getElementsByClassName("tag-badge")[0];
    tagDropdownBtn = document.getElementById("tag-dropdown-btn");

    /* initialize the no tag option */
    const no_tag = tagTemplate.cloneNode(true);
    no_tag.innerText="no tag"
    no_tag.classList.add("btn-secondary");
    no_tag.hidden = false;
    no_tag.addEventListener("click", ()=>{
        const classList = tagDropdownBtn.className.split(' ')
        for (let i=0; i<classList.length; i++){
            if(classList[i].includes("btn-")) {
                tagDropdownBtn.classList.replace(classList[i], `btn-secondary`);
                break;
            }
        }
        tagDropdownBtn.innerText = "no tag"
    })
    tagTemplate.parentElement.appendChild(no_tag);

    await fetch(`/API/taglist/`)
        .then(validateJSON)
        .then(data => {
                for (const tag of data) {
                    const new_tag = tagTemplate.cloneNode(true);

                    new_tag.innerText = `#${tag}`;
                    // seemingly random color option that is consistent across accesses
                    new_tag.classList.add(`btn-${getColor(tag)}`);
                    new_tag.hidden = false;

                    new_tag.addEventListener("click", event =>{
                        const classList = tagDropdownBtn.className.split(' ')
                        for (let i=0; i<classList.length; i++){
                            if(classList[i].includes("btn-")) {
                                tagDropdownBtn.classList.replace(classList[i], `btn-${getColor(tag)}`);
                                break;
                            }
                        }
                        tagDropdownBtn.innerText = tag
                    })

                    tagTemplate.parentElement.appendChild(new_tag);
                }
            }
        );
    
    const tagSearchBar = document.getElementById("tagInput");
    const tagList = document.getElementsByClassName("tag-badge");
    tagSearchBar.addEventListener('input', event => {
        let count = 0;
        for (let i = 0; i < tagList.length; i++) {
            if(tagList[i].innerText == "template") continue;
            const tagContainsQuery = tagList[i].innerText.toLowerCase().includes(tagSearchBar.value.toLowerCase().substring(1));
            tagList[i].hidden = !tagContainsQuery || count >= maxtagsvisible;
            if(tagContainsQuery) count++;
        }
        for (const tag in tagList){
            
        }
    });
    // const dropdown = document.getElementById('searchResultsDropdown');
    // const searchInput = document.getElementById('searchInput');

    // Check if the clicked element is outside the dropdown and search input
    // if (event.target !== dropdown && event.target !== searchInput) {
    //     // If so, hide the dropdown
    //     dropdown.style.display = 'none';
    // }
});


function search() {
    const searchInput = document.getElementById('searchInput').value;
    
    // Make an AJAX request to your Flask route
    fetch(`/search?query=${searchInput}`)
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

    console.log(results);

    results.users.forEach(user => {
        const userElement = document.createElement('div');
        userElement.textContent = `${user.username}`;
        userElement.classList.add('dropdown-item');
        userElement.addEventListener('click', () => {
            // Handle click on dropdown item (e.g., navigate to user profile)
            console.log(`Clicked on ${user.username}`);
        });
        searchResultsDropdown.appendChild(userElement);
    });

    results.posts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.textContent = `${post.title}`;
        postElement.classList.add('dropdown-item');
        postElement.addEventListener('click', () => {
            // Handle click on dropdown item (e.g., navigate to post)
            console.log(`Clicked on ${post.title}`);
        });
        searchResultsDropdown.appendChild(postElement);
    });

    // Show the dropdown
    searchResultsDropdown.style.display = 'block';
}

/**
   * Validate a response to ensure the HTTP status code indcates success.
   * 
   * @param {Response} response HTTP response to be checked
   * @returns {object} object encoded by JSON in the response
   */
function validateJSON(response) {
    if (response.ok) {
        return response.json();
    } else {
        return Promise.reject(response);
    }
}

function getColor(text){
    return colors[text.hashCode()%colors.length]
}

//Thanks to esmiralha on stackoverflow for this
//https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript
String.prototype.hashCode = function() {
    var hash = 0,
      i, chr;
    if (this.length === 0) return hash;
    for (i = 0; i < this.length; i++) {
      chr = this.charCodeAt(i);
      hash = ((hash << 5) - hash) + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  }
  