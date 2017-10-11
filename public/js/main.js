window.onload = init

function init() {
    document.getElementById('dropdown-toggle').addEventListener('click', toggleDropdown)
}

function toggleDropdown() {
    const mobileMenu = document.getElementsByClassName('mobile-menu')[0]
    const state = mobileMenu.dataset.state
    const nextState = state === 'open' ? 'closed' : 'open'
    mobileMenu.dataset.state = nextState
    document.getElementById('dropdown-toggle').className = nextState === 'open' ? "fa fa-times" : "fa fa-bars"
}