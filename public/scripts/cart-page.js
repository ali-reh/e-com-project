/**
 * Cart Page - Handles displaying and managing cart items
 */

document.addEventListener('DOMContentLoaded', async () => {
    // Load header and footer
    await Promise.all([
        loadComponent('header-placeholder', 'header.html'),
        loadComponent('footer-placeholder', 'footer.html')
    ]);

    // Load cart data
    await loadCart();

    // Signal loading complete
    if (typeof dataLoadComplete === 'function') {
        dataLoadComplete();
    }
});

/**
 * Load component (header/footer)
 */
async function loadComponent(placeholderId, file) {
    try {
        const response = await fetch(`../pages/${file}`);
        const html = await response.text();
        document.getElementById(placeholderId).innerHTML = html;
    } catch (error) {
        console.error(`Error loading ${file}:`, error);
    }
}

/**
 * Load and render cart
 */
async function loadCart() {
    const cartContent = document.getElementById('cart-content');
    const itemCountEl = document.getElementById('cart-item-count');

    try {
        const cart = await CartService.getCart();

        if (!cart || !cart.items || cart.items.length === 0) {
            renderEmptyCart(cartContent);
            itemCountEl.textContent = '0 items';
            return;
        }

        // Update item count in header
        itemCountEl.textContent = `${cart.itemCount} item${cart.itemCount !== 1 ? 's' : ''}`;

        // Render cart items and summary
        renderCartItems(cartContent, cart);

    } catch (error) {
        console.error('Error loading cart:', error);
        cartContent.innerHTML = `
            <div class="alert alert-danger">
                <i class="bi bi-exclamation-triangle me-2"></i>
                Error loading cart. Please try again.
            </div>
        `;
    }
}

/**
 * Render empty cart state
 */
function renderEmptyCart(container) {
    container.innerHTML = `
        <div class="empty-cart">
            <i class="bi bi-cart-x"></i>
            <h2>Your cart is empty</h2>
            <p>Looks like you haven't added any items to your cart yet.</p>
            <a href="shop.html">Start Shopping</a>
        </div>
    `;
}

/**
 * Render cart items and summary
 */
function renderCartItems(container, cart) {
    const itemsHTML = cart.items.map(item => `
        <div class="cart-item" data-product-id="${item.product_id}">
            <img src="${item.product?.image_url || '../images/placeholder.jpg'}" alt="${item.product?.name || 'Product'}" class="cart-item-image">
            <div class="cart-item-info">
                <h3>${item.product?.name || 'Unknown Product'}</h3>
                <p class="cart-item-price">${formatMoney(item.product?.price || 0)}</p>
                <div class="cart-item-actions">
                    <div class="quantity-control">
                        <button class="qty-decrease" data-product-id="${item.product_id}" aria-label="Decrease quantity">
                            <i class="bi bi-dash"></i>
                        </button>
                        <span class="qty-value">${item.quantity}</span>
                        <button class="qty-increase" data-product-id="${item.product_id}" aria-label="Increase quantity">
                            <i class="bi bi-plus"></i>
                        </button>
                    </div>
                </div>
            </div>
            <div class="d-flex flex-column align-items-end gap-2">
                <strong>${formatMoney(item.subtotal)}</strong>
                <button class="remove-item-btn" data-product-id="${item.product_id}" aria-label="Remove item">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        </div>
    `).join('');

    const shipping = 0; // Free shipping
    const tax = cart.total * 0.1; // 10% tax example
    const total = cart.total + shipping + tax;

    container.innerHTML = `
        <div class="cart-layout">
            <div class="cart-items">
                ${itemsHTML}
            </div>
            <div class="cart-summary">
                <h3>Order Summary</h3>
                <div class="summary-row">
                    <span>Subtotal</span>
                    <span>${formatMoney(cart.total)}</span>
                </div>
                <div class="summary-row">
                    <span>Shipping</span>
                    <span>${shipping === 0 ? 'Free' : formatMoney(shipping)}</span>
                </div>
                <div class="summary-row">
                    <span>Estimated Tax</span>
                    <span>${formatMoney(tax)}</span>
                </div>
                <div class="summary-row total">
                    <span>Total</span>
                    <span>${formatMoney(total)}</span>
                </div>
                <button class="checkout-btn" id="checkout-btn">
                    <i class="bi bi-lock me-2"></i>Proceed to Checkout
                </button>
                <a href="shop.html" class="continue-shopping">
                    <i class="bi bi-arrow-left me-1"></i>Continue Shopping
                </a>
                <button class="btn btn-link text-danger w-100 mt-2" id="clear-cart-btn">
                    Clear Cart
                </button>
            </div>
        </div>
    `;

    // Add event listeners
    attachCartEventListeners();
}

/**
 * Attach event listeners to cart controls
 */
function attachCartEventListeners() {
    // Quantity decrease buttons
    document.querySelectorAll('.qty-decrease').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const button = e.currentTarget;
            const productId = button.dataset.productId;
            const cartItem = button.closest('.cart-item');
            const qtySpan = button.nextElementSibling;
            const currentQty = parseInt(qtySpan.textContent);

            if (currentQty <= 1) {
                // If quantity is 1, ask to remove
                if (confirm('Remove this item from cart?')) {
                    cartItem.style.opacity = '0.5';
                    await CartService.removeFromCart(productId);
                    await loadCart();
                }
            } else {
                // Optimistic UI update
                const newQty = currentQty - 1;
                qtySpan.textContent = newQty;
                updateItemSubtotal(cartItem, newQty);
                updateCartTotals();
                
                // API call in background
                CartService.updateQuantity(productId, newQty);
            }
        });
    });

    // Quantity increase buttons
    document.querySelectorAll('.qty-increase').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const button = e.currentTarget;
            const productId = button.dataset.productId;
            const cartItem = button.closest('.cart-item');
            const qtySpan = button.previousElementSibling;
            const currentQty = parseInt(qtySpan.textContent);

            // Optimistic UI update
            const newQty = currentQty + 1;
            qtySpan.textContent = newQty;
            updateItemSubtotal(cartItem, newQty);
            updateCartTotals();
            
            // API call in background
            CartService.updateQuantity(productId, newQty);
        });
    });

    // Remove buttons
    document.querySelectorAll('.remove-item-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const productId = e.currentTarget.dataset.productId;
            const cartItem = e.currentTarget.closest('.cart-item');
            if (confirm('Remove this item from cart?')) {
                cartItem.style.opacity = '0.5';
                await CartService.removeFromCart(productId);
                await loadCart();
            }
        });
    });

    // Clear cart button
    const clearBtn = document.getElementById('clear-cart-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', async () => {
            if (confirm('Are you sure you want to clear your entire cart?')) {
                await CartService.clearCart();
                await loadCart();
            }
        });
    }

    // Checkout button
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            // For now, just show a message. Checkout flow would be implemented later.
            alert('Checkout functionality coming soon!');
        });
    }
}

/**
 * Format money helper
 */
function formatMoney(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

/**
 * Update item subtotal after quantity change
 */
function updateItemSubtotal(cartItem, newQty) {
    const priceText = cartItem.querySelector('.cart-item-price').textContent;
    const price = parseFloat(priceText.replace(/[^0-9.-]+/g, ''));
    const subtotalEl = cartItem.querySelector('.d-flex.flex-column strong');
    if (subtotalEl) {
        subtotalEl.textContent = formatMoney(price * newQty);
    }
}

/**
 * Recalculate and update cart totals
 */
function updateCartTotals() {
    const cartItems = document.querySelectorAll('.cart-item');
    let subtotal = 0;
    let itemCount = 0;

    cartItems.forEach(item => {
        const priceText = item.querySelector('.cart-item-price').textContent;
        const price = parseFloat(priceText.replace(/[^0-9.-]+/g, ''));
        const qty = parseInt(item.querySelector('.qty-value').textContent);
        subtotal += price * qty;
        itemCount += qty;
    });

    const tax = subtotal * 0.1;
    const total = subtotal + tax;

    // Update summary
    const summaryRows = document.querySelectorAll('.summary-row');
    if (summaryRows.length >= 4) {
        summaryRows[0].querySelector('span:last-child').textContent = formatMoney(subtotal);
        summaryRows[2].querySelector('span:last-child').textContent = formatMoney(tax);
        summaryRows[3].querySelector('span:last-child').textContent = formatMoney(total);
    }

    // Update item count
    const itemCountEl = document.getElementById('cart-item-count');
    if (itemCountEl) {
        itemCountEl.textContent = `${itemCount} item${itemCount !== 1 ? 's' : ''}`;
    }

    // Update cart badge
    if (typeof CartService !== 'undefined') {
        CartService.updateCartBadge(itemCount);
    }
}
