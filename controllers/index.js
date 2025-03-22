// controllers/index.js

// Function to fetch and insert HTML components
async function loadComponent(url, containerId) {
    try {
        const response = await fetch(url);
        if (response.ok) {
            const html = await response.text();
            document.getElementById(containerId).innerHTML = html;
        } else {
            console.error(`Failed to load component from ${url}`);
        }
    } catch (error) {
        console.error(`Error loading component from ${url}:`, error);
    }
}

// Initialize component loading for index page
function initIndexPage() {
    loadComponent('/components/Header.html', 'header-container');
    loadComponent('/components/HeroSection.html', 'hero-section-container');
    loadComponent('/components/Footer.html', 'footer-container');
}

// Export functions for use in other modules if needed
window.indexController = {
    init: initIndexPage,
    loadComponent: loadComponent
};

// Run initialization when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initIndexPage);