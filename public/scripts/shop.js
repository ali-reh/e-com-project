/**
 * Shop Page Script
 * Fetches and displays all products from the API with filtering
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Store all products for filtering
  let allProducts = [];
  let allCategories = [];
  
  // Filter state
  let filters = {
    category: null,
    minPrice: null,
    maxPrice: null,
    sortBy: 'default',
    search: ''
  };

  // Create shop content container if not exists
  const body = document.body;
  const header = document.getElementById('header');
  const footer = document.getElementById('footer');
  
  // Create main shop section with filter sidebar
  const shopSection = document.createElement('main');
  shopSection.className = 'shop-section';
  shopSection.innerHTML = `
    <div class="container">
      <div class="shop-header">
        <h1 class="luxury-font">Shop All</h1>
        <p class="shop-subtitle">Discover our complete collection</p>
      </div>
      
      <div class="shop-layout">
        <!-- Filter Sidebar -->
        <aside class="shop-filters" id="shop-filters">
          <div class="filter-header">
            <h3>Filters</h3>
            <button class="clear-filters-btn" id="clear-filters">Clear All</button>
          </div>
          
          <!-- Search -->
          <div class="filter-group">
            <h4 class="filter-title">Search</h4>
            <div class="search-input-wrap">
              <i class="bi bi-search"></i>
              <input type="text" id="search-input" placeholder="Search products..." class="filter-search">
            </div>
          </div>
          
          <!-- Categories -->
          <div class="filter-group">
            <h4 class="filter-title">Categories</h4>
            <ul class="category-filter-list" id="category-filter-list">
              <!-- Categories loaded dynamically -->
            </ul>
          </div>
          
          <!-- Price Range -->
          <div class="filter-group">
            <h4 class="filter-title">Price Range</h4>
            <div class="price-inputs">
              <input type="number" id="min-price" placeholder="Min" class="price-input">
              <span class="price-separator">—</span>
              <input type="number" id="max-price" placeholder="Max" class="price-input">
            </div>
          </div>
          
          <!-- Sort -->
          <div class="filter-group">
            <h4 class="filter-title">Sort By</h4>
            <select id="sort-select" class="sort-select">
              <option value="default">Default</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name-az">Name: A to Z</option>
              <option value="name-za">Name: Z to A</option>
              <option value="newest">Newest First</option>
            </select>
          </div>
        </aside>
        
        <!-- Products Grid -->
        <div class="shop-products">
          <div class="products-toolbar">
            <div class="results-count" id="results-count">0 products</div>
            <button class="mobile-filter-btn" id="mobile-filter-btn">
              <i class="bi bi-funnel"></i> Filters
            </button>
          </div>
          <div class="products-grid" id="products-grid">
            <!-- Products will be loaded here -->
          </div>
        </div>
      </div>
    </div>
    
    <!-- Mobile Filter Overlay -->
    <div class="filter-overlay" id="filter-overlay"></div>
  `;
  
  // Insert after header
  if (footer) {
    body.insertBefore(shopSection, footer);
  } else {
    body.appendChild(shopSection);
  }

  const grid = document.getElementById('products-grid');
  const resultsCount = document.getElementById('results-count');

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
   * Apply filters and sort to products
   */
  const applyFilters = () => {
    let filtered = [...allProducts];
    
    // Category filter
    if (filters.category) {
      filtered = filtered.filter(p => 
        p.categories && p.categories.some(c => c.id == filters.category)
      );
    }
    
    // Price filter
    if (filters.minPrice !== null) {
      filtered = filtered.filter(p => p.price >= filters.minPrice);
    }
    if (filters.maxPrice !== null) {
      filtered = filtered.filter(p => p.price <= filters.maxPrice);
    }
    
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchLower) ||
        (p.description && p.description.toLowerCase().includes(searchLower))
      );
    }
    
    // Sort
    switch (filters.sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name-az':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-za':
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
    }
    
    renderProducts(filtered);
  };

  /**
   * Render products to the grid
   */
  const renderProducts = (products) => {
    resultsCount.textContent = `${products.length} product${products.length !== 1 ? 's' : ''}`;
    
    if (!products || products.length === 0) {
      grid.innerHTML = `
        <div class="no-products">
          <i class="bi bi-search"></i>
          <p>No products found</p>
          <span>Try adjusting your filters</span>
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
          <article class="product-card fade-in-item" style="animation-delay: ${0.03 * index}s" data-product-id="${product.id}">
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

    attachCartListeners();
  };

  /**
   * Render categories to filter list
   */
  const renderCategoryFilters = () => {
    const list = document.getElementById('category-filter-list');
    
    let html = `<li>
      <label class="category-filter-item ${!filters.category ? 'active' : ''}">
        <input type="radio" name="category" value="" ${!filters.category ? 'checked' : ''}>
        <span>All Categories</span>
      </label>
    </li>`;
    
    html += allCategories.map(cat => `
      <li>
        <label class="category-filter-item ${filters.category == cat.id ? 'active' : ''}">
          <input type="radio" name="category" value="${cat.id}" ${filters.category == cat.id ? 'checked' : ''}>
          <span>${cat.name}</span>
        </label>
      </li>
    `).join('');
    
    list.innerHTML = html;
    
    // Attach listeners
    list.querySelectorAll('input[name="category"]').forEach(input => {
      input.addEventListener('change', (e) => {
        filters.category = e.target.value || null;
        renderCategoryFilters();
        applyFilters();
      });
    });
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
  const handleAddToCart = async (productId) => {
    if (typeof CartService !== 'undefined') {
      await CartService.addToCart(productId, 1);
    } else {
      console.error('CartService not available');
    }
  };

  /**
   * Initialize filter event listeners
   */
  const initFilterListeners = () => {
    // Search
    const searchInput = document.getElementById('search-input');
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        filters.search = e.target.value;
        applyFilters();
      }, 300);
    });
    
    // Price inputs - auto apply with debounce
    const minPriceInput = document.getElementById('min-price');
    const maxPriceInput = document.getElementById('max-price');
    let priceTimeout;
    
    const handlePriceChange = () => {
      clearTimeout(priceTimeout);
      priceTimeout = setTimeout(() => {
        const min = minPriceInput.value;
        const max = maxPriceInput.value;
        filters.minPrice = min ? parseFloat(min) : null;
        filters.maxPrice = max ? parseFloat(max) : null;
        applyFilters();
      }, 500);
    };
    
    minPriceInput.addEventListener('input', handlePriceChange);
    maxPriceInput.addEventListener('input', handlePriceChange);
    
    // Sort
    document.getElementById('sort-select').addEventListener('change', (e) => {
      filters.sortBy = e.target.value;
      applyFilters();
    });
    
    // Clear filters
    document.getElementById('clear-filters').addEventListener('click', () => {
      filters = { category: null, minPrice: null, maxPrice: null, sortBy: 'default', search: '' };
      document.getElementById('search-input').value = '';
      document.getElementById('min-price').value = '';
      document.getElementById('max-price').value = '';
      document.getElementById('sort-select').value = 'default';
      renderCategoryFilters();
      applyFilters();
    });
    
    // Mobile filter toggle
    const filterSidebar = document.getElementById('shop-filters');
    const filterOverlay = document.getElementById('filter-overlay');
    const mobileFilterBtn = document.getElementById('mobile-filter-btn');
    
    mobileFilterBtn.addEventListener('click', () => {
      filterSidebar.classList.add('active');
      filterOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
    
    filterOverlay.addEventListener('click', () => {
      filterSidebar.classList.remove('active');
      filterOverlay.classList.remove('active');
      document.body.style.overflow = '';
    });
  };

  /**
   * Load categories from API
   */
  const loadCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const result = await response.json();
      allCategories = result.data || result || [];
      renderCategoryFilters();
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  /**
   * Load products from API
   */
  const loadProducts = async () => {
    try {
      // Check for category filter in URL
      const urlParams = new URLSearchParams(window.location.search);
      const categoryId = urlParams.get('category');
      if (categoryId) {
        filters.category = categoryId;
      }

      const response = await fetch('/api/products');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      allProducts = result.data || result;

      if (!Array.isArray(allProducts)) {
        throw new Error('Server returned invalid data format');
      }

      console.log(`Loaded ${allProducts.length} products`);
      
      // Re-render category filters to show active state from URL
      renderCategoryFilters();
      applyFilters();

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

  // Initialize
  initFilterListeners();
  await loadCategories();
  await loadProducts();
});
