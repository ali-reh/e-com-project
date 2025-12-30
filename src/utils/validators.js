// Email validation
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation (min 8 chars, 1 uppercase, 1 number)
export const isValidPassword = (password) => {
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

// Product validation (removed category_id since using many-to-many)
export const validateProduct = (product) => {
  const errors = {};

  if (!product.name || product.name.trim().length === 0) {
    errors.name = 'Product name is required';
  }

  if (!product.price || product.price < 0) {
    errors.price = 'Valid price is required';
  }

  if (!product.description || product.description.trim().length === 0) {
    errors.description = 'Product description is required';
  }

  // Optional: Validate categories array if provided
  if (product.categories && !Array.isArray(product.categories)) {
    errors.categories = 'Categories must be an array';
  }

  return errors;
};

// Order validation (no user_id required)
export const validateOrder = (order) => {
  const errors = {};

  if (!order.customer_name || order.customer_name.trim().length === 0) {
    errors.customer_name = 'Customer name is required';
  }

  if (!order.customer_phone || order.customer_phone.trim().length === 0) {
    errors.customer_phone = 'Customer phone is required';
  }

  if (!order.shipping_address || order.shipping_address.trim().length === 0) {
    errors.shipping_address = 'Shipping address is required';
  }

  if (order.customer_email && !isValidEmail(order.customer_email)) {
    errors.customer_email = 'Valid email is required';
  }

  if (!order.subtotal || order.subtotal < 0) {
    errors.subtotal = 'Valid subtotal is required';
  }

  if (!order.total || order.total < 0) {
    errors.total = 'Valid total is required';
  }

  return errors;
};