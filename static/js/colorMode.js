/*!
 * Color mode toggler for Bootstrap's docs (https://getbootstrap.com/)
 * Copyright 2011-2024 The Bootstrap Authors
 * Licensed under the Creative Commons Attribution 3.0 Unported License.
 * 
 * Modified somewhat by Thomas Hutchins
 */

let dm_toggle = null

setTheme(getPreferredTheme())
    
// appears to update theme color in real time if set to auto
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const storedTheme = getStoredTheme()
    if (storedTheme !== 'light' && storedTheme !== 'dark') {
    setTheme(getPreferredTheme())
    }
})

window.addEventListener('DOMContentLoaded', () => {
    dm_toggle = document.getElementById("darkModeToggle")
    updateToggle(getPreferredTheme())
})

function getStoredTheme() { return localStorage.getItem('theme') }
function getPreferredTheme() {
    const storedTheme = getStoredTheme()
    if (storedTheme) {
        return storedTheme
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function setStoredTheme(theme){ localStorage.setItem('theme', theme) }
function setTheme(theme) {
    if (theme === 'auto') {
        document.documentElement.setAttribute('data-bs-theme', (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'))
    } else {
        document.documentElement.setAttribute('data-bs-theme', theme)
    }
}

function updateToggle(theme){
    dm_toggle.checked = theme === "dark" ? true : false
}

function dmToggleFlip(){
    const theme = dm_toggle.checked ? "dark" : "light"
    setTheme(theme)
    setStoredTheme(theme)
}