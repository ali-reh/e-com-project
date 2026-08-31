/**
 * Featured Products Script
 * Fetches and displays featured products from the API
 */

document.addEventListener('DOMContentLoaded', async () => {
  const grid = document.querySelector('.featured-grid');
  
  if (!grid) {
    console.error('Featured grid element not found in HTML');
    return;
  }

  /**
   * Format price as currency
   */
  const formatMoney = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value || 0);
  };

  /**
   * Get primary image from product_images array
   */
  const getPrimaryImage = (productImages) => {
    if (!productImages || !Array.isArray(productImages) || productImages.length === 0) {
      return 'https://via.placeholder.com/400x400?text=No+Image';
    }
    
    const primary = productImages.find(img => img.is_primary);
    return primary ? primary.image_url : productImages[0].image_url;
  };

  /**
   * Get category names from categories array (many-to-many)
   */
  const getCategoryNames = (categories) => {
    if (!categories || !Array.isArray(categories) || categories.length === 0) {
      return 'Uncategorized';
    }
    
    // Join multiple categories with bullet separator
    return categories.map(cat => cat.name).join(' • ');
  };

  /**
   * Render featured products to the grid
   */
  const renderFeaturedProducts = (products) => {
    if (!products || products.length === 0) {
      grid.innerHTML = `
        <div class="col-12 text-center py-5">
          <p class="text-secondary mb-0">No featured products available at this time.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = products
      .map((product) => {
        const imageUrl = getPrimaryImage(product.product_images);
        const categoryNames = getCategoryNames(product.categories);
        const price = formatMoney(product.price);
        
        return `
          <article class="product-card" data-product-id="${product.id}">
            <div class="media-wrap">
              <img 
                src="${imageUrl}" 
                alt="${product.name}"
                loading="lazy"
                onerror="this.src='https://via.placeholder.com/400x500?text=Image+Error'"
              >
              <div class="quick-actions">
                <a class="quick-action-btn" href="pages/product.html?id=${product.id}" title="View details">
                  <i class="bi bi-eye"></i>
                </a>
                <button class="quick-action-btn add-to-cart-btn" data-product-id="${product.id}" title="Add to cart">
                  <i class="bi bi-bag-plus"></i>
                </button>
              </div>
            </div>
            <div class="product-body">
              <p class="product-meta">${categoryNames}</p>
              <h3 class="product-title">${product.name}</h3>
              <div class="price-row">
                <span class="price">${price}</span>
              </div>
            </div>
          </article>
        `;
      })
      .join('');

    // Add click event listeners for "Add to Cart" buttons
    attachCartListeners();
  };

  /**
   * Attach event listeners to add-to-cart buttons
   */
  const attachCartListeners = () => {
    const addCartButtons = document.querySelectorAll('.add-to-cart-btn');
    
    addCartButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const productId = button.dataset.productId;
        handleAddToCart(productId);
      });
    });
  };

  /**
   * Handle add to cart action - opens modal
   */
  const handleAddToCart = (productId) => {
    if (typeof CartModal !== 'undefined') {
      CartModal.open(productId);
    } else if (typeof CartService !== 'undefined') {
      // Fallback if modal not available
      CartService.addToCart(productId, 1);
    } else {
      console.error('CartModal/CartService not available');
    }
  };

  /**
   * Load featured products from API
   */
  const loadFeaturedProducts = async () => {
    try {
      // Fetch featured products
      const response = await fetch('/api/products/featured');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Handle response from successResponse wrapper
      // Response format: { success: true, data: [...], message: "..." }
      const products = result.data || result;

      if (!Array.isArray(products)) {
        console.error('Invalid response format:', result);
        throw new Error('Server returned invalid data format');
      }

      console.log(`Loaded ${products.length} featured products`);
      renderFeaturedProducts(products);

      // Signal that data loading is complete
      if (typeof window.dataLoadComplete === 'function') {
        window.dataLoadComplete();
      }

    } catch (error) {
      console.error('Error loading featured products:', error);
      
      // Signal data loading complete even on error
      if (typeof window.dataLoadComplete === 'function') {
        window.dataLoadComplete();
      }
      
      grid.innerHTML = `
        <div class="col-12 text-center py-5">
          <i class="bi bi-exclamation-triangle text-warning" style="font-size: 3rem;"></i>
          <p class="text-danger mt-3 mb-2">Unable to load featured products</p>
          <small class="text-secondary">${error.message}</small>
          <br>
          <button class="btn btn-sm btn-outline-primary mt-3" onclick="location.reload()">
            <i class="bi bi-arrow-clockwise"></i> Try Again
          </button>
        </div>
      `;
    }
  };

  // Initialize: Load featured products
  loadFeaturedProducts();
});