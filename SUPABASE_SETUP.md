# Supabase Architecture Setup Guide

## Overview
This is a **no-login e-commerce** project using Supabase as the backend database. It features:
- Browse products by category
- Add products to cart (client-side)
- Create orders without authentication (Cash on Delivery)
- Manage orders
- No user authentication required

## Project Structure

### Configuration
- **`src/config/supabase.js`** - Supabase client initialization

### Models (Database Abstraction Layer)
- **`src/models/Product.js`** - Product model with filtering and search
- **`src/models/Order.js`** - Order model with status tracking (COD)
- **`src/models/Category.js`** - Product categories

### Controllers
- **`src/controllers/productController.js`** - Product operations
- **`src/controllers/orderController.js`** - Order operations

### Routes
- **`src/routes/productRoutes.js`** - Product endpoints (public)
- **`src/routes/orderRoutes.js`** - Order endpoints (public)
- **`src/routes/index.js`** - Route aggregation

### Utilities
- **`src/utils/validators.js`** - Input validation functions
- **`src/utils/responseHandler.js`** - Standardized API responses

### Database
- **`src/database/schema.sql`** - Complete database schema

## Database Schema

### Tables (4 Core Tables)
1. **categories** - Product categories
2. **products** - Product information
3. **product_images** - Product photos
4. **orders** - Customer orders (Cash on Delivery)
5. **order_items** - Items in orders

## Setup Instructions

### 1. Environment Variables
Create a `.env` file in the project root (use `.env.example` as template):
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
PORT=3000
NODE_ENV=development
```

### 2. Database Setup
1. Create a new Supabase project at https://supabase.com
2. Navigate to SQL Editor
3. Execute the SQL from `src/database/schema.sql`
4. Tables created: categories, products, product_images, orders, order_items

### 3. Install Dependencies
```bash
npm install @supabase/supabase-js express
```

## API Endpoints

### Products (Public - No Auth Required)
- `GET /api/products` - Get all products (with filters)
  - Query params: `limit`, `offset`, `category`, `minPrice`, `maxPrice`, `search`
- `GET /api/products/:id` - Get single product with images
- `GET /api/products/featured` - Get featured products

### Orders (Public - No Auth Required)
- `GET /api/orders` - Get all orders
  - Query params: `limit`, `offset`, `status`
- `GET /api/orders/:id` - Get order details with items
- `GET /api/orders/number/:orderNumber` - Get order by order number
- `POST /api/orders` - Create new order (Cash on Delivery)
- `PUT /api/orders/:id/status` - Update order status
- `DELETE /api/orders/:id` - Delete order

## Order Creation Payload

```json
{
  "customer_name": "John Doe",
  "customer_email": "john@example.com",
  "customer_phone": "+1234567890",
  "shipping_address": "123 Main St, City, State 12345",
  "subtotal": 100.00,
  "tax": 5.00,
  "shipping_cost": 10.00,
  "total": 115.00,
  "notes": "Please deliver after 5 PM",
  "items": [
    {
      "product_id": "uuid-here",
      "quantity": 2,
      "unit_price": 50.00,
      "subtotal": 100.00
    }
  ]
}
```

## Order Status Flow

- **pending** - Order created, awaiting confirmation
- **processing** - Order confirmed, being prepared
- **shipped** - Order shipped to customer
- **delivered** - Order delivered to customer
- **cancelled** - Order cancelled

## Response Format
All successful responses follow this format:
```json
{
  "success": true,
  "message": "Success message",
  "data": { /* response data */ }
}
```

## Error Handling
All errors are caught and returned in standardized format:
```json
{
  "success": false,
  "error": "Error message"
}
```

## Client-Side Shopping Cart

Since there's no user authentication, implement shopping cart in client-side (LocalStorage):
```javascript
// Add to cart
const cart = JSON.parse(localStorage.getItem('cart') || '[]');
cart.push({ product_id, quantity, unit_price });
localStorage.setItem('cart', JSON.stringify(cart));

// Checkout
const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
const order = {
  customer_name: '...',
  customer_email: '...',
  customer_phone: '...',
  shipping_address: '...',
  items: cartItems,
  subtotal: '...',
  total: '...'
};

fetch('/api/orders', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(order)
});
```

## Features

✅ Browse products and categories
✅ Filter products by price, category, search
✅ View product details with images
✅ Create orders without login
✅ Cash on Delivery payment method
✅ Order tracking
✅ No user authentication
✅ Stateless shopping experience

## Security Considerations
1. Input validation on all endpoints
2. Rate limiting recommended for order creation
3. Store orders securely in Supabase
4. CORS configuration for allowed domains

## Useful Resources
- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
