// Check if cart exists in localStorage
let cart = JSON.parse(localStorage.getItem('ihbCart')) || [];

document.addEventListener('DOMContentLoaded', () => {
    updateCartUI();
});

// ADD ITEM (With Quantity Check)
function addItemToCart(name, price, option) {
    // Create a unique ID based on the product + option (e.g. "Keyser IHB-1 Day Trial")
    const uniqueId = name + "-" + option;

    // Check if this item is already in the cart
    const existingItem = cart.find(item => item.uniqueId === uniqueId);

    if (existingItem) {
        // If it exists, just add +1 to quantity
        existingItem.quantity += 1;
    } else {
        // If new, push it to cart
        cart.push({
            id: Date.now(), // Internal ID
            uniqueId: uniqueId, // ID for grouping
            name: name,
            price: price,
            option: option,
            quantity: 1
        });
    }
    
    saveCart();
    updateCartUI();
    
    // Open the cart automatically when adding
    const overlay = document.getElementById('cartOverlay');
    if(overlay) overlay.classList.add('open');
}

// CHANGE QUANTITY
function changeQty(uniqueId, change) {
    const itemIndex = cart.findIndex(item => item.uniqueId === uniqueId);

    if (itemIndex > -1) {
        cart[itemIndex].quantity += change;

        // If quantity drops to 0, remove the item
        if (cart[itemIndex].quantity <= 0) {
            cart.splice(itemIndex, 1);
        }
    }
    saveCart();
    updateCartUI();
    
    // Update checkout page if active
    if (typeof loadCheckoutItems === 'function') {
        loadCheckoutItems();
    }
}

// REMOVE ITEM COMPLETELY
function removeItem(uniqueId) {
    cart = cart.filter(item => item.uniqueId !== uniqueId);
    saveCart();
    updateCartUI();
    if (typeof loadCheckoutItems === 'function') {
        loadCheckoutItems();
    }
}

function saveCart() {
    localStorage.setItem('ihbCart', JSON.stringify(cart));
}

// TOGGLE CART
function toggleCart() {
    const overlay = document.getElementById('cartOverlay');
    if(overlay) overlay.classList.toggle('open');
}

// GO TO CHECKOUT
function checkout() {
    if(cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }
    window.location.href = 'checkout.html';
}

// --- UPDATE HTML UI ---
function updateCartUI() {
    const cartItemsContainer = document.getElementById('cartItems');
    const cartCount = document.getElementById('cartCount');
    const cartTotal = document.getElementById('cartTotal');

    // Calculate Totals
    let totalItems = 0;
    let totalPrice = 0;

    cart.forEach(item => {
        totalItems += item.quantity;
        totalPrice += (item.price * item.quantity);
    });

    // Update Badge
    if(cartCount) cartCount.innerText = totalItems;
    if(cartTotal) cartTotal.innerText = '€' + totalPrice.toFixed(2);

    // Render Items
    if(cartItemsContainer) {
        cartItemsContainer.innerHTML = '';

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <div style="text-align:center; padding: 40px 0; opacity:0.5;">
                    <i class="fas fa-shopping-basket" style="font-size: 40px; margin-bottom:10px;"></i>
                    <p>Your cart is empty</p>
                </div>`;
        } else {
            cart.forEach(item => {
                const itemTotal = item.price * item.quantity;
                
                const div = document.createElement('div');
                div.classList.add('cart-item');
                div.innerHTML = `
                    <div class="item-info">
                        <strong>${item.name}</strong>
                        <span class="opt">${item.option}</span>
                        <span class="price-single">€${item.price.toFixed(2)} / unit</span>
                    </div>
                    
                    <div class="item-controls">
                        <!-- QUANTITY SELECTOR -->
                        <div class="qty-selector">
                            <button onclick="changeQty('${item.uniqueId}', -1)">−</button>
                            <span>${item.quantity}</span>
                            <button onclick="changeQty('${item.uniqueId}', 1)">+</button>
                        </div>
                        
                        <div class="price-remove-group">
                            <span class="total-price">€${itemTotal.toFixed(2)}</span>
                            <i class="fas fa-trash remove-icon" onclick="removeItem('${item.uniqueId}')"></i>
                        </div>
                    </div>
                `;
                cartItemsContainer.appendChild(div);
            });
        }
    }
}