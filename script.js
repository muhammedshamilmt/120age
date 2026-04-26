// script.js

// Cart State Management
let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];

function saveCart() {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
}

function getCartTotal() {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
}

function getCartCount() {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
}

// Ensure products are consistent 
const productCatalog = {
    1: { id: 1, name: "Eternal Rest Blend", price: 24.00, image: "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=200" },
    2: { id: 2, name: "Daily Defense Drops", price: 38.00, image: "https://images.unsplash.com/photo-1608500218890-c4f8664fdc6c?w=200" },
    3: { id: 3, name: "Sandalwood Cones", price: 18.00, image: "https://images.unsplash.com/photo-1600868735282-3cc1d50c1822?w=200" },
    4: { id: 4, name: "Hand-thrown Clay Mug", price: 42.00, image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=200" }
};

// Global Add To Cart Function
window.addToCart = function(productId) {
    const product = productCatalog[productId];
    if (!product) return;

    const existingItem = cartItems.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cartItems.push({ ...product, quantity: 1 });
    }
    
    saveCart();
    updateCartUI();
    openCartSidebar();
};

window.updateQuantity = function(productId, delta) {
    const item = cartItems.find(item => item.id === productId);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
        window.removeFromCart(productId);
    } else {
        saveCart();
        updateCartUI();
        if(window.renderCheckout) window.renderCheckout();
    }
};

window.removeFromCart = function(productId) {
    cartItems = cartItems.filter(item => item.id !== productId);
    saveCart();
    updateCartUI();
    if(window.renderCheckout) window.renderCheckout();
};

function updateCartUI() {
    const count = getCartCount();
    
    // Update Nav badges
    document.querySelectorAll('#cart-count').forEach(el => el.textContent = count);
    document.querySelectorAll('#cart-badge').forEach(el => {
        el.textContent = count;
        if (count > 0) {
            el.classList.remove('hidden');
        } else {
            el.classList.add('hidden');
        }
    });

    // Render Sidebar Items
    const cartContainer = document.getElementById('cart-sidebar-items');
    const cartFooter = document.getElementById('cart-sidebar-footer');
    
    if (cartContainer) {
        if (cartItems.length === 0) {
            cartContainer.innerHTML = `
                <div class="h-full flex flex-col items-center justify-center text-center space-y-4 pt-12">
                  <div class="w-20 h-20 bg-muted-brown/5 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-muted-brown/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                  </div>
                  <div>
                    <p class="font-ultra text-xl text-muted-brown uppercase">The bag is empty</p>
                    <p class="text-muted-brown/60 text-sm mt-1">Time to add some vintage treasures.</p>
                  </div>
                  <button onclick="closeCartSidebar(); window.location.href='shop.html';" class="mt-4 px-6 py-2 bg-forest-green text-white font-ultra uppercase text-sm hover:scale-105 transition-transform cursor-pointer">
                    Start Shopping
                  </button>
                </div>
            `;
            if (cartFooter) cartFooter.classList.add('hidden');
        } else {
            cartContainer.innerHTML = cartItems.map(item => `
                <div class="flex gap-4 group">
                  <div class="relative w-24 h-24 bg-white border-2 border-muted-brown/20 overflow-hidden shrink-0">
                    <img src="${item.image}" alt="${item.name}" class="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div class="flex-1 flex flex-col">
                    <div class="flex justify-between items-start">
                      <h3 class="font-ultra text-muted-brown uppercase text-sm leading-tight pr-4">
                        ${item.name}
                      </h3>
                      <button onclick="removeFromCart(${item.id})" class="text-muted-brown/40 hover:text-red-500 transition-colors cursor-pointer shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                      </button>
                    </div>
                    <p class="text-forest-green font-bold text-sm mt-1">$${item.price.toFixed(2)}</p>
                    
                    <div class="mt-auto flex items-center justify-between">
                      <div class="flex items-center border border-muted-brown/30 bg-white">
                        <button onclick="updateQuantity(${item.id}, -1)" class="p-1 hover:bg-muted-brown/5 text-muted-brown cursor-pointer">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/></svg>
                        </button>
                        <span class="w-8 text-center text-xs font-bold text-muted-brown">${item.quantity}</span>
                        <button onclick="updateQuantity(${item.id}, 1)" class="p-1 hover:bg-muted-brown/5 text-muted-brown cursor-pointer">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                        </button>
                      </div>
                      <p class="text-muted-brown font-bold text-sm">$${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
            `).join('');
            
            if (cartFooter) {
                cartFooter.classList.remove('hidden');
                const subtotalEl = document.getElementById('cart-sidebar-subtotal');
                if (subtotalEl) subtotalEl.textContent = `$${getCartTotal().toFixed(2)}`;
            }
        }
    }
}

// Sidebar Injection and Logic
function injectCartSidebar() {
    if (document.getElementById('cart-sidebar-overlay')) return; // Already injected

    const sidebarHTML = `
        <!-- Overlay -->
        <div id="cart-sidebar-overlay" onclick="closeCartSidebar()" class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 opacity-0 pointer-events-none transition-opacity duration-300"></div>
        
        <!-- Sidebar -->
        <div id="cart-sidebar" class="fixed right-0 top-0 h-full w-full max-w-md bg-vintage-cream border-l-4 border-muted-brown z-50 flex flex-col shadow-2xl translate-x-full transition-transform duration-300">
            <!-- Header -->
            <div class="p-6 border-b-2 border-muted-brown flex items-center justify-between">
              <div class="flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" class="text-forest-green h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                <h2 class="font-ultra text-2xl text-muted-brown uppercase tracking-tighter mt-1">
                  Your Goods
                </h2>
              </div>
              <button onclick="closeCartSidebar()" class="p-2 hover:bg-muted-brown/10 rounded-full transition-colors group cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-muted-brown group-hover:rotate-90 transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>

            <!-- Items Container -->
            <div id="cart-sidebar-items" class="flex-1 overflow-y-auto p-6 space-y-6">
               <!-- Injected dynamically -->
            </div>

            <!-- Footer -->
            <div id="cart-sidebar-footer" class="p-6 border-t-4 border-muted-brown bg-white space-y-4 hidden">
                <div class="flex justify-between items-end">
                  <span class="text-muted-brown/60 uppercase text-xs tracking-widest font-bold">Subtotal</span>
                  <span id="cart-sidebar-subtotal" class="font-ultra text-3xl text-muted-brown">$0.00</span>
                </div>
                <p class="text-muted-brown/60 text-[10px] uppercase text-center tracking-widest">
                  Shipping and taxes calculated at checkout
                </p>
                <button onclick="alert('Checkout integration in progress.\\nYour subtotal is $' + getCartTotal().toFixed(2))" class="w-full py-4 bg-forest-green text-white font-ultra text-xl uppercase hover:bg-muted-brown transition-colors flex items-center justify-center gap-3 group cursor-pointer text-center">
                  Checkout →
                </button>
                <button onclick="closeCartSidebar()" class="w-full text-center text-muted-brown/40 uppercase text-[10px] tracking-widest font-bold hover:text-muted-brown transition-colors cursor-pointer">
                  Continue Browsing
                </button>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', sidebarHTML);
}

window.openCartSidebar = function() {
    const overlay = document.getElementById('cart-sidebar-overlay');
    const sidebar = document.getElementById('cart-sidebar');
    if (overlay && sidebar) {
        overlay.classList.remove('opacity-0', 'pointer-events-none');
        overlay.classList.add('opacity-100');
        sidebar.classList.remove('translate-x-full');
        sidebar.classList.add('translate-x-0');
    }
}

window.closeCartSidebar = function() {
    const overlay = document.getElementById('cart-sidebar-overlay');
    const sidebar = document.getElementById('cart-sidebar');
    if (overlay && sidebar) {
        overlay.classList.remove('opacity-100');
        overlay.classList.add('opacity-0', 'pointer-events-none');
        sidebar.classList.remove('translate-x-0');
        sidebar.classList.add('translate-x-full');
    }
}

// Checkout Page Specific Render
window.renderCheckout = function() {
    const checkoutItemsContainer = document.getElementById('checkout-items');
    const checkoutSubtotal = document.getElementById('checkout-subtotal');
    const checkoutTaxes = document.getElementById('checkout-taxes');
    const checkoutTotal = document.getElementById('checkout-total');
    const checkoutSummaryContainer = document.getElementById('checkout-summary-container');

    if (checkoutItemsContainer) {
        if (cartItems.length === 0) {
            checkoutSummaryContainer.innerHTML = `
                <div class="text-center py-12">
                    <p class="font-ultra text-xl text-muted-brown uppercase mb-4">Your bag is empty</p>
                    <a href="shop.html" class="inline-block px-6 py-3 bg-forest-green text-white font-ultra uppercase text-sm hover:scale-105 transition-transform cursor-pointer">Return to Shop</a>
                </div>
            `;
            return;
        }

        checkoutItemsContainer.innerHTML = cartItems.map(item => `
            <div class="flex gap-4">
              <div class="relative w-20 h-20 bg-muted-brown/5 border border-muted-brown/20 shrink-0">
                <img src="${item.image}" alt="${item.name}" class="w-full h-full object-cover">
                <div class="absolute -top-2 -right-2 w-5 h-5 bg-forest-green text-white text-[10px] flex items-center justify-center rounded-full font-bold">${item.quantity}</div>
              </div>
              <div class="flex-1">
                <h3 class="font-bold text-muted-brown uppercase text-sm leading-tight">${item.name}</h3>
                <p class="text-muted-brown/60 text-xs mt-1">Item #${item.id}</p>
              </div>
              <p class="font-bold text-muted-brown">$${(item.price * item.quantity).toFixed(2)}</p>
            </div>
        `).join('');

        const subtotal = getCartTotal();
        const taxes = subtotal * 0.085; // 8.5% mock tax
        const total = subtotal + taxes;

        if (checkoutSubtotal) checkoutSubtotal.textContent = `$${subtotal.toFixed(2)}`;
        if (checkoutTaxes) checkoutTaxes.textContent = `$${taxes.toFixed(2)}`;
        if (checkoutTotal) checkoutTotal.textContent = `$${total.toFixed(2)}`;
    }
}


document.addEventListener('DOMContentLoaded', () => {
    // Current Year Update for Footer
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // Inject and Setup Cart
    injectCartSidebar();
    updateCartUI();

    // Nav Cart Button Logic
    document.querySelectorAll('#cart-btn').forEach(btn => {
        // Remove old logic if any, wait, just overwrite click
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            openCartSidebar();
        });
    });

    // Mobile menu toggle
    const menuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }

    // Populate TickerBand repeatedly smoothly
    const tickerContent = document.getElementById('ticker-content');
    if (tickerContent) {
        const tickerItem = `
        <div class="flex items-center mx-4 space-x-12 text-vintage-cream uppercase font-ultra text-2xl tracking-[0.2em] shrink-0">
          <span class="ultra-regular">Eat in Style</span>
          <span class="text-3xl">✦</span>
          <span class="ultra-regular">Move Freely</span>
          <span class="text-3xl">✦</span>
          <span class="ultra-regular">Look Fierce</span>
          <span class="text-3xl">✦</span>
          <span class="ultra-regular">Power the Hustle</span>
          <span class="text-3xl">✦</span>
          <span class="ultra-regular">Confidence</span>
          <span class="text-3xl">✦</span>
        </div>`;
        tickerContent.innerHTML = tickerItem.repeat(15);
    }
});
