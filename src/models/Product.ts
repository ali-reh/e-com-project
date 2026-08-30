// @ts-nocheck
import supabase from '../config/supabase.js';

class Product {
  // Get product by ID with all categories
  static async getById(productId) {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        product_categories(
          categories(*)
        ),
        product_images(*)
      `)
      .eq('id', productId)
      .single();

    if (error) throw error;
    
    // Transform the data structure
    if (data) {
      data.categories = data.product_categories?.map(pc => pc.categories).filter(Boolean) || [];
      delete data.product_categories;
    }
    
    return data;
  }

  // Get all products with pagination
  static async getAll(limit = 1000, offset = 0, filters = {}) {
    let query = supabase
      .from('products')
      .select(`
        *,
        product_categories(
          categories(*)
        ),
        product_images(*)
      `);

    // Filter by category
    if (filters.categoryId) {
      query = query.eq('product_categories.category_id', filters.categoryId);
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
    
    // Transform the data structure
    return data.map(product => ({
      ...product,
      categories: product.product_categories?.map(pc => pc.categories).filter(Boolean) || [],
      product_categories: undefined
    }));
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
  static async getFeatured(limit = 1000) {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        product_categories(
          categories(*)
        ),
        product_images(*)
      `)
      .eq('is_featured', true)
      .eq('is_active', true)
      .limit(limit);

    if (error) throw error;
    
    // Transform the data structure
    return data.map(product => ({
      ...product,
      categories: product.product_categories?.map(pc => pc.categories).filter(Boolean) || [],
      product_categories: undefined
    }));
  }

  // Add category to product
  static async addCategory(productId, categoryId) {
    const { data, error } = await supabase
      .from('product_categories')
      .insert([{ product_id: productId, category_id: categoryId }])
      .select();

    if (error) throw error;
    return data[0];
  }

  // Remove category from product
  static async removeCategory(productId, categoryId) {
    const { error } = await supabase
      .from('product_categories')
      .delete()
      .eq('product_id', productId)
      .eq('category_id', categoryId);

    if (error) throw error;
    return true;
  }

  // Set all categories for a product (replace existing)
  static async setCategories(productId, categoryIds) {
    // Remove existing categories
    await supabase
      .from('product_categories')
      .delete()
      .eq('product_id', productId);

    // Add new categories
    if (categoryIds && categoryIds.length > 0) {
      const { error } = await supabase
        .from('product_categories')
        .insert(
          categoryIds.map(categoryId => ({
            product_id: productId,
            category_id: categoryId
          }))
        );

      if (error) throw error;
    }

    return true;
  }

  // Get available sizes for a product
  static async getSizes(productId) {
    const { data, error } = await supabase
      .from('product_sizes')
      .select(`
        id,
        stock,
        size_id,
        sizes(id, name, display_order)
      `)
      .eq('product_id', productId)
      .order('sizes(display_order)', { ascending: true });

    if (error) throw error;

    // Transform to flat structure
    return (data || []).map(ps => ({
      id: ps.id,
      size_id: ps.size_id,
      name: ps.sizes?.name,
      display_order: ps.sizes?.display_order,
      stock: ps.stock
    })).sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
  }

  // Add size to product with stock
  static async addSize(productId, sizeId, stock = 0) {
    const { data, error } = await supabase
      .from('product_sizes')
      .insert([{ product_id: productId, size_id: sizeId, stock }])
      .select();

    if (error) throw error;
    return data[0];
  }

  // Update size stock
  static async updateSizeStock(productId, sizeId, stock) {
    const { data, error } = await supabase
      .from('product_sizes')
      .update({ stock })
      .eq('product_id', productId)
      .eq('size_id', sizeId)
      .select();

    if (error) throw error;
    return data[0];
  }

  // Remove size from product
  static async removeSize(productId, sizeId) {
    const { error } = await supabase
      .from('product_sizes')
      .delete()
      .eq('product_id', productId)
      .eq('size_id', sizeId);

    if (error) throw error;
    return true;
  }
}

export default Product;
