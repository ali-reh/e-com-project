/**
 * Checkout Page Handler
 * Manages checkout form, order submission, and cart integration
 */

const SHIPPING_COST = 2.99;

document.addEventListener('DOMContentLoaded', async () => {
    // Load cart and populate summary
    await loadOrderSummary();
    
    // Initialize form handlers
    initBillingToggle();
    initFormValidation();
    initOrderSubmission();

    // Signal loading complete
    if (typeof dataLoadComplete === 'function') {
        dataLoadComplete();
    }
});

/**
 * Load cart items into order summary
 */
async function loadOrderSummary() {
    const orderItemsContainer = document.getElementById('order-items');
    const subtotalEl = document.getElementById('subtotal');
    const shippingEl = document.getElementById('shipping-cost');
    const totalEl = document.getElementById('order-total');

    try {
        const cart = await CartService.getCart();

        if (!cart || !cart.items || cart.items.length === 0) {
            // Redirect to cart if empty
            window.location.href = 'cart.html';
            return;
        }

        // Render items
        orderItemsContainer.innerHTML = cart.items.map(item => `
            <div class="order-item">
                <div class="order-item-image">
                    <img src="${item.product?.image_url || '../images/placeholder.jpg'}" alt="${item.product?.name || 'Product'}">
                    <span class="item-quantity-badge">${item.quantity}</span>
                </div>
                <div class="order-item-details">
                    <div class="order-item-name">${item.product?.name || 'Unknown Product'}</div>
                    ${item.size_name ? `<div class="order-item-size">Size: ${item.size_name}</div>` : ''}
                </div>
                <div class="order-item-price">${formatMoney(item.subtotal)}</div>
            </div>
        `).join('');

        // Update totals
        const subtotal = cart.total;
        const total = subtotal + SHIPPING_COST;

        subtotalEl.textContent = formatMoney(subtotal);
        shippingEl.textContent = formatMoney(SHIPPING_COST);
        totalEl.textContent = formatMoney(total);

        // Store cart data for order submission
        window.checkoutCart = cart;

    } catch (error) {
        console.error('Error loading cart:', error);
        showNotification('Error loading cart. Please try again.', 'error');
    }
}

/**
 * Initialize billing address toggle
 */
function initBillingToggle() {
    const billingOptions = document.querySelectorAll('.billing-option');
    const billingForm = document.getElementById('billing-form');

    billingOptions.forEach(option => {
        option.addEventListener('click', () => {
            // Update radio selection
            const radio = option.querySelector('input[type="radio"]');
            radio.checked = true;

            // Update visual selection
            billingOptions.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');

            // Show/hide billing form
            const billingType = option.dataset.billing;
            if (billingType === 'different') {
                billingForm.classList.remove('hidden');
            } else {
                billingForm.classList.add('hidden');
            }
        });
    });
}

/**
 * Initialize form validation
 */
function initFormValidation() {
    const inputs = document.querySelectorAll('.form-control');

    inputs.forEach(input => {
        input.addEventListener('blur', () => {
            validateField(input);
        });

        input.addEventListener('input', () => {
            if (input.classList.contains('error')) {
                validateField(input);
            }
        });
    });
}

/**
 * Validate a single field
 */
function validateField(input) {
    const value = input.value.trim();
    const isOptional = input.placeholder.toLowerCase().includes('optional');

    if (!isOptional && !value) {
        input.classList.add('error');
        return false;
    }

    if (input.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            input.classList.add('error');
            return false;
        }
    }

    if (input.type === 'tel' && value) {
        const phoneRegex = /^[\d\s\+\-\(\)]{7,20}$/;
        if (!phoneRegex.test(value)) {
            input.classList.add('error');
            return false;
        }
    }

    input.classList.remove('error');
    return true;
}

/**
 * Validate all required fields
 */
function validateForm() {
    let isValid = true;
    const errors = [];

    // Required fields
    const requiredFields = [
        { id: 'contact-email', name: 'Email' },
        { id: 'firstname', name: 'First name' },
        { id: 'lastname', name: 'Last name' },
        { id: 'address', name: 'Address' },
        { id: 'city', name: 'City' },
        { id: 'phone', name: 'Phone' }
    ];

    requiredFields.forEach(field => {
        const input = document.getElementById(field.id);
        if (!validateField(input)) {
            isValid = false;
            errors.push(field.name);
        }
    });

    // Check billing fields if different address is selected
    const billingDifferent = document.getElementById('billing-different').checked;
    if (billingDifferent) {
        const billingFields = [
            { id: 'billing-firstname', name: 'Billing first name' },
            { id: 'billing-lastname', name: 'Billing last name' },
            { id: 'billing-address', name: 'Billing address' },
            { id: 'billing-city', name: 'Billing city' },
            { id: 'billing-phone', name: 'Billing phone' }
        ];

        billingFields.forEach(field => {
            const input = document.getElementById(field.id);
            if (!validateField(input)) {
                isValid = false;
                errors.push(field.name);
            }
        });
    }

    if (!isValid) {
        showNotification(`Please fill in: ${errors.slice(0, 3).join(', ')}${errors.length > 3 ? '...' : ''}`, 'error');
    }

    return isValid;
}

/**
 * Initialize order submission
 */
function initOrderSubmission() {
    const desktopBtn = document.getElementById('complete-order-desktop');
    const mobileBtn = document.getElementById('complete-order-mobile');

    const handleSubmit = async (btn) => {
        if (!validateForm()) return;

        btn.disabled = true;
        btn.classList.add('loading');

        try {
            const orderData = collectOrderData();
            
            const response = await fetch('/api/orders/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(orderData)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                // Clear cart
                await CartService.clearCart();

                // Show success modal
                document.getElementById('order-number-display').textContent = result.data.order_number;
                document.getElementById('success-modal').classList.add('show');
            } else {
                throw new Error(result.error || result.message || 'Failed to place order');
            }
        } catch (error) {
            console.error('Order submission error:', error);
            showNotification(error.message || 'Failed to place order. Please try again.', 'error');
            btn.disabled = false;
            btn.classList.remove('loading');
        }
    };

    desktopBtn?.addEventListener('click', () => handleSubmit(desktopBtn));
    mobileBtn?.addEventListener('click', () => handleSubmit(mobileBtn));
}

/**
 * Collect order data from form
 */
function collectOrderData() {
    const cart = window.checkoutCart;
    const useDifferentBilling = document.getElementById('billing-different').checked;

    // Build shipping address
    const shippingAddress = {
        country: document.getElementById('country').value,
        firstName: document.getElementById('firstname').value.trim(),
        lastName: document.getElementById('lastname').value.trim(),
        address: document.getElementById('address').value.trim(),
        apartment: document.getElementById('apartment').value.trim(),
        city: document.getElementById('city').value.trim(),
        postalCode: document.getElementById('postal-code').value.trim(),
        phone: document.getElementById('phone').value.trim()
    };

    // Build billing address
    let billingAddress;
    if (useDifferentBilling) {
        billingAddress = {
            country: document.getElementById('billing-country').value,
            firstName: document.getElementById('billing-firstname').value.trim(),
            lastName: document.getElementById('billing-lastname').value.trim(),
            address: document.getElementById('billing-address').value.trim(),
            apartment: document.getElementById('billing-apartment').value.trim(),
            city: document.getElementById('billing-city').value.trim(),
            postalCode: document.getElementById('billing-postal').value.trim(),
            phone: document.getElementById('billing-phone').value.trim()
        };
    } else {
        billingAddress = { ...shippingAddress };
    }

    // Format addresses as strings
    const formatAddress = (addr) => {
        let parts = [addr.address];
        if (addr.apartment) parts.push(addr.apartment);
        parts.push(addr.city);
        if (addr.postalCode) parts.push(addr.postalCode);
        parts.push(addr.country);
        return parts.join(', ');
    };

    // Build order items
    const items = cart.items.map(item => ({
        product_id: item.product_id,
        product_name: item.product?.name || 'Unknown Product',
        size_name: item.size_name || null,
        quantity: item.quantity,
        unit_price: item.product?.price || 0,
        subtotal: item.subtotal,
        image_url: item.product?.image_url || null
    }));

    return {
        // Customer info
        customer_email: document.getElementById('contact-email').value.trim(),
        customer_name: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
        customer_phone: shippingAddress.phone,

        // Addresses
        shipping_address: formatAddress(shippingAddress),
        billing_address: formatAddress(billingAddress),
        shipping_details: shippingAddress,
        billing_details: billingAddress,

        // Order totals
        subtotal: cart.total,
        shipping_cost: SHIPPING_COST,
        tax: 0,
        total: cart.total + SHIPPING_COST,

        // Items
        items: items,

        // Payment
        payment_method: 'cod'
    };
}

/**
 * Format money
 */
function formatMoney(amount) {
    return '$' + parseFloat(amount).toFixed(2);
}

/**
 * Show notification
 */
function showNotification(message, type = 'success') {
    const existing = document.querySelector('.checkout-notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = `checkout-notification ${type}`;
    notification.innerHTML = `
        <i class="bi ${type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-circle-fill'}"></i>
        <span>${message}</span>
    `;

    document.body.appendChild(notification);

    requestAnimationFrame(() => {
        notification.classList.add('show');
    });

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}
