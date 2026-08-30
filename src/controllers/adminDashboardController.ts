// @ts-nocheck
import supabase from '../config/supabase.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { successResponse, errorResponse } from '../utils/responseHandler.js';

/**
 * Get dashboard statistics
 */
export const getDashboardStats = async (req, res) => {
  try {
    const { data, error } = await supabase.rpc('get_dashboard_stats');

    if (error) throw error;

    successResponse(res, data, 'Dashboard stats retrieved');
  } catch (error) {
    console.error('Dashboard stats error:', error);
    errorResponse(res, error);
  }
};

/**
 * Get all orders with filtering
 */
export const getOrders = async (req, res) => {
  try {
    const { status, limit = 50, offset = 0, search, dateFrom, dateTo } = req.query;

    let query = supabase
      .from('orders')
      .select(`
        *,
        order_items(*)
      `)
      .order('created_at', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    // Filter by status
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    // Search by order number or customer name
    if (search) {
      query = query.or(`order_number.ilike.%${search}%,customer_name.ilike.%${search}%,customer_email.ilike.%${search}%`);
    }

    // Date range filter
    if (dateFrom) {
      query = query.gte('created_at', dateFrom);
    }
    if (dateTo) {
      query = query.lte('created_at', dateTo);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Get total count for pagination
    let countQuery = supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });

    if (status && status !== 'all') {
      countQuery = countQuery.eq('status', status);
    }

    const { count } = await countQuery;

    successResponse(res, { orders: data, total: count }, 'Orders retrieved');
  } catch (error) {
    console.error('Get orders error:', error);
    errorResponse(res, error);
  }
};

/**
 * Get single order with items
 */
export const getOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    successResponse(res, data, 'Order retrieved');
  } catch (error) {
    errorResponse(res, error);
  }
};

/**
 * Update order status
 */
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return errorResponse(res, { message: 'Invalid status' }, 400);
    }

    const { data, error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    successResponse(res, data, 'Order status updated');
  } catch (error) {
    errorResponse(res, error);
  }
};

/**
 * Delete order
 */
export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    // Delete order items first (cascade should handle this, but just in case)
    await supabase.from('order_items').delete().eq('order_id', id);

    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id);

    if (error) throw error;

    successResponse(res, null, 'Order deleted');
  } catch (error) {
    errorResponse(res, error);
  }
};

/**
 * Get analytics data
 */
export const getAnalytics = async (req, res) => {
  try {
    const { period = '30' } = req.query; // days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Daily revenue for chart
    const { data: dailyRevenue, error: dailyError } = await supabase
      .from('orders')
      .select('created_at, total, status')
      .gte('created_at', startDate.toISOString())
      .neq('status', 'cancelled')
      .order('created_at', { ascending: true });

    if (dailyError) throw dailyError;

    // Group by date
    const revenueByDate = {};
    dailyRevenue.forEach(order => {
      const date = new Date(order.created_at).toISOString().split('T')[0];
      if (!revenueByDate[date]) {
        revenueByDate[date] = { revenue: 0, orders: 0 };
      }
      revenueByDate[date].revenue += order.total;
      revenueByDate[date].orders += 1;
    });

    // Top products
    const { data: topProducts, error: topError } = await supabase
      .from('order_items')
      .select('product_id, product_name, quantity, subtotal')
      .order('quantity', { ascending: false });

    if (topError) throw topError;

    // Aggregate top products
    const productStats = {};
    topProducts.forEach(item => {
      if (!productStats[item.product_id]) {
        productStats[item.product_id] = {
          name: item.product_name,
          totalSold: 0,
          totalRevenue: 0
        };
      }
      productStats[item.product_id].totalSold += item.quantity;
      productStats[item.product_id].totalRevenue += item.subtotal;
    });

    const topProductsList = Object.entries(productStats)
      .map(([id, stats]) => ({ id, ...stats }))
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, 10);

    // Order status distribution
    const { data: statusData, error: statusError } = await supabase
      .from('orders')
      .select('status');

    if (statusError) throw statusError;

    const statusCounts = statusData.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});

    successResponse(res, {
      revenueByDate,
      topProducts: topProductsList,
      statusDistribution: statusCounts,
      period: parseInt(period)
    }, 'Analytics retrieved');

  } catch (error) {
    console.error('Analytics error:', error);
    errorResponse(res, error);
  }
};

/**
 * Get all products for admin (including inactive)
 */
export const getProducts = async (req, res) => {
  try {
    const { limit = 50, offset = 0, search, category, active } = req.query;

    let query = supabase
      .from('products')
      .select(`
        *,
        product_categories(
          categories(*)
        ),
        product_images(*),
        product_sizes(
          *,
          sizes(*)
        )
      `)
      .order('created_at', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    // Only filter by active status if explicitly set to 'true' or 'false'
    if (active === 'true' || active === 'false') {
      query = query.eq('is_active', active === 'true');
    }

    const { data, error } = await query;

    if (error) throw error;

    // Transform data
    const products = data.map(product => ({
      ...product,
      categories: product.product_categories?.map(pc => pc.categories).filter(Boolean) || [],
      sizes: product.product_sizes?.map(ps => ({
        ...ps.sizes,
        stock: ps.stock,
        product_size_id: ps.id
      })) || [],
      product_categories: undefined,
      product_sizes: undefined
    }));

    // Get total count
    const { count } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    successResponse(res, { products, total: count }, 'Products retrieved');
  } catch (error) {
    console.error('Get products error:', error);
    errorResponse(res, error);
  }
};

/**
 * Create product
 */
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, is_active, is_featured, categories, images, sizes } = req.body;

    if (!name || !price) {
      return errorResponse(res, { message: 'Name and price are required' }, 400);
    }

    // Create product
    const { data: product, error: productError } = await supabase
      .from('products')
      .insert([{
        name,
        description,
        price: parseFloat(price),
        is_active: is_active !== false,
        is_featured: is_featured === true
      }])
      .select()
      .single();

    if (productError) throw productError;

    // Add categories
    if (categories && categories.length > 0) {
      const categoryLinks = categories.map(catId => ({
        product_id: product.id,
        category_id: catId
      }));

      await supabase.from('product_categories').insert(categoryLinks);
    }

    // Add images
    if (images && images.length > 0) {
      const imageRecords = images.map((img, index) => ({
        product_id: product.id,
        image_url: img.url || img.image_url,
        alt_text: img.alt_text || name,
        is_primary: index === 0,
        display_order: index
      }));

      await supabase.from('product_images').insert(imageRecords);
    }

    // Add sizes
    if (sizes && sizes.length > 0) {
      const sizeRecords = sizes.map(size => ({
        product_id: product.id,
        size_id: size.size_id,
        stock: size.stock || 0
      }));

      await supabase.from('product_sizes').insert(sizeRecords);
    }

    // Fetch complete product
    const completeProduct = await Product.getById(product.id);

    successResponse(res, completeProduct, 'Product created', 201);
  } catch (error) {
    console.error('Create product error:', error);
    errorResponse(res, error);
  }
};

/**
 * Update product
 */
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, is_active, is_featured, categories, images, sizes } = req.body;

    // Update product
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (is_active !== undefined) updateData.is_active = is_active;
    if (is_featured !== undefined) updateData.is_featured = is_featured;
    updateData.updated_at = new Date().toISOString();

    const { data: product, error: productError } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (productError) throw productError;

    // Update categories if provided
    if (categories !== undefined) {
      await supabase.from('product_categories').delete().eq('product_id', id);
      
      if (categories.length > 0) {
        const categoryLinks = categories.map(catId => ({
          product_id: id,
          category_id: catId
        }));
        await supabase.from('product_categories').insert(categoryLinks);
      }
    }

    // Update images if provided
    if (images !== undefined) {
      await supabase.from('product_images').delete().eq('product_id', id);
      
      if (images.length > 0) {
        const imageRecords = images.map((img, index) => ({
          product_id: id,
          image_url: img.url || img.image_url,
          alt_text: img.alt_text || name,
          is_primary: index === 0,
          display_order: index
        }));
        await supabase.from('product_images').insert(imageRecords);
      }
    }

    // Update sizes if provided
    if (sizes !== undefined) {
      await supabase.from('product_sizes').delete().eq('product_id', id);
      
      if (sizes.length > 0) {
        const sizeRecords = sizes.map(size => ({
          product_id: id,
          size_id: size.size_id,
          stock: size.stock || 0
        }));
        await supabase.from('product_sizes').insert(sizeRecords);
      }
    }

    // Fetch complete product
    const completeProduct = await Product.getById(id);

    successResponse(res, completeProduct, 'Product updated');
  } catch (error) {
    console.error('Update product error:', error);
    errorResponse(res, error);
  }
};

/**
 * Delete product
 */
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;

    successResponse(res, null, 'Product deleted');
  } catch (error) {
    errorResponse(res, error);
  }
};

/**
 * Get all categories
 */
export const getCategories = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;

    successResponse(res, data, 'Categories retrieved');
  } catch (error) {
    errorResponse(res, error);
  }
};

/**
 * Create category
 */
export const createCategory = async (req, res) => {
  try {
    const { name, description, image_url } = req.body;

    if (!name) {
      return errorResponse(res, { message: 'Category name is required' }, 400);
    }

    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const { data, error } = await supabase
      .from('categories')
      .insert([{ name, slug, description, image_url }])
      .select()
      .single();

    if (error) throw error;

    successResponse(res, data, 'Category created', 201);
  } catch (error) {
    errorResponse(res, error);
  }
};

/**
 * Update category
 */
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, image_url, is_active } = req.body;

    const updateData = { updated_at: new Date().toISOString() };
    if (name !== undefined) {
      updateData.name = name;
      updateData.slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    }
    if (description !== undefined) updateData.description = description;
    if (image_url !== undefined) updateData.image_url = image_url;
    if (is_active !== undefined) updateData.is_active = is_active;

    const { data, error } = await supabase
      .from('categories')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    successResponse(res, data, 'Category updated');
  } catch (error) {
    errorResponse(res, error);
  }
};

/**
 * Delete category
 */
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) throw error;

    successResponse(res, null, 'Category deleted');
  } catch (error) {
    errorResponse(res, error);
  }
};

/**
 * Get all sizes
 */
export const getSizes = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('sizes')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;

    successResponse(res, data, 'Sizes retrieved');
  } catch (error) {
    errorResponse(res, error);
  }
};

/**
 * Update product stock
 */
export const updateProductStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { sizes } = req.body; // Array of { size_id, stock }

    if (!sizes || !Array.isArray(sizes)) {
      return errorResponse(res, { message: 'Sizes array is required' }, 400);
    }

    // Update each size stock
    for (const size of sizes) {
      await supabase
        .from('product_sizes')
        .upsert({
          product_id: id,
          size_id: size.size_id,
          stock: size.stock
        }, { onConflict: 'product_id,size_id' });
    }

    successResponse(res, null, 'Stock updated');
  } catch (error) {
    errorResponse(res, error);
  }
};

