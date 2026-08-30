/**
 * Admin Panel JavaScript
 */

const API_BASE = '/api/x7k9m2-admin';
let currentAdmin = null;
let currentSection = 'dashboard';
let categories = [];
let sizes = [];

// ==========================================
// Authentication
// ==========================================

function getToken() {
  return localStorage.getItem('adminAccessToken');
}

async function checkAuth() {
  const token = getToken();
  if (!token) {
    window.location.href = 'login.html';
    return false;
  }

  try {
    const response = await fetchWithAuth(`${API_BASE}/auth/profile`);
    const data = await response.json();

    if (data.success) {
      currentAdmin = data.data;
      updateAdminInfo();
      return true;
    } else {
      // Try refresh token
      const refreshed = await refreshToken();
      if (!refreshed) {
        logout();
        return false;
      }
      return true;
    }
  } catch (error) {
    console.error('Auth check failed:', error);
    logout();
    return false;
  }
}

async function refreshToken() {
  try {
    const response = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      credentials: 'include'
    });
    const data = await response.json();

    if (data.success) {
      localStorage.setItem('adminAccessToken', data.data.accessToken);
      currentAdmin = data.data.admin;
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
}

async function fetchWithAuth(url, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, { ...options, headers, credentials: 'include' });

  // If token expired, try refresh
  if (response.status === 401) {
    const data = await response.json();
    if (data.code === 'TOKEN_EXPIRED') {
      const refreshed = await refreshToken();
      if (refreshed) {
        headers['Authorization'] = `Bearer ${getToken()}`;
        return fetch(url, { ...options, headers, credentials: 'include' });
      }
    }
  }

  return response;
}

function updateAdminInfo() {
  if (!currentAdmin) return;

  document.getElementById('adminName').textContent = `${currentAdmin.first_name} ${currentAdmin.last_name}`;
  document.getElementById('adminRole').textContent = currentAdmin.role.replace('_', ' ');

  // Show admins nav for super admins
  if (currentAdmin.role === 'super_admin') {
    document.getElementById('adminsNavItem').style.display = 'flex';
  }
}

async function logout() {
  try {
    await fetchWithAuth(`${API_BASE}/auth/logout`, { method: 'POST' });
  } catch (error) {
    console.error('Logout error:', error);
  }

  localStorage.removeItem('adminAccessToken');
  window.location.href = 'login.html';
}

// ==========================================
// Navigation
// ==========================================

function initNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  const viewAllLinks = document.querySelectorAll('.view-all[data-section]');

  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const section = item.dataset.section;
      switchSection(section);
    });
  });

  viewAllLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const section = link.dataset.section;
      switchSection(section);
    });
  });
}

function switchSection(sectionName) {
  currentSection = sectionName;

  // Update nav
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.section === sectionName);
  });

  // Update section visibility
  document.querySelectorAll('.content-section').forEach(section => {
    section.classList.toggle('active', section.id === `${sectionName}Section`);
  });

  // Update title
  const titles = {
    dashboard: 'Dashboard',
    orders: 'Orders',
    products: 'Products',
    categories: 'Categories',
    analytics: 'Analytics',
    admins: 'Administrators'
  };
  document.getElementById('pageTitle').textContent = titles[sectionName] || sectionName;

  // Load section data
  loadSectionData(sectionName);

  // Close mobile menu and overlay
  document.getElementById('sidebar').classList.remove('mobile-open');
  document.getElementById('sidebarOverlay').classList.remove('active');
}

function loadSectionData(section) {
  switch (section) {
    case 'dashboard':
      loadDashboard();
      break;
    case 'orders':
      loadOrders();
      break;
    case 'products':
      loadProducts();
      break;
    case 'categories':
      loadCategories();
      break;
    case 'analytics':
      loadAnalytics();
      break;
    case 'admins':
      loadAdmins();
      break;
  }
}

// ==========================================
// Dashboard
// ==========================================

async function loadDashboard() {
  try {
    // Load stats
    const statsRes = await fetchWithAuth(`${API_BASE}/dashboard/stats`);
    const statsData = await statsRes.json();

    if (statsData.success && statsData.data) {
      const stats = statsData.data;
      document.getElementById('totalOrders').textContent = stats.total_orders || 0;
      document.getElementById('totalRevenue').textContent = formatCurrency(stats.total_revenue || 0);
      document.getElementById('totalProducts').textContent = stats.total_products || 0;
      document.getElementById('pendingOrders').textContent = stats.pending_orders || 0;
      document.getElementById('pendingOrdersBadge').textContent = stats.pending_orders || 0;
    }

    // Load recent orders
    const ordersRes = await fetchWithAuth(`${API_BASE}/orders?limit=5`);
    const ordersData = await ordersRes.json();

    if (ordersData.success) {
      renderRecentOrders(ordersData.data.orders);
      renderOrderStatus(ordersData.data.orders);
    }
  } catch (error) {
    console.error('Dashboard load error:', error);
    showToast('Failed to load dashboard data', 'error');
  }
}

function renderRecentOrders(orders) {
  const tbody = document.querySelector('#recentOrdersTable tbody');
  
  if (!orders || orders.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="loading-text">No orders found</td></tr>';
    return;
  }

  tbody.innerHTML = orders.map(order => `
    <tr>
      <td><strong>${order.order_number}</strong></td>
      <td>${order.customer_name}</td>
      <td>${formatCurrency(order.total)}</td>
      <td><span class="status-badge ${order.status}">${order.status}</span></td>
      <td>${formatDate(order.created_at)}</td>
    </tr>
  `).join('');
}

function renderOrderStatus(orders) {
  const container = document.getElementById('orderStatusList');
  const statusCounts = {};
  const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

  orders.forEach(order => {
    statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
  });

  container.innerHTML = statuses.map(status => `
    <div class="status-item">
      <div class="status-item-label">
        <span class="status-item-dot ${status}"></span>
        <span>${status.charAt(0).toUpperCase() + status.slice(1)}</span>
      </div>
      <span class="status-item-count">${statusCounts[status] || 0}</span>
    </div>
  `).join('');
}

// ==========================================
// Orders
// ==========================================

let ordersPage = 0;
const ordersLimit = 20;

async function loadOrders(page = 0, search = '', status = 'all') {
  try {
    const params = new URLSearchParams({
      limit: ordersLimit,
      offset: page * ordersLimit,
      status: status,
      search: search
    });

    const response = await fetchWithAuth(`${API_BASE}/orders?${params}`);
    const data = await response.json();

    if (data.success) {
      renderOrders(data.data.orders);
      renderOrdersPagination(data.data.total, page);
    }
  } catch (error) {
    console.error('Load orders error:', error);
    showToast('Failed to load orders', 'error');
  }
}

function renderOrders(orders) {
  const tbody = document.querySelector('#ordersTable tbody');

  if (!orders || orders.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="loading-text">No orders found</td></tr>';
    return;
  }

  tbody.innerHTML = orders.map(order => `
    <tr>
      <td><strong>${order.order_number}</strong></td>
      <td>${order.customer_name}</td>
      <td>${order.customer_email}</td>
      <td>${order.order_items?.length || 0} items</td>
      <td>${formatCurrency(order.total)}</td>
      <td><span class="status-badge ${order.status}">${order.status}</span></td>
      <td>${formatDate(order.created_at)}</td>
      <td>
        <div class="action-buttons">
          <button class="btn-icon view" onclick="viewOrder('${order.id}')" title="View">
            <i class="bi bi-eye"></i>
          </button>
          <button class="btn-icon delete" onclick="deleteOrder('${order.id}')" title="Delete">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

function renderOrdersPagination(total, currentPage) {
  const container = document.getElementById('ordersPagination');
  const totalPages = Math.ceil(total / ordersLimit);

  if (totalPages <= 1) {
    container.innerHTML = '';
    return;
  }

  let html = '';

  // Previous button
  html += `<button class="page-btn" onclick="changeOrdersPage(${currentPage - 1})" ${currentPage === 0 ? 'disabled' : ''}>
    <i class="bi bi-chevron-left"></i>
  </button>`;

  // Page numbers
  for (let i = 0; i < totalPages; i++) {
    if (i === 0 || i === totalPages - 1 || Math.abs(i - currentPage) <= 2) {
      html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="changeOrdersPage(${i})">${i + 1}</button>`;
    } else if (Math.abs(i - currentPage) === 3) {
      html += `<span class="page-btn">...</span>`;
    }
  }

  // Next button
  html += `<button class="page-btn" onclick="changeOrdersPage(${currentPage + 1})" ${currentPage >= totalPages - 1 ? 'disabled' : ''}>
    <i class="bi bi-chevron-right"></i>
  </button>`;

  container.innerHTML = html;
}

function changeOrdersPage(page) {
  const status = document.getElementById('orderStatusFilter').value;
  const search = document.getElementById('orderSearch').value;
  loadOrders(page, search, status);
}

async function viewOrder(orderId) {
  try {
    const response = await fetchWithAuth(`${API_BASE}/orders/${orderId}`);
    const data = await response.json();

    if (data.success) {
      renderOrderModal(data.data);
      openModal('orderModal');
    }
  } catch (error) {
    showToast('Failed to load order details', 'error');
  }
}

function renderOrderModal(order) {
  const body = document.getElementById('orderModalBody');

  body.innerHTML = `
    <div class="order-details">
      <div class="order-info-grid">
        <div class="order-info-item">
          <label>Order Number</label>
          <span>${order.order_number}</span>
        </div>
        <div class="order-info-item">
          <label>Status</label>
          <span class="status-badge ${order.status}">${order.status}</span>
        </div>
        <div class="order-info-item">
          <label>Customer Name</label>
          <span>${order.customer_name}</span>
        </div>
        <div class="order-info-item">
          <label>Email</label>
          <span>${order.customer_email}</span>
        </div>
        <div class="order-info-item">
          <label>Phone</label>
          <span>${order.customer_phone || 'N/A'}</span>
        </div>
        <div class="order-info-item">
          <label>Date</label>
          <span>${formatDateTime(order.created_at)}</span>
        </div>
        <div class="order-info-item" style="grid-column: span 2;">
          <label>Address</label>
          <span>${order.shipping_address || 'N/A'}</span>
        </div>
      </div>

      <div class="order-items-list">
        <h4>Order Items</h4>
        ${order.order_items?.map(item => `
          <div class="order-item">
            <div>
              <span class="order-item-name">${item.product_name}${item.size_name ? ` - ${item.size_name}` : ''}</span>
              <span class="order-item-qty"> × ${item.quantity}</span>
            </div>
            <span class="order-item-price">${formatCurrency(item.subtotal)}</span>
          </div>
        `).join('') || '<p>No items</p>'}
        <div class="order-item" style="border-top: 2px solid var(--border); margin-top: 10px; padding-top: 15px;">
          <strong>Total</strong>
          <strong>${formatCurrency(order.total)}</strong>
        </div>
      </div>

      <div class="order-status-update">
        <label>Update Status</label>
        <select id="orderStatusSelect">
          <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
          <option value="confirmed" ${order.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
          <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Processing</option>
          <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Shipped</option>
          <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
          <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
        </select>
        <button class="btn-primary btn-sm" onclick="updateOrderStatus('${order.id}')">Update</button>
      </div>
    </div>
  `;
}

async function updateOrderStatus(orderId) {
  const status = document.getElementById('orderStatusSelect').value;

  try {
    const response = await fetchWithAuth(`${API_BASE}/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });

    const data = await response.json();

    if (data.success) {
      showToast('Order status updated', 'success');
      closeModal('orderModal');
      loadOrders();
      loadDashboard();
    } else {
      showToast(data.message || 'Failed to update status', 'error');
    }
  } catch (error) {
    showToast('Failed to update order status', 'error');
  }
}

async function deleteOrder(orderId) {
  showDeleteConfirm('Are you sure you want to delete this order?', async () => {
    try {
      const response = await fetchWithAuth(`${API_BASE}/orders/${orderId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        showToast('Order deleted', 'success');
        loadOrders();
      } else {
        showToast(data.message || 'Failed to delete order', 'error');
      }
    } catch (error) {
      showToast('Failed to delete order', 'error');
    }
  });
}

// ==========================================
// Products
// ==========================================

async function loadProducts(search = '', active = '') {
  try {
    const params = new URLSearchParams({ search, active });
    const response = await fetchWithAuth(`${API_BASE}/products?${params}`);
    const data = await response.json();

    if (data.success) {
      renderProducts(data.data.products);
    }

    // Also load categories and sizes for form
    await loadCategoriesAndSizes();
  } catch (error) {
    console.error('Load products error:', error);
    showToast('Failed to load products', 'error');
  }
}

function renderProducts(products) {
  const tbody = document.querySelector('#productsTable tbody');

  if (!products || products.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="loading-text">No products found</td></tr>';
    return;
  }

  tbody.innerHTML = products.map(product => {
    const totalStock = product.sizes?.reduce((sum, s) => sum + (s.stock || 0), 0) || 0;
    const primaryImage = product.product_images?.find(img => img.is_primary)?.image_url || product.product_images?.[0]?.image_url || '';

    return `
      <tr>
        <td>
          ${primaryImage ? `<img src="${primaryImage}" class="product-thumb" alt="${product.name}">` : '<div class="product-thumb"></div>'}
        </td>
        <td><strong>${product.name}</strong></td>
        <td>${formatCurrency(product.price)}</td>
        <td>
          <span class="stock-badge ${totalStock === 0 ? 'out-of-stock' : totalStock <= 5 ? 'low-stock' : 'in-stock'}">
            ${totalStock} units
          </span>
        </td>
        <td><span class="status-badge ${product.is_active ? 'active' : 'inactive'}">${product.is_active ? 'Active' : 'Inactive'}</span></td>
        <td>${product.is_featured ? '<span class="featured-badge"><i class="bi bi-star-fill"></i></span>' : '-'}</td>
        <td>
          <div class="action-buttons">
            <button class="btn-icon edit" onclick="editProduct('${product.id}')" title="Edit">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn-icon delete" onclick="deleteProduct('${product.id}')" title="Delete">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

async function loadCategoriesAndSizes() {
  try {
    const [catRes, sizeRes] = await Promise.all([
      fetchWithAuth(`${API_BASE}/categories`),
      fetchWithAuth(`${API_BASE}/sizes`)
    ]);

    const catData = await catRes.json();
    const sizeData = await sizeRes.json();

    if (catData.success) categories = catData.data;
    if (sizeData.success) sizes = sizeData.data;
  } catch (error) {
    console.error('Failed to load categories/sizes:', error);
  }
}

function openProductModal(product = null) {
  const modal = document.getElementById('productModal');
  const title = document.getElementById('productModalTitle');
  const form = document.getElementById('productForm');

  // Render categories
  document.getElementById('productCategories').innerHTML = categories.map(cat => `
    <label>
      <input type="checkbox" name="categories" value="${cat.id}" ${product?.categories?.some(c => c.id === cat.id) ? 'checked' : ''}>
      ${cat.name}
    </label>
  `).join('');

  // Render sizes
  document.getElementById('productSizes').innerHTML = sizes.map(size => {
    const productSize = product?.sizes?.find(s => s.id === size.id);
    return `
      <div class="size-input-group">
        <label>${size.name}</label>
        <input type="number" name="size_${size.id}" min="0" value="${productSize?.stock || 0}" data-size-id="${size.id}">
      </div>
    `;
  }).join('');

  if (product) {
    title.textContent = 'Edit Product';
    document.getElementById('productId').value = product.id;
    document.getElementById('productName').value = product.name;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productDescription').value = product.description || '';
    document.getElementById('productActive').checked = product.is_active;
    document.getElementById('productFeatured').checked = product.is_featured;
    document.getElementById('productImages').value = product.product_images?.map(img => img.image_url).join('\n') || '';
  } else {
    title.textContent = 'Add Product';
    form.reset();
    document.getElementById('productId').value = '';
    document.getElementById('productActive').checked = true;
  }

  openModal('productModal');
}

async function editProduct(productId) {
  try {
    const response = await fetchWithAuth(`${API_BASE}/products?search=`);
    const data = await response.json();

    if (data.success) {
      const product = data.data.products.find(p => p.id === productId);
      if (product) {
        openProductModal(product);
      }
    }
  } catch (error) {
    showToast('Failed to load product', 'error');
  }
}

async function saveProduct(e) {
  e.preventDefault();

  const productId = document.getElementById('productId').value;
  const name = document.getElementById('productName').value;
  const price = document.getElementById('productPrice').value;
  const description = document.getElementById('productDescription').value;
  const is_active = document.getElementById('productActive').checked;
  const is_featured = document.getElementById('productFeatured').checked;

  // Get categories
  const categoryCheckboxes = document.querySelectorAll('input[name="categories"]:checked');
  const selectedCategories = Array.from(categoryCheckboxes).map(cb => cb.value);

  // Get sizes
  const sizeInputs = document.querySelectorAll('[data-size-id]');
  const productSizes = Array.from(sizeInputs).map(input => ({
    size_id: input.dataset.sizeId,
    stock: parseInt(input.value) || 0
  }));

  // Get images
  const imagesText = document.getElementById('productImages').value;
  const images = imagesText.split('\n').filter(url => url.trim()).map(url => ({ url: url.trim() }));

  const payload = {
    name,
    price,
    description,
    is_active,
    is_featured,
    categories: selectedCategories,
    sizes: productSizes,
    images
  };

  try {
    const url = productId ? `${API_BASE}/products/${productId}` : `${API_BASE}/products`;
    const method = productId ? 'PUT' : 'POST';

    const response = await fetchWithAuth(url, {
      method,
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (data.success) {
      showToast(`Product ${productId ? 'updated' : 'created'} successfully`, 'success');
      closeModal('productModal');
      loadProducts();
    } else {
      showToast(data.message || 'Failed to save product', 'error');
    }
  } catch (error) {
    showToast('Failed to save product', 'error');
  }
}

async function deleteProduct(productId) {
  showDeleteConfirm('Are you sure you want to delete this product?', async () => {
    try {
      const response = await fetchWithAuth(`${API_BASE}/products/${productId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        showToast('Product deleted', 'success');
        loadProducts();
      } else {
        showToast(data.message || 'Failed to delete product', 'error');
      }
    } catch (error) {
      showToast('Failed to delete product', 'error');
    }
  });
}

// ==========================================
// Categories
// ==========================================

async function loadCategories() {
  try {
    const response = await fetchWithAuth(`${API_BASE}/categories`);
    const data = await response.json();

    if (data.success) {
      renderCategories(data.data);
    }
  } catch (error) {
    console.error('Load categories error:', error);
    showToast('Failed to load categories', 'error');
  }
}

function renderCategories(cats) {
  const tbody = document.querySelector('#categoriesTable tbody');

  if (!cats || cats.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="loading-text">No categories found</td></tr>';
    return;
  }

  tbody.innerHTML = cats.map(cat => `
    <tr>
      <td><strong>${cat.name}</strong></td>
      <td>${cat.slug}</td>
      <td>${cat.description || '-'}</td>
      <td>-</td>
      <td><span class="status-badge ${cat.is_active !== false ? 'active' : 'inactive'}">${cat.is_active !== false ? 'Active' : 'Inactive'}</span></td>
      <td>
        <div class="action-buttons">
          <button class="btn-icon edit" onclick="editCategory('${cat.id}')" title="Edit">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn-icon delete" onclick="deleteCategory('${cat.id}')" title="Delete">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

function openCategoryModal(category = null) {
  const title = document.getElementById('categoryModalTitle');
  const form = document.getElementById('categoryForm');

  if (category) {
    title.textContent = 'Edit Category';
    document.getElementById('categoryId').value = category.id;
    document.getElementById('categoryName').value = category.name;
    document.getElementById('categoryDescription').value = category.description || '';
    document.getElementById('categoryImage').value = category.image_url || '';
    document.getElementById('categoryActive').checked = category.is_active !== false;
  } else {
    title.textContent = 'Add Category';
    form.reset();
    document.getElementById('categoryId').value = '';
    document.getElementById('categoryActive').checked = true;
  }

  openModal('categoryModal');
}

async function editCategory(categoryId) {
  const category = categories.find(c => c.id === categoryId);
  if (category) {
    openCategoryModal(category);
  } else {
    // Reload and find
    await loadCategories();
    const cat = categories.find(c => c.id === categoryId);
    if (cat) openCategoryModal(cat);
  }
}

async function saveCategory(e) {
  e.preventDefault();

  const categoryId = document.getElementById('categoryId').value;
  const name = document.getElementById('categoryName').value;
  const description = document.getElementById('categoryDescription').value;
  const image_url = document.getElementById('categoryImage').value;
  const is_active = document.getElementById('categoryActive').checked;

  const payload = { name, description, image_url, is_active };

  try {
    const url = categoryId ? `${API_BASE}/categories/${categoryId}` : `${API_BASE}/categories`;
    const method = categoryId ? 'PUT' : 'POST';

    const response = await fetchWithAuth(url, {
      method,
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (data.success) {
      showToast(`Category ${categoryId ? 'updated' : 'created'} successfully`, 'success');
      closeModal('categoryModal');
      loadCategories();
    } else {
      showToast(data.message || 'Failed to save category', 'error');
    }
  } catch (error) {
    showToast('Failed to save category', 'error');
  }
}

async function deleteCategory(categoryId) {
  showDeleteConfirm('Are you sure you want to delete this category?', async () => {
    try {
      const response = await fetchWithAuth(`${API_BASE}/categories/${categoryId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        showToast('Category deleted', 'success');
        loadCategories();
      } else {
        showToast(data.message || 'Failed to delete category', 'error');
      }
    } catch (error) {
      showToast('Failed to delete category', 'error');
    }
  });
}

// ==========================================
// Analytics
// ==========================================

async function loadAnalytics() {
  const period = document.getElementById('analyticsPeriod').value;

  try {
    const response = await fetchWithAuth(`${API_BASE}/analytics?period=${period}`);
    const data = await response.json();

    if (data.success) {
      renderRevenueChart(data.data.revenueByDate);
      renderTopProducts(data.data.topProducts);
    }
  } catch (error) {
    console.error('Load analytics error:', error);
    showToast('Failed to load analytics', 'error');
  }
}

function renderRevenueChart(revenueByDate) {
  const container = document.getElementById('revenueChart');

  if (!revenueByDate || Object.keys(revenueByDate).length === 0) {
    container.innerHTML = '<div class="loading-text">No data available</div>';
    return;
  }

  const dates = Object.keys(revenueByDate).sort();
  const maxRevenue = Math.max(...dates.map(d => revenueByDate[d].revenue));

  container.innerHTML = dates.slice(-14).map(date => {
    const data = revenueByDate[date];
    const percentage = maxRevenue > 0 ? (data.revenue / maxRevenue) * 100 : 0;

    return `
      <div class="chart-bar">
        <span class="chart-bar-label">${formatShortDate(date)}</span>
        <div class="chart-bar-track">
          <div class="chart-bar-fill" style="width: ${percentage}%"></div>
        </div>
        <span class="chart-bar-value">${formatCurrency(data.revenue)}</span>
      </div>
    `;
  }).join('');
}

function renderTopProducts(topProducts) {
  const container = document.getElementById('topProductsList');

  if (!topProducts || topProducts.length === 0) {
    container.innerHTML = '<div class="loading-text">No products sold yet</div>';
    return;
  }

  container.innerHTML = topProducts.map((product, index) => `
    <div class="top-product-item">
      <span class="top-product-rank">${index + 1}</span>
      <div class="top-product-info">
        <div class="top-product-name">${product.name}</div>
        <div class="top-product-sold">${product.totalSold} sold</div>
      </div>
      <span class="top-product-revenue">${formatCurrency(product.totalRevenue)}</span>
    </div>
  `).join('');
}

// ==========================================
// Admins (Super Admin Only)
// ==========================================

async function loadAdmins() {
  if (currentAdmin?.role !== 'super_admin') {
    showToast('Access denied', 'error');
    return;
  }

  try {
    const response = await fetchWithAuth(`${API_BASE}/admins`);
    const data = await response.json();

    if (data.success) {
      renderAdmins(data.data);
    }
  } catch (error) {
    console.error('Load admins error:', error);
    showToast('Failed to load admins', 'error');
  }
}

function renderAdmins(admins) {
  const tbody = document.querySelector('#adminsTable tbody');

  if (!admins || admins.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="loading-text">No admins found</td></tr>';
    return;
  }

  tbody.innerHTML = admins.map(admin => `
    <tr>
      <td><strong>${admin.first_name} ${admin.last_name}</strong></td>
      <td>${admin.email}</td>
      <td>${admin.phone || '-'}</td>
      <td><span class="status-badge ${admin.role === 'super_admin' ? 'processing' : 'confirmed'}">${admin.role.replace('_', ' ')}</span></td>
      <td><span class="status-badge ${admin.is_active ? 'active' : 'inactive'}">${admin.is_active ? 'Active' : 'Inactive'}</span></td>
      <td>${admin.last_login ? formatDateTime(admin.last_login) : 'Never'}</td>
      <td>
        <div class="action-buttons">
          <button class="btn-icon edit" onclick="editAdmin('${admin.id}')" title="Edit" ${admin.id === currentAdmin.id ? 'disabled' : ''}>
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn-icon delete" onclick="deleteAdmin('${admin.id}')" title="Delete" ${admin.id === currentAdmin.id ? 'disabled' : ''}>
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

let adminsCache = [];

function openAdminModal(admin = null) {
  const title = document.getElementById('adminModalTitle');
  const form = document.getElementById('adminForm');
  const passwordGroup = document.getElementById('passwordGroup');

  if (admin) {
    title.textContent = 'Edit Admin';
    document.getElementById('adminId').value = admin.id;
    document.getElementById('adminFirstName').value = admin.first_name;
    document.getElementById('adminLastName').value = admin.last_name;
    document.getElementById('adminEmail').value = admin.email;
    document.getElementById('adminPhone').value = admin.phone || '';
    document.getElementById('adminRoleSelect').value = admin.role;
    document.getElementById('adminActive').checked = admin.is_active;
    document.getElementById('adminPassword').required = false;
    passwordGroup.querySelector('label').textContent = 'Password (leave blank to keep current)';
  } else {
    title.textContent = 'Add Admin';
    form.reset();
    document.getElementById('adminId').value = '';
    document.getElementById('adminActive').checked = true;
    document.getElementById('adminPassword').required = true;
    passwordGroup.querySelector('label').textContent = 'Password *';
  }

  openModal('adminModal');
}

async function editAdmin(adminId) {
  try {
    const response = await fetchWithAuth(`${API_BASE}/admins`);
    const data = await response.json();

    if (data.success) {
      adminsCache = data.data;
      const admin = adminsCache.find(a => a.id === adminId);
      if (admin) {
        openAdminModal(admin);
      }
    }
  } catch (error) {
    showToast('Failed to load admin', 'error');
  }
}

async function saveAdmin(e) {
  e.preventDefault();

  const adminId = document.getElementById('adminId').value;
  const first_name = document.getElementById('adminFirstName').value;
  const last_name = document.getElementById('adminLastName').value;
  const email = document.getElementById('adminEmail').value;
  const phone = document.getElementById('adminPhone').value;
  const password = document.getElementById('adminPassword').value;
  const role = document.getElementById('adminRoleSelect').value;
  const is_active = document.getElementById('adminActive').checked;

  const payload = { first_name, last_name, email, phone, role, is_active };
  if (password) payload.password = password;

  try {
    const url = adminId ? `${API_BASE}/admins/${adminId}` : `${API_BASE}/admins`;
    const method = adminId ? 'PUT' : 'POST';

    const response = await fetchWithAuth(url, {
      method,
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (data.success) {
      showToast(`Admin ${adminId ? 'updated' : 'created'} successfully`, 'success');
      closeModal('adminModal');
      loadAdmins();
    } else {
      showToast(data.message || 'Failed to save admin', 'error');
    }
  } catch (error) {
    showToast('Failed to save admin', 'error');
  }
}

async function deleteAdmin(adminId) {
  if (adminId === currentAdmin.id) {
    showToast("You cannot delete your own account", 'error');
    return;
  }

  showDeleteConfirm('Are you sure you want to delete this admin?', async () => {
    try {
      const response = await fetchWithAuth(`${API_BASE}/admins/${adminId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        showToast('Admin deleted', 'success');
        loadAdmins();
      } else {
        showToast(data.message || 'Failed to delete admin', 'error');
      }
    } catch (error) {
      showToast('Failed to delete admin', 'error');
    }
  });
}

// ==========================================
// Utilities
// ==========================================

function formatCurrency(amount) {
  return '$' + (parseFloat(amount) || 0).toFixed(2);
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDateTime(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatShortDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ==========================================
// Modals
// ==========================================

function openModal(modalId) {
  document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove('active');
}

let deleteCallback = null;

function showDeleteConfirm(message, callback) {
  document.getElementById('deleteMessage').textContent = message;
  deleteCallback = callback;
  openModal('deleteModal');
}

function initModals() {
  // Close buttons
  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.modal');
      if (modal) modal.classList.remove('active');
    });
  });

  // Click outside to close
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
  });

  // Confirm delete button
  document.getElementById('confirmDeleteBtn').addEventListener('click', () => {
    closeModal('deleteModal');
    if (deleteCallback) {
      deleteCallback();
      deleteCallback = null;
    }
  });
}

// ==========================================
// Toast Notifications
// ==========================================

function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const icons = {
    success: 'check-circle',
    error: 'exclamation-circle',
    warning: 'exclamation-triangle',
    info: 'info-circle'
  };

  toast.innerHTML = `<i class="bi bi-${icons[type]}"></i> ${message}`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 4000);
}

// ==========================================
// Event Listeners
// ==========================================

function initEventListeners() {
  // Logout
  document.getElementById('logoutBtn').addEventListener('click', logout);

  // Mobile menu
  document.getElementById('mobileMenuBtn').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('mobile-open');
    document.getElementById('sidebarOverlay').classList.toggle('active');
  });

  // Sidebar overlay click to close
  document.getElementById('sidebarOverlay').addEventListener('click', () => {
    document.getElementById('sidebar').classList.remove('mobile-open');
    document.getElementById('sidebarOverlay').classList.remove('active');
  });

  // Refresh
  document.getElementById('refreshBtn').addEventListener('click', () => {
    const btn = document.getElementById('refreshBtn');
    btn.classList.add('spinning');
    loadSectionData(currentSection);
    setTimeout(() => btn.classList.remove('spinning'), 1000);
  });

  // Order filters
  document.getElementById('orderStatusFilter').addEventListener('change', (e) => {
    const search = document.getElementById('orderSearch').value;
    loadOrders(0, search, e.target.value);
  });

  document.getElementById('orderSearch').addEventListener('input', debounce((e) => {
    const status = document.getElementById('orderStatusFilter').value;
    loadOrders(0, e.target.value, status);
  }, 300));

  // Product filters
  document.getElementById('productActiveFilter').addEventListener('change', (e) => {
    const search = document.getElementById('productSearch').value;
    loadProducts(search, e.target.value);
  });

  document.getElementById('productSearch').addEventListener('input', debounce((e) => {
    const active = document.getElementById('productActiveFilter').value;
    loadProducts(e.target.value, active);
  }, 300));

  // Analytics period
  document.getElementById('analyticsPeriod').addEventListener('change', () => {
    loadAnalytics();
  });

  // Add buttons
  document.getElementById('addProductBtn').addEventListener('click', () => openProductModal());
  document.getElementById('addCategoryBtn').addEventListener('click', () => openCategoryModal());
  document.getElementById('addAdminBtn').addEventListener('click', () => openAdminModal());

  // Form submissions
  document.getElementById('productForm').addEventListener('submit', saveProduct);
  document.getElementById('categoryForm').addEventListener('submit', saveCategory);
  document.getElementById('adminForm').addEventListener('submit', saveAdmin);
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// ==========================================
// Initialize
// ==========================================

async function init() {
  const authed = await checkAuth();
  if (!authed) return;

  initNavigation();
  initModals();
  initEventListeners();
  loadDashboard();
}

// Start the app
init();
