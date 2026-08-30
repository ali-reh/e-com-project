import supabase from '../config/supabase.js';
class Category {
    static async getById(categoryId) {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .eq('id', categoryId)
            .single();
        if (error)
            throw error;
        return data;
    }
    static async getAll() {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .order('name', { ascending: true });
        if (error)
            throw error;
        return data;
    }
    static async create(categoryData) {
        const { data, error } = await supabase
            .from('categories')
            .insert([categoryData])
            .select();
        if (error)
            throw error;
        return data[0];
    }
    static async update(categoryId, updateData) {
        const { data, error } = await supabase
            .from('categories')
            .update(updateData)
            .eq('id', categoryId)
            .select();
        if (error)
            throw error;
        return data[0];
    }
    static async delete(categoryId) {
        const { error } = await supabase
            .from('categories')
            .delete()
            .eq('id', categoryId);
        if (error)
            throw error;
        return true;
    }
}
export default Category;
//# sourceMappingURL=Category.js.map