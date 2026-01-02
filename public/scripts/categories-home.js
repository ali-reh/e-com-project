/**
 * Categories Slider for Home Page
 * Fetches categories and displays them in a scrollable slider
 */

document.addEventListener('DOMContentLoaded', function() {
    initCategoriesSlider();
});

async function initCategoriesSlider() {
    const slider = document.getElementById('categories-slider');
    const prevBtn = document.getElementById('cat-prev');
    const nextBtn = document.getElementById('cat-next');

    if (!slider) return;

    // Show loading placeholders
    showLoadingState(slider);

    try {
        // Fetch categories
        const response = await fetch('/api/categories');
        const result = await response.json();
        const categories = result.data || result || [];

        if (categories.length === 0) {
            showEmptyState(slider);
            return;
        }

        // Fetch product counts for each category
        const categoriesWithCounts = await fetchCategoryCounts(categories);

        // Render categories
        renderCategories(slider, categoriesWithCounts);

        // Setup slider navigation
        setupSliderNav(slider, prevBtn, nextBtn);

    } catch (error) {
        console.error('Error loading categories:', error);
        showEmptyState(slider);
    }
}

/**
 * Show loading placeholders
 */
function showLoadingState(slider) {
    slider.innerHTML = Array(4).fill(`
        <div class="category-card-placeholder"></div>
    `).join('');
}

/**
 * Show empty state
 */
function showEmptyState(slider) {
    slider.innerHTML = `
        <div class="categories-empty">
            <i class="bi bi-folder2-open"></i>
            <p>No categories available</p>
        </div>
    `;
}

/**
 * Fetch product counts for categories
 */
async function fetchCategoryCounts(categories) {
    try {
        const response = await fetch('/api/products');
        const result = await response.json();
        const products = result.data || result || [];

        // Count products per category
        const counts = {};
        products.forEach(product => {
            if (product.categories && Array.isArray(product.categories)) {
                product.categories.forEach(cat => {
                    counts[cat.id] = (counts[cat.id] || 0) + 1;
                });
            }
        });

        // Add counts to categories
        return categories.map(cat => ({
            ...cat,
            productCount: counts[cat.id] || 0
        }));
    } catch (error) {
        console.error('Error fetching product counts:', error);
        return categories.map(cat => ({ ...cat, productCount: 0 }));
    }
}

/**
 * Render categories to slider
 */
function renderCategories(slider, categories) {
    // Default images for categories without images
    const defaultImages = [
        'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=500&fit=crop',
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=500&fit=crop',
        'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=400&h=500&fit=crop',
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=500&fit=crop',
        'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&h=500&fit=crop',
        'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=500&fit=crop'
    ];

    slider.innerHTML = categories.map((category, index) => {
        const imageUrl = category.image_url || category.image || defaultImages[index % defaultImages.length];
        const productCount = category.productCount || 0;
        const countText = productCount === 1 ? '1 product' : `${productCount} products`;

        return `
            <a href="pages/shop.html?category=${category.id}" class="category-card">
                <img src="${imageUrl}" alt="${category.name}" class="category-card-image" 
                     onerror="this.src='${defaultImages[index % defaultImages.length]}'">
                <div class="category-card-overlay">
                    <h3 class="category-card-name">${category.name}</h3>
                    <span class="category-card-count">${countText}</span>
                </div>
                <span class="category-card-btn">Explore</span>
            </a>
        `;
    }).join('');
}

/**
 * Setup slider navigation
 */
function setupSliderNav(slider, prevBtn, nextBtn) {
    if (!prevBtn || !nextBtn) return;

    const scrollAmount = 240; // Card width + gap

    // Update button states
    function updateButtons() {
        const isAtStart = slider.scrollLeft <= 0;
        const isAtEnd = slider.scrollLeft >= slider.scrollWidth - slider.clientWidth - 10;

        prevBtn.disabled = isAtStart;
        nextBtn.disabled = isAtEnd;
    }

    // Initial state
    updateButtons();

    // Scroll on button click
    prevBtn.addEventListener('click', () => {
        slider.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    });

    nextBtn.addEventListener('click', () => {
        slider.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    });

    // Update buttons on scroll
    slider.addEventListener('scroll', updateButtons);

    // Update on resize
    window.addEventListener('resize', updateButtons);
}
