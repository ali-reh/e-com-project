import supabase from '../config/supabase.js';
import bcrypt from 'bcrypt';
const SALT_ROUNDS = 10;
class Admin {
    static async findByEmail(email) {
        const { data, error } = await supabase
            .from('admins')
            .select('*')
            .eq('email', email.toLowerCase())
            .eq('is_active', true)
            .single();
        if (error && error.code !== 'PGRST116') {
            throw error;
        }
        return data;
    }
    static async findById(id) {
        const { data, error } = await supabase
            .from('admins')
            .select('id, email, first_name, last_name, phone, role, is_active, last_login, created_at')
            .eq('id', id)
            .single();
        if (error)
            throw error;
        return data;
    }
    static async verifyPassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }
    static async hashPassword(password) {
        return await bcrypt.hash(password, SALT_ROUNDS);
    }
    static async updateLastLogin(adminId) {
        const { error } = await supabase
            .from('admins')
            .update({ last_login: new Date().toISOString() })
            .eq('id', adminId);
        if (error)
            throw error;
    }
    static async create(adminData) {
        const hashedPassword = await this.hashPassword(adminData.password);
        const { data, error } = await supabase
            .from('admins')
            .insert([{
                email: adminData.email.toLowerCase(),
                password_hash: hashedPassword,
                first_name: adminData.first_name,
                last_name: adminData.last_name,
                phone: adminData.phone || null,
                role: adminData.role || 'admin'
            }])
            .select('id, email, first_name, last_name, role')
            .single();
        if (error)
            throw error;
        return data;
    }
    static async getAll() {
        const { data, error } = await supabase
            .from('admins')
            .select('id, email, first_name, last_name, phone, role, is_active, last_login, created_at')
            .order('created_at', { ascending: false });
        if (error)
            throw error;
        return data;
    }
    static async update(id, updateData) {
        if (updateData.password) {
            updateData.password_hash = await this.hashPassword(updateData.password);
            delete updateData.password;
        }
        const { data, error } = await supabase
            .from('admins')
            .update(updateData)
            .eq('id', id)
            .select('id, email, first_name, last_name, role')
            .single();
        if (error)
            throw error;
        return data;
    }
    static async delete(id) {
        const { error } = await supabase
            .from('admins')
            .update({ is_active: false })
            .eq('id', id);
        if (error)
            throw error;
        return true;
    }
    static async storeRefreshToken(adminId, refreshToken, expiresAt) {
        const { error } = await supabase
            .from('admin_sessions')
            .insert([{
                admin_id: adminId,
                refresh_token: refreshToken,
                expires_at: expiresAt
            }]);
        if (error)
            throw error;
    }
    static async verifyRefreshToken(refreshToken) {
        const { data, error } = await supabase
            .from('admin_sessions')
            .select('*, admins(*)')
            .eq('refresh_token', refreshToken)
            .gt('expires_at', new Date().toISOString())
            .single();
        if (error)
            return null;
        return data;
    }
    static async deleteRefreshToken(refreshToken) {
        const { error } = await supabase
            .from('admin_sessions')
            .delete()
            .eq('refresh_token', refreshToken);
        if (error)
            throw error;
    }
    static async deleteAllTokens(adminId) {
        const { error } = await supabase
            .from('admin_sessions')
            .delete()
            .eq('admin_id', adminId);
        if (error)
            throw error;
    }
}
export default Admin;
//# sourceMappingURL=Admin.js.map