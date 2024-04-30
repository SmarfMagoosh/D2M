let tagTemplate = null;
let tagDropdownBtn = null
let searchResultsDropdown = null;
let searchBar = null;
let postResultTemplate = null;
let postResultText = null;
let postResultDiv = null;
let userResultTemplate = null;
let userResultText = null;
let userResultDiv = null;
let noResults = null;
const colors = ["primary", /*"secondary",*/ "success", "warning", "info"/*, "danger"*/];
const maxtagsvisible = 30;
document.addEventListener("DOMContentLoaded", async () => {
    searchResultsDropdown = document.getElementById('searchResultsDropdown');
    searchBar = document.getElementById('searchInput');

    postResultDiv = document.getElementById("search-post-results");
    postResultTemplate = document.getElementById("postResultTemplate");
    postResultText = document.getElementById("search-posts-label");
    
    userResultDiv = document.getElementById("search-user-results");
    userResultTemplate = document.getElementById("userResultTemplate");
    userResultText = document.getElementById("search-users-label");

    noResults = document.getElementById("no-results");

    // taglist should only have one element when loading in
    tagTemplate = document.getElementsByClassName("tag-badge")[0];
    tagDropdownBtn = document.getElementById("tag-dropdown-btn");

    /* initialize the no tag option */
    insertTag("no tag", "secondary");
    /* fetch and add the other tags */
    await fetch(`/API/taglist/`)
        .then(validateJSON)
        .then(data => {
                for (const tag of data) {
                    insertTag(`#${tag}`, getColor(tag));
                }
            }
        );
    
    const tagSearchBar = document.getElementById("tagInput");
    const tagList = document.getElementsByClassName("tag-badge");
    tagSearchBar.addEventListener('input', event => {
        let count = 0;
        for (let i = 0; i < tagList.length; i++) {
            if(tagList[i].innerText == "template") continue;
            const tagContainsQuery = tagList[i].innerText.toLowerCase().includes(tagSearchBar.value.toLowerCase());
            tagList[i].hidden = !tagContainsQuery || count >= maxtagsvisible;
            if(tagContainsQuery) count++;
        }
    });

    searchBar.addEventListener("keyup", e => {
        if (e.key === "Enter") {
            search();
        }
    })

    document.onclick = function(e){
        if(!searchResultsDropdown.contains(e.target)){
            searchResultsDropdown.hidden = true;
        }
    };
});


function search() {
    let numargs = 0;
    let tag = "";
    if (tagDropdownBtn.innerText != "no tag"){
        numargs++;
        tag = `tag=${tagDropdownBtn.innerText.substring(1)}`;
    }
    let query = searchBar.value.trim();
    if(query != "") {
        numargs++;
        query = `query=${query}`
    }
    // to satisfy acceptance test 3.3
    if(numargs == 0) return;
    // Make an AJAX request to your Flask route
    fetch(`/search${numargs !== 0 ? "?":""}${query}${numargs === 2 ? "&" : ""}${tag}`)
        .then(response => response.json())
        .then(data => {
            displaySearchResults(data);
        })
        .catch(error => {
            console.error('Error fetching search results:', error);
        });
}

function displaySearchResults(results) {
    clearResults();
    //either there are any results or there aren't
    const anyResults = results.users.length !== 0 || results.posts.length !== 0;
    //hide all except for "No Results" if none, show results otherwise
    noResults.hidden = anyResults;
    postResultText.parentElement.hidden = !anyResults;
    userResultText.parentElement.hidden = !anyResults;

    userResultText.innerText = results.users.length === 0 ? "No User Results" : "Users";
    results.users.forEach(user => {
        insertUserResult(user);
    });

    postResultText.innerText = results.posts.length === 0 ? "No Post Results" : "Posts";
    results.posts.forEach(post => {
        insertPostResult(post);
    });

    // Show the dropdown
    searchResultsDropdown.hidden = false;
}

function clearResults(){
    postResultDiv.innerHTML = "";
    userResultDiv.innerHTML = "";
}

function insertTag(tag, color){
    const new_tag = tagTemplate.cloneNode(true);

    new_tag.innerText = tag;
    // seemingly random color option that is consistent across accesses
    new_tag.classList.add(`btn-${color}`);
    new_tag.hidden = false;

    new_tag.addEventListener("click", event =>{
        const classList = tagDropdownBtn.className.split(' ')
        for (let i=0; i<classList.length; i++){
            if(classList[i].includes("btn-")) {
                tagDropdownBtn.classList.replace(classList[i], `btn-${color}`);
                break;
            }
        }
        tagDropdownBtn.innerText = tag
    })

    tagTemplate.parentElement.appendChild(new_tag);
}

function insertPostResult(post){
    const new_post = postResultTemplate.cloneNode(true);
    new_post.hidden = false;
    const link = new_post.getElementsByTagName("a")[0];

    link.href = `/post/${post.id}`;

    link.getElementsByTagName('img')[0].src = post.thumbnail;
    
    link.getElementsByTagName('strong')[0].innerText = post.title;
    
    link.getElementsByTagName('em')[0].innerText = post.poster;

    new_post.classList.add("resultsdiv");
    postResultDiv.appendChild(new_post);
}

function insertUserResult(user){
    const new_user = userResultTemplate.cloneNode(true);
    new_user.hidden = false;

    const link = new_user.getElementsByTagName("a")[0];
    link.href = `/profile/${user.username}`;

    link.getElementsByTagName('img')[0].src = user.pfp;
    
    link.getElementsByTagName('strong')[0].innerText = user.username;

    new_user.classList.add("resultsdiv");

    userResultDiv.appendChild(new_user);
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
    return colors[Math.abs(text.hashCode())%colors.length]
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