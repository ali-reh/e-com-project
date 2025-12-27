import supabase from '../config/supabase.js';

class Cart {
  // Get cart by user ID
  static async getByUserId(userId) {
    const { data, error } = await supabase
      .from('carts')
      .select(`
        *,
        cart_items(
          *,
          products(*)
        )
      `)
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  }

  // Create cart for user
  static async create(userId) {
    const { data, error } = await supabase
      .from('carts')
      .insert([{ user_id: userId }])
      .select();

    if (error) throw error;
    return data[0];
  }

  // Add item to cart
  static async addItem(userId, productId, quantity) {
    let cart = await this.getByUserId(userId);

    if (!cart) {
      cart = await this.create(userId);
    }

    const { data, error } = await supabase
      .from('cart_items')
      .insert([{
        cart_id: cart.id,
        product_id: productId,
        quantity
      }])
      .select();

    if (error) throw error;
    return data[0];
  }

  // Update cart item quantity
  static async updateItem(cartItemId, quantity) {
    const { data, error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', cartItemId)
      .select();

    if (error) throw error;
    return data[0];
  }

  // Remove item from cart
  static async removeItem(cartItemId) {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', cartItemId);

    if (error) throw error;
    return true;
  }

  // Clear cart
  static async clear(cartId) {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('cart_id', cartId);

    if (error) throw error;
    return true;
  }

  // Delete cart
  static async delete(cartId) {
    const { error } = await supabase
      .from('carts')
      .delete()
      .eq('id', cartId);

    if (error) throw error;
    return true;
  }
}

export default Cart;
