// Categories Sidebar Functionality
document.addEventListener('DOMContentLoaded', function() {
    initCategoriesSidebar();
});

function initCategoriesSidebar() {
    let categoriesLoaded = false;

    // Use event delegation since header is loaded dynamically
    document.addEventListener('click', function(e) {
        // Check if clicked element is the categories button
        if (e.target.closest('#categories-btn')) {
            e.preventDefault();
            openSidebar();
        }

        // Check if clicked element is the close button
        if (e.target.closest('#sidebar-close-btn')) {
            closeSidebar();
        }

        // Check if clicked element is the overlay
        if (e.target.id === 'categories-overlay') {
            closeSidebar();
        }
    });

    // Close sidebar on Escape key
    document.addEventListener('keydown', function(e) {
        const sidebar = document.getElementById('categories-sidebar');
        if (e.key === 'Escape' && sidebar && sidebar.classList.contains('active')) {
            closeSidebar();
        }
    });

    function openSidebar() {
        const sidebar = document.getElementById('categories-sidebar');
        const overlay = document.getElementById('categories-overlay');
        
        if (sidebar && overlay) {
            sidebar.classList.add('active');
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';

            // Load categories if not already loaded
            if (!categoriesLoaded) {
                loadCategories();
            }
        }
    }

    function closeSidebar() {
        const sidebar = document.getElementById('categories-sidebar');
        const overlay = document.getElementById('categories-overlay');
        
        if (sidebar && overlay) {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    async function loadCategories() {
        const categoriesList = document.getElementById('categories-list');
        const loadingSpinner = document.getElementById('categories-loading');
        
        try {
            showLoading();
            
            const response = await fetch('/api/categories');
            const result = await response.json();

            if (result.success && result.data) {
                renderCategories(result.data);
                categoriesLoaded = true;
            } else {
                showEmptyState();
            }
        } catch (error) {
            console.error('Error loading categories:', error);
            showErrorState();
        } finally {
            hideLoading();
        }
    }

    function renderCategories(categories) {
        const categoriesList = document.getElementById('categories-list');
        if (!categoriesList) return;
        
        categoriesList.innerHTML = '';

        if (categories.length === 0) {
            showEmptyState();
            return;
        }

        categories.forEach((category, index) => {
            const li = document.createElement('li');
            li.className = 'category-item';
            li.style.animationDelay = `${0.05 * (index + 1)}s`;

            const link = document.createElement('a');
            link.href = `pages/shop.html?category=${category.id}`;
            link.className = 'category-link';
            link.innerHTML = `
                <span>${category.name}</span>
                <i class="bi bi-arrow-right"></i>
            `;

            li.appendChild(link);
            categoriesList.appendChild(li);
        });
    }

    function showLoading() {
        const loadingSpinner = document.getElementById('categories-loading');
        const categoriesList = document.getElementById('categories-list');
        
        if (loadingSpinner) {
            loadingSpinner.classList.remove('hidden');
        }
        if (categoriesList) {
            categoriesList.innerHTML = '';
        }
    }

    function hideLoading() {
        const loadingSpinner = document.getElementById('categories-loading');
        if (loadingSpinner) {
            loadingSpinner.classList.add('hidden');
        }
    }

    function showEmptyState() {
        const categoriesList = document.getElementById('categories-list');
        if (categoriesList) {
            categoriesList.innerHTML = `
                <li class="categories-empty">
                    <i class="bi bi-folder2-open"></i>
                    <p>No categories available</p>
                </li>
            `;
        }
    }

    function showErrorState() {
        const categoriesList = document.getElementById('categories-list');
        if (categoriesList) {
            categoriesList.innerHTML = `
                <li class="categories-empty">
                    <i class="bi bi-exclamation-circle"></i>
                    <p>Failed to load categories</p>
                </li>
            `;
        }
    }
}
