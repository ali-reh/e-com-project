import supabase from '../config/supabase.js';

class Product {
  // Get product by ID
  static async getById(productId) {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories(*),
        product_images(*)
      `)
      .eq('id', productId)
      .single();

    if (error) throw error;
    return data;
  }

  // Get all products with pagination
  static async getAll(limit = 20, offset = 0, filters = {}) {
    let query = supabase
      .from('products')
      .select(`
        *,
        categories(*),
        product_images(*)
      `);

    if (filters.categoryId) {
      query = query.eq('category_id', filters.categoryId);
    }

    if (filters.minPrice || filters.maxPrice) {
      if (filters.minPrice) query = query.gte('price', filters.minPrice);
      if (filters.maxPrice) query = query.lte('price', filters.maxPrice);
    }

    if (filters.search) {
      query = query.ilike('name', `%${filters.search}%`);
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data;
  }

  // Create new product
  static async create(productData) {
    const { data, error } = await supabase
      .from('products')
      .insert([productData])
      .select();

    if (error) throw error;
    return data[0];
  }

  // Update product
  static async update(productId, updateData) {
    const { data, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', productId)
      .select();

    if (error) throw error;
    return data[0];
  }

  // Delete product
  static async delete(productId) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (error) throw error;
    return true;
  }

  // Get featured products
  static async getFeatured(limit = 10) {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories(*),
        product_images(*)
      `)
      .eq('is_featured', true)
      .eq('is_active', true)
      .limit(limit);

    if (error) throw error;
    return data;
  }
}

export default Product;
