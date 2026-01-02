/**
 * Shop Page Script
 * Fetches and displays all products from the API
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Create shop content container if not exists
  const body = document.body;
  const header = document.getElementById('header');
  const footer = document.getElementById('footer');
  
  // Create main shop section
  const shopSection = document.createElement('main');
  shopSection.className = 'shop-section';
  shopSection.innerHTML = `
    <div class="container">
      <div class="shop-header">
        <h1 class="luxury-font">Shop All</h1>
        <p class="shop-subtitle">Discover our complete collection</p>
      </div>
      <div class="products-grid" id="products-grid">
        <!-- Products will be loaded here -->
      </div>
    </div>
  `;
  
  // Insert after header
  if (footer) {
    body.insertBefore(shopSection, footer);
  } else {
    body.appendChild(shopSection);
  }

  const grid = document.getElementById('products-grid');

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
   * Get category names from categories array
   */
  const getCategoryNames = (categories) => {
    if (!categories || !Array.isArray(categories) || categories.length === 0) {
      return 'Uncategorized';
    }
    return categories.map(cat => cat.name).join(' • ');
  };

  /**
   * Render products to the grid
   */
  const renderProducts = (products) => {
    if (!products || products.length === 0) {
      grid.innerHTML = `
        <div class="col-12 text-center py-5">
          <p class="text-secondary mb-0">No products available at this time.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = products
      .map((product, index) => {
        const imageUrl = getPrimaryImage(product.product_images);
        const categoryNames = getCategoryNames(product.categories);
        const price = formatMoney(product.price);
        
        return `
          <article class="product-card fade-in-item" style="animation-delay: ${0.05 * index}s" data-product-id="${product.id}">
            <div class="media-wrap">
              <img 
                src="${imageUrl}" 
                alt="${product.name}"
                onerror="this.src='https://via.placeholder.com/400x400?text=Image+Error'"
              >
              <a class="add-cart" href="#" data-product-id="${product.id}" title="Add to cart">
                <i class="bi bi-plus"></i>
              </a>
              <a class="product-view-btn" href="product.html?id=${product.id}" title="View details">
                <i class="bi bi-eye-fill"></i>
              </a>
            </div>
            <div class="product-body">
              <h3 class="product-title">${product.name}</h3>
              <div class="product-meta">${categoryNames}</div>
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
    const addCartButtons = document.querySelectorAll('.add-cart');
    
    addCartButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const productId = button.dataset.productId;
        handleAddToCart(productId);
      });
    });
  };

  /**
   * Handle add to cart action
   */
  const handleAddToCart = (productId) => {
    console.log('Add to cart:', productId);
    alert('Product added to cart!');
  };

  /**
   * Load products from API
   */
  const loadProducts = async () => {
    try {
      // Check for category filter in URL
      const urlParams = new URLSearchParams(window.location.search);
      const categoryId = urlParams.get('category');
      
      let url = '/api/products';
      if (categoryId) {
        url += `?category=${categoryId}`;
      }

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      const products = result.data || result;

      if (!Array.isArray(products)) {
        throw new Error('Server returned invalid data format');
      }

      console.log(`Loaded ${products.length} products`);
      renderProducts(products);

      // Signal that data loading is complete
      if (typeof window.dataLoadComplete === 'function') {
        window.dataLoadComplete();
      }

    } catch (error) {
      console.error('Error loading products:', error);
      
      // Signal data loading complete even on error
      if (typeof window.dataLoadComplete === 'function') {
        window.dataLoadComplete();
      }
      
      grid.innerHTML = `
        <div class="col-12 text-center py-5">
          <i class="bi bi-exclamation-triangle text-warning" style="font-size: 3rem;"></i>
          <p class="text-danger mt-3 mb-2">Unable to load products</p>
          <small class="text-secondary">${error.message}</small>
          <br>
          <button class="btn btn-sm btn-outline-primary mt-3" onclick="location.reload()">
            <i class="bi bi-arrow-clockwise"></i> Try Again
          </button>
        </div>
      `;
    }
  };

  // Initialize: Load products
  loadProducts();
});
