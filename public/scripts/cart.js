/**
 * Cart Service
 * Handles all cart operations with the API
 */

const CartService = {
  /**
   * Get cart contents
   */
  async getCart() {
    try {
      const response = await fetch('/api/cart');
      const result = await response.json();
      if (result.success) {
        this.updateCartBadge(result.data.itemCount);
        
        // Check if any items were removed due to being out of stock
        if (result.data.removedItems && result.data.removedItems.length > 0) {
          this.showRemovedItemsPopup(result.data.removedItems);
        }
        
        return result.data;
      }
      throw new Error(result.message || 'Failed to get cart');
    } catch (error) {
      console.error('Error getting cart:', error);
      return { items: [], total: 0, itemCount: 0, removedItems: [] };
    }
  },

  /**
   * Show apology popup for removed items (out of stock)
   */
  showRemovedItemsPopup(removedItems) {
    // Remove existing popup if any
    const existing = document.querySelector('.removed-items-popup-overlay');
    if (existing) existing.remove();

    const itemNames = removedItems.map(item => item.name).join(', ');
    const itemCount = removedItems.length;
    const itemWord = itemCount === 1 ? 'item' : 'items';

    const popupHTML = `
      <div class="removed-items-popup-overlay">
        <div class="removed-items-popup">
          <div class="removed-items-popup-icon">
            <i class="bi bi-exclamation-circle"></i>
          </div>
          <h3>We're Sorry!</h3>
          <p>The following ${itemWord} ${itemCount === 1 ? 'is' : 'are'} no longer available and ${itemCount === 1 ? 'has' : 'have'} been removed from your cart:</p>
          <div class="removed-items-list">
            ${removedItems.map(item => `<span class="removed-item-name">${item.name}</span>`).join('')}
          </div>
          <button class="removed-items-popup-close">OK, I Understand</button>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', popupHTML);

    // Add popup styles if not already present
    if (!document.getElementById('removed-items-popup-styles')) {
      const styles = document.createElement('style');
      styles.id = 'removed-items-popup-styles';
      styles.textContent = `
        .removed-items-popup-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          animation: fadeIn 0.3s ease;
        }
        .removed-items-popup {
          background: white;
          padding: 2rem;
          border-radius: 12px;
          max-width: 400px;
          width: 90%;
          text-align: center;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          animation: slideUp 0.3s ease;
        }
        .removed-items-popup-icon {
          font-size: 3rem;
          color: #dc3545;
          margin-bottom: 1rem;
        }
        .removed-items-popup h3 {
          margin: 0 0 0.5rem;
          color: #333;
        }
        .removed-items-popup p {
          color: #666;
          margin-bottom: 1rem;
          font-size: 0.95rem;
        }
        .removed-items-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          justify-content: center;
          margin-bottom: 1.5rem;
        }
        .removed-item-name {
          background: #f8d7da;
          color: #721c24;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.85rem;
        }
        .removed-items-popup-close {
          background: #333;
          color: white;
          border: none;
          padding: 0.75rem 2rem;
          border-radius: 6px;
          cursor: pointer;
          font-size: 1rem;
          transition: background 0.2s;
        }
        .removed-items-popup-close:hover {
          background: #555;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `;
      document.head.appendChild(styles);
    }

    // Close popup on button click
    const popup = document.querySelector('.removed-items-popup-overlay');
    popup.querySelector('.removed-items-popup-close').addEventListener('click', () => {
      popup.remove();
    });

    // Close on overlay click
    popup.addEventListener('click', (e) => {
      if (e.target === popup) {
        popup.remove();
      }
    });
  },

  /**
   * Add item to cart (optimistic UI)
   */
  async addToCart(productId, quantity = 1, size = null) {
    // Optimistic: Show success immediately
    this.showNotification('Added to cart!');
    
    // Optimistic: Increment badge immediately
    const badge = document.getElementById('cart-badge');
    const currentCount = badge ? parseInt(badge.textContent) || 0 : 0;
    this.updateCartBadge(currentCount + quantity);

    // Build request body
    const body = { product_id: productId, quantity };
    if (size && size.id) {
      body.size_id = size.id;
      body.size_name = size.name;
    }

    // Send request in background
    try {
      const response = await fetch('/api/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const result = await response.json();
      if (result.success) {
        // Sync with actual server count
        this.updateCartBadge(result.data.itemCount);
        return result.data;
      }
      throw new Error(result.message || 'Failed to add to cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
      // Revert badge on failure
      this.updateCartBadge(currentCount);
      this.showNotification('Failed to add to cart', 'error');
      return null;
    }
  },

  /**
   * Update item quantity
   */
  async updateQuantity(productId, quantity, sizeId = null) {
    try {
      const response = await fetch(`/api/cart/item/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity, size_id: sizeId })
      });
      const result = await response.json();
      if (result.success) {
        this.updateCartBadge(result.data.itemCount);
        return result.data;
      }
      throw new Error(result.message || 'Failed to update cart');
    } catch (error) {
      console.error('Error updating cart:', error);
      return null;
    }
  },

  /**
   * Remove item from cart
   */
  async removeFromCart(productId, sizeId = null) {
    try {
      let url = `/api/cart/item/${productId}`;
      if (sizeId) {
        url += `?size_id=${sizeId}`;
      }
      const response = await fetch(url, {
        method: 'DELETE'
      });
      const result = await response.json();
      if (result.success) {
        this.updateCartBadge(result.data.itemCount);
        this.showNotification('Item removed');
        return result.data;
      }
      throw new Error(result.message || 'Failed to remove item');
    } catch (error) {
      console.error('Error removing from cart:', error);
      return null;
    }
  },

  /**
   * Clear cart
   */
  async clearCart() {
    try {
      const response = await fetch('/api/cart/clear', { method: 'DELETE' });
      const result = await response.json();
      if (result.success) {
        this.updateCartBadge(0);
        return result.data;
      }
      throw new Error(result.message || 'Failed to clear cart');
    } catch (error) {
      console.error('Error clearing cart:', error);
      return null;
    }
  },

  /**
   * Get cart count
   */
  async getCartCount() {
    try {
      const response = await fetch('/api/cart/count');
      const result = await response.json();
      if (result.success) {
        this.updateCartBadge(result.data.count);
        return result.data.count;
      }
      return 0;
    } catch (error) {
      console.error('Error getting cart count:', error);
      return 0;
    }
  },

  /**
   * Update cart badge in header
   */
  updateCartBadge(count) {
    const badge = document.getElementById('cart-badge');
    if (badge) {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    }
  },

  /**
   * Show notification toast
   */
  showNotification(message, type = 'success') {
    // Remove existing notification
    const existing = document.querySelector('.cart-notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = `cart-notification ${type}`;
    notification.innerHTML = `
      <i class="bi ${type === 'success' ? 'bi-check-circle' : 'bi-exclamation-circle'}"></i>
      <span>${message}</span>
    `;
    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => notification.classList.add('show'), 10);

    // Remove after delay
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 2500);
  },

  /**
   * Format price
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

// Initialize cart badge on page load
document.addEventListener('DOMContentLoaded', () => {
  // Delay to allow header to load
  setTimeout(() => {
    CartService.getCartCount();
  }, 500);
});

// Make available globally
window.CartService = CartService;
