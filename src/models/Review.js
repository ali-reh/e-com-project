import supabase from '../config/supabase.js';

class Review {
  // Get review by ID
  static async getById(reviewId) {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        users(id, name, email),
        products(id, name)
      `)
      .eq('id', reviewId)
      .single();

    if (error) throw error;
    return data;
  }

  // Get reviews by product ID
  static async getByProductId(productId, limit = 20, offset = 0) {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        users(id, name, email)
      `)
      .eq('product_id', productId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data;
  }

  // Get reviews by user ID
  static async getByUserId(userId, limit = 20, offset = 0) {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        products(id, name)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data;
  }

  // Create review
  static async create(reviewData) {
    const { data, error } = await supabase
      .from('reviews')
      .insert([reviewData])
      .select();

    if (error) throw error;
    return data[0];
  }

  // Update review
  static async update(reviewId, updateData) {
    const { data, error } = await supabase
      .from('reviews')
      .update(updateData)
      .eq('id', reviewId)
      .select();

    if (error) throw error;
    return data[0];
  }

  // Delete review
  static async delete(reviewId) {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId);

    if (error) throw error;
    return true;
  }

  // Get average rating for product
  static async getAverageRating(productId) {
    const { data, error } = await supabase
      .rpc('get_average_rating', { product_id: productId });

    if (error) throw error;
    return data;
  }
}

export default Review;
