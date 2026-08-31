/**
 * Search Modal Functionality
 * Handles product search with live results
 */

document.addEventListener('DOMContentLoaded', function() {
    initSearchModal();
});

function initSearchModal() {
    let searchTimeout;
    let cachedProducts = null;

    // Use event delegation since header is loaded dynamically
    document.addEventListener('click', function(e) {
        // Open search modal
        if (e.target.closest('#search-btn')) {
            e.preventDefault();
            openSearch();
        }

        // Close search modal
        if (e.target.closest('#search-close-btn') || e.target.id === 'search-overlay') {
            closeSearch();
        }

        // Clear search input
        if (e.target.closest('#search-clear-btn')) {
            clearSearch();
        }

        // Handle result click
        if (e.target.closest('.search-result-item')) {
            closeSearch();
        }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        const modal = document.getElementById('search-modal');
        
        // Escape to close
        if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
            closeSearch();
        }
        
        // Ctrl/Cmd + K to open
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const isOpen = modal && modal.classList.contains('active');
            if (isOpen) {
                closeSearch();
            } else {
                openSearch();
            }
        }
    });

    // Input handler with debounce
    document.addEventListener('input', function(e) {
        if (e.target.id === 'search-modal-input') {
            const query = e.target.value.trim();
            const clearBtn = document.getElementById('search-clear-btn');
            
            // Show/hide clear button
            if (clearBtn) {
                clearBtn.classList.toggle('visible', query.length > 0);
            }
            
            // Debounce search
            clearTimeout(searchTimeout);
            if (query.length > 0) {
                showLoading();
                searchTimeout = setTimeout(() => {
                    performSearch(query);
                }, 300);
            } else {
                showPlaceholder();
            }
        }
    });

    function openSearch() {
        const modal = document.getElementById('search-modal');
        const overlay = document.getElementById('search-overlay');
        const input = document.getElementById('search-modal-input');

        if (modal && overlay) {
            modal.classList.add('active');
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';

            // Focus input
            setTimeout(() => {
                if (input) input.focus();
            }, 100);

            // Preload products
            if (!cachedProducts) {
                preloadProducts();
            }
        }
    }

    function closeSearch() {
        const modal = document.getElementById('search-modal');
        const overlay = document.getElementById('search-overlay');

        if (modal && overlay) {
            modal.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    function clearSearch() {
        const input = document.getElementById('search-modal-input');
        const clearBtn = document.getElementById('search-clear-btn');
        
        if (input) {
            input.value = '';
            input.focus();
        }
        if (clearBtn) {
            clearBtn.classList.remove('visible');
        }
        showPlaceholder();
    }

    async function preloadProducts() {
        try {
            const response = await fetch('/api/products');
            const result = await response.json();
            cachedProducts = result.data || result || [];
        } catch (error) {
            console.error('Error preloading products:', error);
            cachedProducts = [];
        }
    }

    async function performSearch(query) {
        // Use cached products or fetch
        if (!cachedProducts) {
            await preloadProducts();
        }

        const searchLower = query.toLowerCase();
        
        // Filter products
        const results = cachedProducts.filter(product => 
            product.name.toLowerCase().includes(searchLower) ||
            (product.description && product.description.toLowerCase().includes(searchLower)) ||
            (product.categories && product.categories.some(c => c.name.toLowerCase().includes(searchLower)))
        );

        renderResults(results, query);
    }

    function renderResults(results, query) {
        const container = document.getElementById('search-results');
        if (!container) return;

        if (results.length === 0) {
            container.innerHTML = `
                <div class="search-no-results">
                    <i class="bi bi-search"></i>
                    <p>No products found for "${query}"</p>
                </div>
            `;
            return;
        }

        // Limit to first 6 results
        const displayResults = results.slice(0, 6);
        const isInPagesFolder = window.location.pathname.includes('/pages/');
        const shopUrl = isInPagesFolder ? 'shop.html' : 'pages/shop.html';
        const productUrl = isInPagesFolder ? 'product.html' : 'pages/product.html';

        let html = displayResults.map(product => {
            const imageUrl = getProductImage(product);
            const category = product.categories?.[0]?.name || 'Uncategorized';
            const price = formatMoney(product.price);

            return `
                <a href="${productUrl}?id=${product.id}" class="search-result-item">
                    <img src="${imageUrl}" alt="${product.name}" class="search-result-image" onerror="this.src='https://via.placeholder.com/60x60?text=No+Image'">
                    <div class="search-result-info">
                        <div class="search-result-name">${highlightMatch(product.name, query)}</div>
                        <div class="search-result-category">${category}</div>
                        <div class="search-result-price">${price}</div>
                    </div>
                </a>
            `;
        }).join('');

        // Add "View All" if more results
        if (results.length > 6) {
            html += `
                <a href="${shopUrl}?search=${encodeURIComponent(query)}" class="search-view-all">
                    View all ${results.length} results
                </a>
            `;
        }

        container.innerHTML = html;
    }

    function getProductImage(product) {
        if (!product.product_images || product.product_images.length === 0) {
            return 'https://via.placeholder.com/60x60?text=No+Image';
        }
        const primary = product.product_images.find(img => img.is_primary);
        return primary ? primary.image_url : product.product_images[0].image_url;
    }

    function formatMoney(value) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value || 0);
    }

    function highlightMatch(text, query) {
        const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
        return text.replace(regex, '<strong>$1</strong>');
    }

    function escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    function showLoading() {
        const container = document.getElementById('search-results');
        if (container) {
            container.innerHTML = `
                <div class="search-loading">
                    Searching...
                </div>
            `;
        }
    }

    function showPlaceholder() {
        const container = document.getElementById('search-results');
        if (container) {
            container.innerHTML = `
                <div class="search-placeholder">
                    <i class="bi bi-search"></i>
                    <p>Start typing to search products...</p>
                </div>
            `;
        }
    }
}
