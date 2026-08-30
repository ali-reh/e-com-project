// @ts-nocheck
import supabase from '../config/supabase.js';

class GuestCart {
  /**
   * Get cart by guest ID
   */
  static async getByGuestId(guestId) {
    const { data, error } = await supabase
      .from('guest_carts')
      .select('*')
      .eq('guest_id', guestId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data;
  }

  /**
   * Create or update cart
   */
  static async upsert(guestId, cartData) {
    const { data, error } = await supabase
      .from('guest_carts')
      .upsert(
        { 
          guest_id: guestId, 
          cart_data: cartData,
          updated_at: new Date().toISOString()
        },
        { 
          onConflict: 'guest_id',
          ignoreDuplicates: false 
        }
      )
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Add item to cart (with optional size)
   */
  static async addItem(guestId, productId, quantity = 1, sizeId = null, sizeName = null) {
    // Get existing cart
    let cart = await this.getByGuestId(guestId);
    let cartData = cart?.cart_data || [];

    // Check if product+size combination already exists
    const existingIndex = cartData.findIndex(item => 
      item.product_id === productId && 
      (item.size_id || null) === sizeId
    );

    if (existingIndex >= 0) {
      // Update quantity
      cartData[existingIndex].quantity += quantity;
    } else {
      // Add new item
      const newItem = {
        product_id: productId,
        quantity: quantity,
        added_at: new Date().toISOString()
      };
      if (sizeId) {
        newItem.size_id = sizeId;
        newItem.size_name = sizeName;
      }
      cartData.push(newItem);
    }

    return await this.upsert(guestId, cartData);
  }

  /**
   * Update item quantity (with optional size)
   */
  static async updateItemQuantity(guestId, productId, quantity, sizeId = null) {
    let cart = await this.getByGuestId(guestId);
    let cartData = cart?.cart_data || [];

    const existingIndex = cartData.findIndex(item => 
      item.product_id === productId && 
      (item.size_id || null) === sizeId
    );

    if (existingIndex >= 0) {
      if (quantity <= 0) {
        // Remove item if quantity is 0 or less
        cartData.splice(existingIndex, 1);
      } else {
        cartData[existingIndex].quantity = quantity;
      }
    }

    return await this.upsert(guestId, cartData);
  }

  /**
   * Remove item from cart (with optional size)
   */
  static async removeItem(guestId, productId, sizeId = null) {
    let cart = await this.getByGuestId(guestId);
    let cartData = cart?.cart_data || [];

    cartData = cartData.filter(item => 
      !(item.product_id === productId && (item.size_id || null) === sizeId)
    );

    return await this.upsert(guestId, cartData);
  }

  /**
   * Clear cart
   */
  static async clear(guestId) {
    return await this.upsert(guestId, []);
  }

  /**
   * Get cart with product details
   */
  static async getCartWithProducts(guestId, removeInactive = false) {
    const cart = await this.getByGuestId(guestId);
    
    if (!cart || !cart.cart_data || cart.cart_data.length === 0) {
      return { items: [], total: 0, itemCount: 0, removedItems: [] };
    }

    const productIds = [...new Set(cart.cart_data.map(item => item.product_id))];

    // Fetch product details including is_active status and sizes
    const { data: products, error } = await supabase
      .from('products')
      .select(`
        id,
        name,
        price,
        is_active,
        product_images (
          image_url,
          is_primary
        ),
        product_sizes (
          size_id,
          stock,
          sizes (
            id,
            name
          )
        )
      `)
      .in('id', productIds);

    if (error) throw error;

    // Track removed items (inactive products)
    const removedItems = [];
    const activeCartData = [];

    // Map cart items with product details
    const items = cart.cart_data.map(cartItem => {
      const product = products.find(p => p.id === cartItem.product_id);
      if (!product) return null;

      // Check if product is inactive (out of stock)
      if (!product.is_active) {
        const displayName = cartItem.size_name 
          ? `${product.name} - ${cartItem.size_name}` 
          : product.name;
        removedItems.push({
          product_id: cartItem.product_id,
          size_id: cartItem.size_id || null,
          name: displayName
        });
        return null;
      }

      // Get stock for this size (if applicable)
      let maxStock = 999; // Default high value for no size limit
      if (cartItem.size_id && product.product_sizes) {
        const sizeInfo = product.product_sizes.find(ps => ps.size_id === cartItem.size_id);
        if (sizeInfo) {
          maxStock = sizeInfo.stock || 0;
        }
      }

      // Keep track of active items for cart update
      activeCartData.push(cartItem);

      const primaryImage = product.product_images?.find(img => img.is_primary) 
        || product.product_images?.[0];

      // Build display name with size
      const displayName = cartItem.size_name 
        ? `${product.name} - ${cartItem.size_name}` 
        : product.name;

      return {
        product_id: cartItem.product_id,
        size_id: cartItem.size_id || null,
        size_name: cartItem.size_name || null,
        quantity: cartItem.quantity,
        max_quantity: maxStock,
        added_at: cartItem.added_at,
        product: {
          id: product.id,
          name: product.name,
          display_name: displayName,
          price: product.price,
          image_url: primaryImage?.image_url || null
        },
        subtotal: product.price * cartItem.quantity
      };
    }).filter(Boolean);

    // Remove inactive items from cart if requested
    if (removeInactive && removedItems.length > 0) {
      await this.upsert(guestId, activeCartData);
    }

    const total = items.reduce((sum, item) => sum + item.subtotal, 0);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return { items, total, itemCount, removedItems };
  }
}

export default GuestCart;

