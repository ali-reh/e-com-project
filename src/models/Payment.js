import supabase from '../config/supabase.js';

class Payment {
  // Get payment by ID
  static async getById(paymentId) {
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        orders(*)
      `)
      .eq('id', paymentId)
      .single();

    if (error) throw error;
    return data;
  }

  // Get payment by order ID
  static async getByOrderId(orderId) {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  }

  // Create payment
  static async create(paymentData) {
    const { data, error } = await supabase
      .from('payments')
      .insert([paymentData])
      .select();

    if (error) throw error;
    return data[0];
  }

  // Update payment
  static async update(paymentId, updateData) {
    const { data, error } = await supabase
      .from('payments')
      .update(updateData)
      .eq('id', paymentId)
      .select();

    if (error) throw error;
    return data[0];
  }

  // Update payment status
  static async updateStatus(paymentId, status) {
    const { data, error } = await supabase
      .from('payments')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', paymentId)
      .select();

    if (error) throw error;
    return data[0];
  }

  // Get payments by user ID
  static async getByUserId(userId, limit = 20, offset = 0) {
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        orders(*)
      `)
      .eq('orders.user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data;
  }

  // Delete payment (soft delete)
  static async delete(paymentId) {
    const { error } = await supabase
      .from('payments')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', paymentId);

    if (error) throw error;
    return true;
  }
}

export default Payment;
