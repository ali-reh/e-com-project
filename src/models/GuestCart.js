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
   * Add item to cart
   */
  static async addItem(guestId, productId, quantity = 1) {
    // Get existing cart
    let cart = await this.getByGuestId(guestId);
    let cartData = cart?.cart_data || [];

    // Check if product already exists
    const existingIndex = cartData.findIndex(item => item.product_id === productId);

    if (existingIndex >= 0) {
      // Update quantity
      cartData[existingIndex].quantity += quantity;
    } else {
      // Add new item
      cartData.push({
        product_id: productId,
        quantity: quantity,
        added_at: new Date().toISOString()
      });
    }

    return await this.upsert(guestId, cartData);
  }

  /**
   * Update item quantity
   */
  static async updateItemQuantity(guestId, productId, quantity) {
    let cart = await this.getByGuestId(guestId);
    let cartData = cart?.cart_data || [];

    const existingIndex = cartData.findIndex(item => item.product_id === productId);

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
   * Remove item from cart
   */
  static async removeItem(guestId, productId) {
    let cart = await this.getByGuestId(guestId);
    let cartData = cart?.cart_data || [];

    cartData = cartData.filter(item => item.product_id !== productId);

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
  static async getCartWithProducts(guestId) {
    const cart = await this.getByGuestId(guestId);
    
    if (!cart || !cart.cart_data || cart.cart_data.length === 0) {
      return { items: [], total: 0, itemCount: 0 };
    }

    const productIds = cart.cart_data.map(item => item.product_id);

    // Fetch product details
    const { data: products, error } = await supabase
      .from('products')
      .select(`
        id,
        name,
        price,
        product_images (
          image_url,
          is_primary
        )
      `)
      .in('id', productIds);

    if (error) throw error;

    // Map cart items with product details
    const items = cart.cart_data.map(cartItem => {
      const product = products.find(p => p.id === cartItem.product_id);
      if (!product) return null;

      const primaryImage = product.product_images?.find(img => img.is_primary) 
        || product.product_images?.[0];

      return {
        product_id: cartItem.product_id,
        quantity: cartItem.quantity,
        added_at: cartItem.added_at,
        product: {
          id: product.id,
          name: product.name,
          price: product.price,
          image_url: primaryImage?.image_url || null
        },
        subtotal: product.price * cartItem.quantity
      };
    }).filter(Boolean);

    const total = items.reduce((sum, item) => sum + item.subtotal, 0);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return { items, total, itemCount };
  }
}

export default GuestCart;
