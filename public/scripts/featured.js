document.addEventListener('DOMContentLoaded', async () => {
  // Matches the <div class="featured-grid"> in your HTML
  const grid = document.querySelector('.featured-grid');
  
  if (!grid) {
    console.error('Could not find .featured-grid in the HTML.');
    return;
  }

  const formatMoney = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value || 0);
  };

  const getProductImage = (product) => {
    // Check if product_images exists and is an array
    if (!product.product_images || !Array.isArray(product.product_images) || product.product_images.length === 0) {
      return 'https://via.placeholder.com/400x400?text=No+Image';
    }
    const primary = product.product_images.find(img => img.is_primary);
    return primary ? primary.image_url : product.product_images[0].image_url;
  };

  const renderFeaturedProducts = (products) => {
    if (!products || products.length === 0) {
      grid.innerHTML = '<p class="text-center w-100 text-secondary">No featured products found.</p>';
      return;
    }

    grid.innerHTML = products
      .map((product) => {
        const imageUrl = getProductImage(product);
        const categoryName = product.categories?.name || 'Collection';
        
        return `
          <article class="product-card" id="product-${product.id}">
            <div class="media-wrap">
              <img src="${imageUrl}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/400x400?text=Error+Loading+Image'">
              <a class="add-cart" href="#" data-id="${product.id}">
                <i class="bi bi-plus"></i>
              </a>
              <a class="product-view-btn" href="pages/product.html?id=${product.id}">
                <i class="bi bi-eye-fill"></i>
              </a>
            </div>
            <div class="product-body">
              <h3 class="product-title">${product.name}</h3>
              <div class="product-meta">${categoryName}</div>
              <div class="price-row">
                <span class="price">${formatMoney(product.price)}</span>
              </div>
            </div>
          </article>
        `;
      })
      .join('');
  };

  const loadFeatured = async () => {
    try {
      // 1. Fetch from the specific featured endpoint you defined in routes
      const response = await fetch('/api/products/featured');
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server Error (${response.status}): ${errorText}`);
      }

      const result = await response.json();
      
      // 2. CRITICAL: Your controller uses successResponse(res, products, ...), 
      // which usually returns { success: true, data: [...], message: "..." }
      const products = result.data || result;

      if (!Array.isArray(products)) {
        console.error('API did not return an array. Received:', result);
        throw new Error('Invalid data format received from server.');
      }
      
      renderFeaturedProducts(products);

    } catch (error) {
      // This will show you the real problem in the Browser Console
      console.error('Detailed Load Error:', error);
      grid.innerHTML = `
        <div class="text-center w-100">
          <p class="text-danger">Unable to load featured items.</p>
          <small class="text-secondary">Check console for details: ${error.message}</small>
        </div>
      `;
    }
  };

  loadFeatured();
});