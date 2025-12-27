import supabase from '../config/supabase.js';

class User {
  // Get user by ID
  static async getById(userId) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  }

  // Get user by email
  static async getByEmail(email) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) throw error;
    return data;
  }

  // Create new user
  static async create(userData) {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select();

    if (error) throw error;
    return data[0];
  }

  // Update user
  static async update(userId, updateData) {
    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select();

    if (error) throw error;
    return data[0];
  }

  // Delete user
  static async delete(userId) {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) throw error;
    return true;
  }

  // Get all users (admin only)
  static async getAll(limit = 10, offset = 0) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data;
  }
}

export default User;
