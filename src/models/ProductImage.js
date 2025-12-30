import supabase from '../config/supabase.js';

class ProductImage {
  // Get all images for a product
  static async getByProductId(productId) {
    const { data, error } = await supabase
      .from('product_images')
      .select('*')
      .eq('product_id', productId)
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data;
  }

  // Get single image by ID
  static async getById(imageId) {
    const { data, error } = await supabase
      .from('product_images')
      .select('*')
      .eq('id', imageId)
      .single();

    if (error) throw error;
    return data;
  }

  // Add image to product
  static async create(imageData) {
    const { data, error } = await supabase
      .from('product_images')
      .insert([imageData])
      .select();

    if (error) throw error;
    return data[0];
  }

  // Update image
  static async update(imageId, updateData) {
    const { data, error } = await supabase
      .from('product_images')
      .update(updateData)
      .eq('id', imageId)
      .select();

    if (error) throw error;
    return data[0];
  }

  // Delete image
  static async delete(imageId) {
    const { error } = await supabase
      .from('product_images')
      .delete()
      .eq('id', imageId);

    if (error) throw error;
    return true;
  }

  // Set primary image
  static async setPrimary(imageId, productId) {
    // First, unset all primary images for this product
    await supabase
      .from('product_images')
      .update({ is_primary: false })
      .eq('product_id', productId);

    // Then set the new primary image
    const { data, error } = await supabase
      .from('product_images')
      .update({ is_primary: true })
      .eq('id', imageId)
      .select();

    if (error) throw error;
    return data[0];
  }
}

export default ProductImage;