/**
 * Categories Slider for Home Page
 * Fetches categories and displays them in an auto-scrolling slider
 */

document.addEventListener('DOMContentLoaded', function() {
    initCategoriesSlider();
});

async function initCategoriesSlider() {
    const slider = document.getElementById('categories-slider');
    const wrapper = slider?.parentElement;

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

        // Setup auto-scroll
        setupAutoScroll(slider, wrapper);

        // Setup drag to scroll
        setupDragScroll(slider);

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
 * Setup auto-scroll functionality
 */
function setupAutoScroll(slider, wrapper) {
    const scrollSpeed = 1; // pixels per frame
    const pauseOnHover = true;
    let direction = 1; // 1 = forward, -1 = backward
    let isPaused = false;
    let animationId = null;

    // Update scroll indicator classes
    function updateScrollIndicators() {
        if (!wrapper) return;
        
        const isAtStart = slider.scrollLeft <= 5;
        const isAtEnd = slider.scrollLeft >= slider.scrollWidth - slider.clientWidth - 5;
        
        wrapper.classList.toggle('can-scroll-left', !isAtStart);
        wrapper.classList.toggle('can-scroll-right', !isAtEnd);
    }

    // Animation loop
    function animate() {
        if (!isPaused) {
            const maxScroll = slider.scrollWidth - slider.clientWidth;
            
            // Check boundaries and reverse direction
            if (slider.scrollLeft >= maxScroll - 1) {
                direction = -1;
            } else if (slider.scrollLeft <= 0) {
                direction = 1;
            }
            
            slider.scrollLeft += scrollSpeed * direction;
            updateScrollIndicators();
        }
        
        animationId = requestAnimationFrame(animate);
    }

    // Start animation
    animationId = requestAnimationFrame(animate);

    // Pause on hover/touch
    if (pauseOnHover) {
        slider.addEventListener('mouseenter', () => { isPaused = true; });
        slider.addEventListener('mouseleave', () => { isPaused = false; });
        slider.addEventListener('touchstart', () => { isPaused = true; }, { passive: true });
        slider.addEventListener('touchend', () => { 
            setTimeout(() => { isPaused = false; }, 2000); // Resume after 2s
        });
    }

    // Update indicators on manual scroll
    slider.addEventListener('scroll', updateScrollIndicators);
    
    // Initial indicator state
    updateScrollIndicators();

    // Cleanup on page hide
    document.addEventListener('visibilitychange', () => {
        if (document.hidden && animationId) {
            cancelAnimationFrame(animationId);
        } else if (!document.hidden) {
            animationId = requestAnimationFrame(animate);
        }
    });
}

/**
 * Setup drag-to-scroll functionality
 */
function setupDragScroll(slider) {
    let isDown = false;
    let startX;
    let scrollLeft;

    slider.addEventListener('mousedown', (e) => {
        isDown = true;
        slider.style.scrollBehavior = 'auto';
        startX = e.pageX - slider.offsetLeft;
        scrollLeft = slider.scrollLeft;
    });

    slider.addEventListener('mouseleave', () => {
        isDown = false;
        slider.style.scrollBehavior = 'smooth';
    });

    slider.addEventListener('mouseup', () => {
        isDown = false;
        slider.style.scrollBehavior = 'smooth';
    });

    slider.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - slider.offsetLeft;
        const walk = (x - startX) * 1.5;
        slider.scrollLeft = scrollLeft - walk;
    });
}
