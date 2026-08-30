// @ts-nocheck
import supabase from '../config/supabase.js';

class Category {
  // Get category by ID
  static async getById(categoryId) {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', categoryId)
      .single();

    if (error) throw error;
    return data;
  }

  // Get all categories
  static async getAll() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data;
  }

  // Create category
  static async create(categoryData) {
    const { data, error } = await supabase
      .from('categories')
      .insert([categoryData])
      .select();

    if (error) throw error;
    return data[0];
  }

  // Update category
  static async update(categoryId, updateData) {
    const { data, error } = await supabase
      .from('categories')
      .update(updateData)
      .eq('id', categoryId)
      .select();

    if (error) throw error;
    return data[0];
  }

  // Delete category
  static async delete(categoryId) {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryId);

    if (error) throw error;
    return true;
  }
}

export default Category;

