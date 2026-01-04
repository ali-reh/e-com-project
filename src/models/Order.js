import supabase from '../config/supabase.js';

class Order {
  // Get order by ID
  static async getById(orderId) {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items(
          *,
          products(*)
        )
      `)
      .eq('id', orderId)
      .single();

    if (error) throw error;
    return data;
  }

  // Get order by order number
  static async getByOrderNumber(orderNumber) {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items(
          *,
          products(*)
        )
      `)
      .eq('order_number', orderNumber)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  }

  // Get all orders with pagination
  static async getAll(limit = 1000, offset = 0, filters = {}) {
    let query = supabase
      .from('orders')
      .select(`
        *,
        order_items(
          *,
          products(*)
        )
      `);

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data;
  }

  // Create new order (no user_id, cash on delivery)
  static async create(orderData) {
    const { data, error } = await supabase
      .from('orders')
      .insert([{
        order_number: `ORD-${Date.now()}`,
        ...orderData
      }])
      .select();

    if (error) throw error;
    return data[0];
  }

  // Add order items
  static async addItems(orderId, items) {
    const itemsWithOrderId = items.map(item => ({
      ...item,
      order_id: orderId
    }));

    const { data, error } = await supabase
      .from('order_items')
      .insert(itemsWithOrderId)
      .select();

    if (error) throw error;
    return data;
  }

  // Update order status
  static async updateStatus(orderId, status) {
    const { data, error } = await supabase
      .from('orders')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select();

    if (error) throw error;
    return data[0];
  }

  // Delete order
  static async delete(orderId) {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', orderId);

    if (error) throw error;
    return true;
  }
}

export default Order;
