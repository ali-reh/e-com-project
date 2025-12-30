/**
 * Product Detail Script
 * Fetches and displays individual product details from the API
 */

document.addEventListener('DOMContentLoaded', async () => {
  /**
   * Get product ID from URL query parameter
   */
  const getProductIdFromUrl = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
  };

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
   * Sort images by display_order and is_primary
   */
  const sortImages = (images) => {
    if (!images || images.length === 0) return [];
    
    return [...images].sort((a, b) => {
      // Primary image comes first
      if (a.is_primary && !b.is_primary) return -1;
      if (!a.is_primary && b.is_primary) return 1;
      // Then sort by display_order
      return (a.display_order || 0) - (b.display_order || 0);
    });
  };

  /**
   * Render product images gallery
   */
  const renderImageGallery = (images) => {
    const galleryMain = document.querySelector('.gallery-main');
    const galleryThumbs = document.querySelector('.gallery-thumbs');

    if (!images || images.length === 0) {
      // No images available
      galleryMain.innerHTML = `
        <img src="https://via.placeholder.com/600x600?text=No+Image" alt="No image available" id="mainImage">
      `;
      galleryThumbs.innerHTML = '';
      return;
    }

    const sortedImages = sortImages(images);
    const primaryImage = sortedImages[0];

    // Set main image
    galleryMain.innerHTML = `
      <img src="${primaryImage.image_url}" alt="${primaryImage.alt_text || 'Product image'}" id="mainImage">
    `;

    // Set thumbnail images
    if (sortedImages.length > 1) {
      galleryThumbs.innerHTML = sortedImages
        .map((img, index) => `
          <img 
            src="${img.image_url}" 
            alt="${img.alt_text || `View ${index + 1}`}" 
            class="thumb ${index === 0 ? 'active' : ''}" 
            data-image-url="${img.image_url}"
          >
        `)
        .join('');

      // Attach click handlers to thumbnails
      attachThumbnailListeners();
    } else {
      galleryThumbs.innerHTML = '';
    }
  };

  /**
   * Attach click listeners to thumbnail images
   */
  const attachThumbnailListeners = () => {
    const thumbs = document.querySelectorAll('.gallery-thumbs .thumb');
    
    thumbs.forEach(thumb => {
      thumb.addEventListener('click', function() {
        const imageUrl = this.dataset.imageUrl;
        const mainImage = document.getElementById('mainImage');
        
        if (mainImage && imageUrl) {
          mainImage.src = imageUrl;
          
          // Update active state
          thumbs.forEach(t => t.classList.remove('active'));
          this.classList.add('active');
        }
      });
    });
  };

  /**
   * Render product information
   */
  const renderProductInfo = (product) => {
    // Update page title
    document.title = `${product.name} - Product Details`;

    // Update breadcrumb
    const breadcrumbCurrent = document.querySelector('.breadcrumb-nav .current');
    if (breadcrumbCurrent) {
      breadcrumbCurrent.textContent = product.name;
    }

    // Update product name
    const productName = document.querySelector('.product-name');
    if (productName) {
      productName.textContent = product.name;
    }

    // Update product price
    const currentPrice = document.querySelector('.current-price');
    if (currentPrice) {
      currentPrice.textContent = formatMoney(product.price);
    }

    // Update product description
    const productDescription = document.querySelector('.product-description p');
    if (productDescription) {
      productDescription.textContent = product.description || 'No description available.';
    }

    // Update categories in breadcrumb (optional)
    if (product.categories && product.categories.length > 0) {
      const categoryNames = product.categories.map(cat => cat.name).join(', ');
      const shopLink = document.querySelector('.breadcrumb-nav a[href="#shop"]');
      if (shopLink) {
        shopLink.textContent = categoryNames;
      }
    }
  };

  /**
   * Show loading state
   */
  const showLoading = () => {
    const productMain = document.querySelector('.product-main');
    if (productMain) {
      productMain.innerHTML = `
        <div class="col-12 text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="text-secondary mt-3">Loading product details...</p>
        </div>
      `;
    }
  };

  /**
   * Show error state
   */
  const showError = (message) => {
    const productMain = document.querySelector('.product-main');
    if (productMain) {
      productMain.innerHTML = `
        <div class="col-12 text-center py-5">
          <i class="bi bi-exclamation-triangle text-warning" style="font-size: 3rem;"></i>
          <p class="text-danger mt-3 mb-2">Unable to load product details</p>
          <small class="text-secondary">${message}</small>
          <br>
          <a href="/" class="btn btn-sm btn-outline-primary mt-3">
            <i class="bi bi-house"></i> Go to Home
          </a>
        </div>
      `;
    }
  };

  /**
   * Load product data from API
   */
  const loadProduct = async (productId) => {
    try {
      showLoading();

      const response = await fetch(`/api/products/${productId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Product not found');
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Handle response from successResponse wrapper
      const product = result.data || result;

      if (!product || !product.id) {
        throw new Error('Invalid product data received');
      }

      console.log('Product loaded:', product);

      // Restore the product main HTML structure first
      const productMain = document.querySelector('.product-main');
      productMain.innerHTML = `
        <!-- Image Gallery -->
        <div class="product-gallery">
          <div class="gallery-main"></div>
          <div class="gallery-thumbs"></div>
        </div>

        <!-- Product Info -->
        <div class="product-info">
          <div class="product-header">
            <h1 class="product-name"></h1>
          </div>

          <div class="product-price-section">
            <div class="price-group">
              <span class="current-price"></span>
            </div>
          </div>

          <div class="product-description">
            <p></p>
          </div>

          <div class="product-actions">
            <div class="quantity-selector">
              <button class="qty-btn" id="decreaseQty">−</button>
              <input type="number" id="quantity" value="1" min="1" readonly>
              <button class="qty-btn" id="increaseQty">+</button>
            </div>
            <button class="btn-add-to-cart primary-color-btn">
              <i class="bi bi-bag-plus"></i> Add to Cart
            </button>
          </div>

          <div class="product-features">
            <div class="feature">
              <i class="bi bi-truck"></i>
              <div>
                <span class="feature-title">Free Shipping</span>
                <span class="feature-text">On orders over $100</span>
              </div>
            </div>
            <div class="feature">
              <i class="bi bi-arrow-counterclockwise"></i>
              <div>
                <span class="feature-title">Easy Returns</span>
                <span class="feature-text">30-day return policy</span>
              </div>
            </div>
            <div class="feature">
              <i class="bi bi-shield-check"></i>
              <div>
                <span class="feature-title">Secure Payment</span>
                <span class="feature-text">100% protected checkout</span>
              </div>
            </div>
          </div>
        </div>
      `;

      // Render product data
      renderProductInfo(product);
      renderImageGallery(product.product_images);

      // Attach event listeners after rendering
      attachProductListeners(product);

    } catch (error) {
      console.error('Error loading product:', error);
      showError(error.message);
    }
  };

  /**
   * Attach event listeners to product actions
   */
  const attachProductListeners = (product) => {
    // Quantity controls
    const increaseBtn = document.getElementById('increaseQty');
    const decreaseBtn = document.getElementById('decreaseQty');
    const quantityInput = document.getElementById('quantity');

    if (increaseBtn) {
      increaseBtn.addEventListener('click', () => {
        quantityInput.value = parseInt(quantityInput.value) + 1;
      });
    }

    if (decreaseBtn) {
      decreaseBtn.addEventListener('click', () => {
        if (parseInt(quantityInput.value) > 1) {
          quantityInput.value = parseInt(quantityInput.value) - 1;
        }
      });
    }

    // Add to cart button
    const addToCartBtn = document.querySelector('.btn-add-to-cart');
    if (addToCartBtn) {
      addToCartBtn.addEventListener('click', () => {
        const quantity = parseInt(quantityInput.value);
        handleAddToCart(product, quantity);
      });
    }
  };

  /**
   * Handle add to cart action
   */
  const handleAddToCart = (product, quantity) => {
    // TODO: Implement your cart logic here
    console.log('Add to cart:', {
      productId: product.id,
      productName: product.name,
      price: product.price,
      quantity: quantity
    });

    // Example: Show alert
    alert(`Added ${quantity} × ${product.name} to cart!`);

    // Example: Save to localStorage
    // const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    // const existingItem = cart.find(item => item.productId === product.id);
    // if (existingItem) {
    //   existingItem.quantity += quantity;
    // } else {
    //   cart.push({
    //     productId: product.id,
    //     productName: product.name,
    //     price: product.price,
    //     quantity: quantity,
    //     image: product.product_images?.[0]?.image_url
    //   });
    // }
    // localStorage.setItem('cart', JSON.stringify(cart));
  };

  // Initialize: Get product ID and load product
  const productId = getProductIdFromUrl();

  if (!productId) {
    showError('No product ID specified in URL');
    return;
  }

  loadProduct(productId);
});