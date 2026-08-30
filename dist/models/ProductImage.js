import supabase from '../config/supabase.js';
class ProductImage {
    static async getByProductId(productId) {
        const { data, error } = await supabase
            .from('product_images')
            .select('*')
            .eq('product_id', productId)
            .order('display_order', { ascending: true });
        if (error)
            throw error;
        return data;
    }
    static async getById(imageId) {
        const { data, error } = await supabase
            .from('product_images')
            .select('*')
            .eq('id', imageId)
            .single();
        if (error)
            throw error;
        return data;
    }
    static async create(imageData) {
        const { data, error } = await supabase
            .from('product_images')
            .insert([imageData])
            .select();
        if (error)
            throw error;
        return data[0];
    }
    static async update(imageId, updateData) {
        const { data, error } = await supabase
            .from('product_images')
            .update(updateData)
            .eq('id', imageId)
            .select();
        if (error)
            throw error;
        return data[0];
    }
    static async delete(imageId) {
        const { error } = await supabase
            .from('product_images')
            .delete()
            .eq('id', imageId);
        if (error)
            throw error;
        return true;
    }
    static async setPrimary(imageId, productId) {
        await supabase
            .from('product_images')
            .update({ is_primary: false })
            .eq('product_id', productId);
        const { data, error } = await supabase
            .from('product_images')
            .update({ is_primary: true })
            .eq('id', imageId)
            .select();
        if (error)
            throw error;
        return data[0];
    }
}
export default ProductImage;
//# sourceMappingURL=ProductImage.js.map