/**
 * Add to Cart Modal
 * Shows size and quantity selection before adding to cart
 */

const CartModal = {
  modal: null,
  currentProduct: null,
  selectedSize: null,
  quantity: 1,
  sizes: [],

  /**
   * Initialize the modal (create DOM element)
   */
  init() {
    if (this.modal) return;

    const modalHTML = `
      <div class="cart-modal-overlay" id="cart-modal-overlay">
        <div class="cart-modal">
          <div class="cart-modal-header">
            <h3>Add to Cart</h3>
            <button class="cart-modal-close" id="cart-modal-close">
              <i class="bi bi-x"></i>
            </button>
          </div>
          <div class="cart-modal-body">
            <div class="cart-modal-product">
              <img src="" alt="" id="cart-modal-image">
              <div class="cart-modal-product-info">
                <p class="cart-modal-product-category" id="cart-modal-category"></p>
                <h4 class="cart-modal-product-name" id="cart-modal-name"></h4>
                <p class="cart-modal-product-price" id="cart-modal-price"></p>
              </div>
            </div>
            
            <div class="cart-modal-section" id="cart-modal-size-section">
              <p class="cart-modal-section-title">Select Size</p>
              <div class="size-options" id="cart-modal-sizes">
                <!-- Sizes populated dynamically -->
              </div>
            </div>
            
            <div class="cart-modal-section">
              <p class="cart-modal-section-title">Quantity</p>
              <div class="cart-modal-quantity">
                <button class="cart-modal-qty-btn" id="cart-modal-qty-decrease">−</button>
                <input type="number" class="cart-modal-qty-input" id="cart-modal-qty-input" value="1" min="1" readonly>
                <button class="cart-modal-qty-btn" id="cart-modal-qty-increase">+</button>
                <span class="stock-info" id="cart-modal-stock"></span>
              </div>
            </div>
          </div>
          <div class="cart-modal-footer">
            <button class="cart-modal-btn cart-modal-btn-cancel" id="cart-modal-cancel">Cancel</button>
            <button class="cart-modal-btn cart-modal-btn-add" id="cart-modal-add">
              <i class="bi bi-bag-plus"></i> Add to Cart
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    this.modal = document.getElementById('cart-modal-overlay');
    this.attachListeners();
  },

  /**
   * Attach event listeners
   */
  attachListeners() {
    // Close buttons
    document.getElementById('cart-modal-close').addEventListener('click', () => this.close());
    document.getElementById('cart-modal-cancel').addEventListener('click', () => this.close());
    
    // Close on overlay click
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) this.close();
    });

    // Quantity buttons
    document.getElementById('cart-modal-qty-decrease').addEventListener('click', () => {
      if (this.quantity > 1) {
        this.quantity--;
        this.updateQuantityDisplay();
      }
    });

    document.getElementById('cart-modal-qty-increase').addEventListener('click', () => {
      const maxStock = this.getSelectedSizeStock();
      if (maxStock === null || this.quantity < maxStock) {
        this.quantity++;
        this.updateQuantityDisplay();
      }
    });

    // Add to cart button
    document.getElementById('cart-modal-add').addEventListener('click', () => this.addToCart());

    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal.classList.contains('active')) {
        this.close();
      }
    });
  },

  /**
   * Open modal with product data
   */
  async open(productId) {
    this.init();
    this.quantity = 1;
    this.selectedSize = null;

    try {
      // Fetch product details
      const response = await fetch(`/api/products/${productId}`);
      const result = await response.json();
      
      if (!result.success || !result.data) {
        throw new Error('Product not found');
      }

      this.currentProduct = result.data;
      
      // Fetch sizes for this product
      await this.fetchProductSizes(productId);
      
      // Populate modal
      this.populateModal();
      
      // Show modal
      this.modal.classList.add('active');
      document.body.style.overflow = 'hidden';

    } catch (error) {
      console.error('Error loading product:', error);
      if (typeof CartService !== 'undefined') {
        CartService.showNotification('Failed to load product', 'error');
      }
    }
  },

  /**
   * Fetch available sizes for product
   */
  async fetchProductSizes(productId) {
    try {
      const response = await fetch(`/api/products/${productId}/sizes`);
      const result = await response.json();
      this.sizes = result.success ? result.data : [];
    } catch (error) {
      console.error('Error fetching sizes:', error);
      this.sizes = [];
    }
  },

  /**
   * Populate modal with product data
   */
  populateModal() {
    const product = this.currentProduct;
    
    // Image
    const imageUrl = this.getPrimaryImage(product.product_images);
    document.getElementById('cart-modal-image').src = imageUrl;
    document.getElementById('cart-modal-image').alt = product.name;

    // Category
    const category = this.getCategoryNames(product.categories);
    document.getElementById('cart-modal-category').textContent = category;

    // Name
    document.getElementById('cart-modal-name').textContent = product.name;

    // Price
    document.getElementById('cart-modal-price').textContent = this.formatMoney(product.price);

    // Sizes
    this.renderSizes();

    // Reset quantity
    this.updateQuantityDisplay();
    this.updateAddButton();
  },

  /**
   * Render size options
   */
  renderSizes() {
    const container = document.getElementById('cart-modal-sizes');
    const section = document.getElementById('cart-modal-size-section');

    if (this.sizes.length === 0) {
      // No sizes available - hide section or show message
      section.innerHTML = `
        <p class="cart-modal-section-title">Size</p>
        <p class="no-sizes-message">One size fits all</p>
      `;
      this.selectedSize = 'one-size';
      return;
    }

    container.innerHTML = this.sizes.map(size => {
      const inStock = size.stock > 0;
      return `
        <button class="size-option ${!inStock ? 'out-of-stock' : ''}" 
                data-size-id="${size.size_id}"
                data-size-name="${size.name}"
                data-stock="${size.stock}"
                ${!inStock ? 'disabled' : ''}>
          ${size.name}
        </button>
      `;
    }).join('');

    // Attach size selection listeners
    container.querySelectorAll('.size-option:not(.out-of-stock)').forEach(btn => {
      btn.addEventListener('click', () => {
        // Remove active from all
        container.querySelectorAll('.size-option').forEach(b => b.classList.remove('active'));
        // Add active to clicked
        btn.classList.add('active');
        
        this.selectedSize = {
          id: btn.dataset.sizeId,
          name: btn.dataset.sizeName,
          stock: parseInt(btn.dataset.stock)
        };
        
        // Reset quantity if exceeds stock
        if (this.quantity > this.selectedSize.stock) {
          this.quantity = this.selectedSize.stock;
        }
        
        this.updateQuantityDisplay();
        this.updateAddButton();
      });
    });
  },

  /**
   * Get stock of selected size
   */
  getSelectedSizeStock() {
    if (this.selectedSize === 'one-size') return 999;
    if (!this.selectedSize) return null;
    return this.selectedSize.stock;
  },

  /**
   * Update quantity display
   */
  updateQuantityDisplay() {
    document.getElementById('cart-modal-qty-input').value = this.quantity;
    
    const stockInfo = document.getElementById('cart-modal-stock');
    const maxStock = this.getSelectedSizeStock();
    
    if (maxStock !== null && maxStock !== 999) {
      if (maxStock <= 3) {
        stockInfo.textContent = `Only ${maxStock} left`;
        stockInfo.className = 'stock-info low-stock';
      } else {
        stockInfo.textContent = `${maxStock} in stock`;
        stockInfo.className = 'stock-info';
      }
    } else {
      stockInfo.textContent = '';
    }
  },

  /**
   * Update add button state
   */
  updateAddButton() {
    const addBtn = document.getElementById('cart-modal-add');
    const needsSize = this.sizes.length > 0;
    const hasSize = this.selectedSize !== null;
    
    if (needsSize && !hasSize) {
      addBtn.disabled = true;
      addBtn.innerHTML = '<i class="bi bi-bag-plus"></i> Select a Size';
    } else {
      addBtn.disabled = false;
      addBtn.innerHTML = '<i class="bi bi-bag-plus"></i> Add to Cart';
    }
  },

  /**
   * Add to cart
   */
  async addToCart() {
    if (!this.currentProduct) return;

    const needsSize = this.sizes.length > 0;
    if (needsSize && !this.selectedSize) {
      CartService.showNotification('Please select a size', 'error');
      return;
    }

    // Build cart item data
    const cartData = {
      product_id: this.currentProduct.id,
      quantity: this.quantity
    };

    // Add size info if applicable
    if (this.selectedSize && this.selectedSize !== 'one-size') {
      cartData.size_id = this.selectedSize.id;
      cartData.size_name = this.selectedSize.name;
    }

    // Use CartService to add
    if (typeof CartService !== 'undefined') {
      await CartService.addToCart(
        this.currentProduct.id, 
        this.quantity,
        this.selectedSize !== 'one-size' ? this.selectedSize : null
      );
    }

    this.close();
  },

  /**
   * Close modal
   */
  close() {
    if (this.modal) {
      this.modal.classList.remove('active');
      document.body.style.overflow = '';
    }
    this.currentProduct = null;
    this.selectedSize = null;
    this.quantity = 1;
    this.sizes = [];
  },

  /**
   * Helper: Get primary image
   */
  getPrimaryImage(images) {
    if (!images || !Array.isArray(images) || images.length === 0) {
      return 'https://via.placeholder.com/400x500?text=No+Image';
    }
    const primary = images.find(img => img.is_primary);
    return primary ? primary.image_url : images[0].image_url;
  },

  /**
   * Helper: Get category names
   */
  getCategoryNames(categories) {
    if (!categories || !Array.isArray(categories) || categories.length === 0) {
      return 'Uncategorized';
    }
    return categories.map(cat => cat.name).join(' • ');
  },

  /**
   * Helper: Format money
   */
  formatMoney(value) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value || 0);
  }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  CartModal.init();
});

// Make available globally
window.CartModal = CartModal;
