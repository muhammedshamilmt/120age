window.Shopify = window.Shopify || {};
Shopify.formatMoney = function(cents, format) {
  if (typeof cents == 'string') { cents = cents.replace('.',''); }
  var value = '';
  var placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
  var formatString = format || '${{amount}}';

  function defaultOption(opt, def) {
     return (typeof opt == 'undefined' ? def : opt);
  }

  function formatWithDelimiters(number, precision, thousands, decimal) {
    precision = defaultOption(precision, 2);
    thousands = defaultOption(thousands, ',');
    decimal   = defaultOption(decimal, '.');

    if (isNaN(number) || number == null) { return 0; }

    number = (number/100.0).toFixed(precision);

    var parts   = number.split('.'),
        dollars = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + thousands),
        cents   = parts[1] ? (decimal + parts[1]) : '';

    return dollars + cents;
  }

  switch(formatString.match(placeholderRegex)[1]) {
    case 'amount':
      value = formatWithDelimiters(cents, 2);
      break;
    case 'amount_no_decimals':
      value = formatWithDelimiters(cents, 0);
      break;
  }

  return formatString.replace(placeholderRegex, value);
};

class CartDrawer {
  constructor() {
    this.drawer = document.getElementById('CartDrawer');
    this.overlay = document.getElementById('CartDrawerOverlay');
    this.closeBtn = document.getElementById('CartDrawerClose');
    this.cartTriggers = document.querySelectorAll('.header__cart, .header__cart-count');
    
    this.init();
  }

  init() {
    if (!this.drawer) return;

    this.cartTriggers.forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        this.open();
      });
    });

    this.closeBtn.addEventListener('click', () => this.close());
    this.overlay.addEventListener('click', () => this.close());

    // Delegate quantity updates
    this.drawer.addEventListener('click', (e) => {
      const btn = e.target.closest('.qty-btn-mini');
      if (btn) {
        const input = btn.parentElement.querySelector('input');
        const id = input.dataset.id;
        let val = parseInt(input.value);
        if (btn.dataset.action === 'increment') val++;
        else val--;
        if (val >= 0) this.updateQuantity(id, val);
      }
    });

    // Listen for AJAX add to cart
    document.addEventListener('cart:item-added', () => {
      this.refresh();
      this.open();
    });
  }

  open() {
    this.drawer.classList.add('cart-drawer--active');
    document.body.style.overflow = 'hidden';
  }

  close() {
    this.drawer.classList.remove('cart-drawer--active');
    document.body.style.overflow = '';
  }

  async updateQuantity(id, qty) {
    try {
      const response = await fetch('/cart/change.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: id, quantity: qty })
      });
      if (response.ok) {
        this.refresh();
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  }

  async refresh() {
    try {
      const response = await fetch(`${window.location.pathname}?section_id=cart-drawer`);
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const newContent = doc.getElementById('CartDrawerContent');
      const newFooter = doc.querySelector('.cart-drawer__footer');
      
      document.getElementById('CartDrawerContent').innerHTML = newContent.innerHTML;
      
      const footer = document.querySelector('.cart-drawer__footer');
      if (newFooter && footer) {
        footer.innerHTML = newFooter.innerHTML;
      } else if (newFooter) {
        this.drawer.querySelector('.cart-drawer__inner').appendChild(newFooter);
      } else if (footer) {
        footer.remove();
      }

      // Update Header Cart Count
      this.updateHeaderCount();
    } catch (error) {
      console.error('Error refreshing cart drawer:', error);
    }
  }

  async updateHeaderCount() {
    const res = await fetch('/cart.js');
    const cart = await res.json();
    document.querySelectorAll('.header__cart-count').forEach(el => {
      el.textContent = cart.item_count;
    });
  }
}

// Global AJAX Handle for forms
document.addEventListener('submit', async (e) => {
  if (e.target.action && e.target.action.includes('/cart/add')) {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
      const response = await fetch('/cart/add.js', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        document.dispatchEvent(new CustomEvent('cart:item-added'));
      } else {
        const error = await response.json();
        alert(error.description || 'Error adding to cart');
      }
    } catch (error) {
      console.error('Add to cart error:', error);
    }
  }
});

document.addEventListener('DOMContentLoaded', () => {
  window.cartDrawer = new CartDrawer();
});
