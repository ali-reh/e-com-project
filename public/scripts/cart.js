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
        return result.data;
      }
      throw new Error(result.message || 'Failed to get cart');
    } catch (error) {
      console.error('Error getting cart:', error);
      return { items: [], total: 0, itemCount: 0 };
    }
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
  async updateQuantity(productId, quantity) {
    try {
      const response = await fetch(`/api/cart/item/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity })
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
  async removeFromCart(productId) {
    try {
      const response = await fetch(`/api/cart/item/${productId}`, {
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
