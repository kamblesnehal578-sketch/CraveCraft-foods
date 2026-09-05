/* ============================================================
   CraveCraft — app.js
   Features:
   1. Working Add to Cart (dynamic items, badge, totals)
   2. Quantity controls (+ / − in cart)
   3. Toast notifications
   4. Search / Filter menu
   5. Light / Dark mode toggle
   6. Login form validation (index.html)
   7. Favourites / Wishlist (heart button)
   8. Smooth scroll & active nav highlight
   ============================================================ */

'use strict';

/* ─────────────────────────────────────────────
   CART STATE
   ───────────────────────────────────────────── */
let cart = [];
const DELIVERY_FEE  = 3.99;
const TAX_RATE      = 0.08;
const DISCOUNT_CODE = 'CRAVE10';
const DISCOUNT_RATE = 0.10;
let appliedDiscount = false;

/* ─────────────────────────────────────────────
   1 & 2. ADD TO CART + QUANTITY CONTROLS
   ───────────────────────────────────────────── */
function initCart() {
  const cartSection = document.getElementById('cart');
  if (!cartSection) return;

  cartSection.innerHTML = `
    <div class="shopping-cart-component" id="cart-component">
      <div class="cart-header-row">
        <h2>Your Shopping Cart</h2>
        <span class="cart-badge-inline" id="cart-count-inline">0 items</span>
      </div>
      <div id="cart-empty-msg" class="cart-empty">
        <span class="cart-empty-icon">🍽️</span>
        <p>Your cart is empty. Add something delicious!</p>
      </div>
      <table class="cart-table" id="cart-table" style="display:none">
        <thead>
          <tr>
            <th>Item</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Total</th>
            <th></th>
          </tr>
        </thead>
        <tbody id="cart-body"></tbody>
        <tfoot id="cart-foot"></tfoot>
      </table>
      <div class="promo-row" id="promo-row" style="display:none">
        <input type="text" id="promo-input" placeholder='Promo code e.g. "CRAVE10"' />
        <button type="button" id="promo-btn" class="btn btn-secondary promo-apply-btn">Apply</button>
        <span id="promo-msg"></span>
      </div>
      <div class="cart-actions" id="cart-actions" style="display:none">
        <button type="button" class="btn btn-secondary btn-close-cart" id="clear-cart-btn">🗑️ Clear Cart</button>
        <button type="button" class="btn btn-primary" id="checkout-btn">Proceed to Checkout →</button>
      </div>
    </div>
  `;

  document.getElementById('clear-cart-btn').addEventListener('click', clearCart);
  document.getElementById('promo-btn').addEventListener('click', applyPromo);
  document.getElementById('checkout-btn').addEventListener('click', () => {
    showToast('🎉 Order placed! Thank you for choosing CraveCraft.', 'success');
    clearCart();
  });

  document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      const card  = btn.closest('.food-card');
      const name  = card.querySelector('.food-title').textContent.trim();
      const price = parseFloat(card.querySelector('.food-price').textContent.replace('$', ''));
      const id    = name.toLowerCase().replace(/\s+/g, '-');
      addToCart({ id, name, price });
    });
  });
}

function addToCart(item) {
  const existing = cart.find(c => c.id === item.id);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ ...item, qty: 1 });
  }
  renderCart();
  updateCartBadge();
  showToast(`✅ "${item.name}" added to cart!`, 'success');
  document.getElementById('cart').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function removeFromCart(id) {
  cart = cart.filter(c => c.id !== id);
  renderCart();
  updateCartBadge();
}

function changeQty(id, delta) {
  const item = cart.find(c => c.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) { removeFromCart(id); return; }
  renderCart();
  updateCartBadge();
}

function clearCart() {
  cart = [];
  appliedDiscount = false;
  renderCart();
  updateCartBadge();
  showToast('🗑️ Cart cleared.', 'info');
}

function applyPromo() {
  const code = document.getElementById('promo-input').value.trim().toUpperCase();
  const msg  = document.getElementById('promo-msg');
  if (code === DISCOUNT_CODE) {
    appliedDiscount = true;
    msg.textContent  = '✅ 10% discount applied!';
    msg.style.color  = '#16a34a';
    renderCart();
    showToast('🎟️ Promo CRAVE10 applied — 10% off!', 'success');
  } else {
    msg.textContent = '❌ Invalid code.';
    msg.style.color = '#dc2626';
  }
}

function renderCart() {
  const tbody      = document.getElementById('cart-body');
  const tfoot      = document.getElementById('cart-foot');
  const table      = document.getElementById('cart-table');
  const emptyMsg   = document.getElementById('cart-empty-msg');
  const actions    = document.getElementById('cart-actions');
  const promoRow   = document.getElementById('promo-row');
  const countLabel = document.getElementById('cart-count-inline');
  if (!tbody) return;

  const totalQty = cart.reduce((s, c) => s + c.qty, 0);

  if (cart.length === 0) {
    table.style.display    = 'none';
    emptyMsg.style.display = 'flex';
    actions.style.display  = 'none';
    promoRow.style.display = 'none';
    countLabel.textContent = '0 items';
    return;
  }

  table.style.display    = 'table';
  emptyMsg.style.display = 'none';
  actions.style.display  = 'flex';
  promoRow.style.display = 'flex';
  countLabel.textContent = `${totalQty} item${totalQty !== 1 ? 's' : ''}`;

  tbody.innerHTML = cart.map(item => `
    <tr>
      <td><strong>${item.name}</strong></td>
      <td>
        <div class="qty-controls">
          <button class="qty-btn" onclick="changeQty('${item.id}', -1)">−</button>
          <span class="qty-value">${item.qty}</span>
          <button class="qty-btn" onclick="changeQty('${item.id}', 1)">+</button>
        </div>
      </td>
      <td>$${item.price.toFixed(2)}</td>
      <td>$${(item.price * item.qty).toFixed(2)}</td>
      <td><button class="remove-btn" onclick="removeFromCart('${item.id}')" title="Remove">✕</button></td>
    </tr>
  `).join('');

  const subtotal   = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const discount   = appliedDiscount ? subtotal * DISCOUNT_RATE : 0;
  const tax        = (subtotal - discount) * TAX_RATE;
  const grandTotal = subtotal - discount + DELIVERY_FEE + tax;

  tfoot.innerHTML = `
    <tr class="summary-row"><td colspan="4">Subtotal</td><td>$${subtotal.toFixed(2)}</td></tr>
    ${discount > 0 ? `<tr class="summary-row discount-row"><td colspan="4">Discount (CRAVE10 −10%)</td><td>−$${discount.toFixed(2)}</td></tr>` : ''}
    <tr class="summary-row"><td colspan="4">Delivery Fee</td><td>$${DELIVERY_FEE.toFixed(2)}</td></tr>
    <tr class="summary-row"><td colspan="4">Tax (8%)</td><td>$${tax.toFixed(2)}</td></tr>
    <tr class="summary-row total-row"><td colspan="4"><strong>Grand Total</strong></td><td><strong>$${grandTotal.toFixed(2)}</strong></td></tr>
  `;
}

function updateCartBadge() {
  const totalQty = cart.reduce((s, c) => s + c.qty, 0);
  let badge = document.getElementById('cart-nav-badge');
  if (!badge) {
    const navUl = document.querySelector('#main-navigation ul');
    if (!navUl) return;
    const li = document.createElement('li');
    li.className = 'listitem';
    li.innerHTML = `<a href="#cart" class="nav-link cart-nav-link">🛒 Cart <span class="nav-cart-badge" id="cart-nav-badge">0</span></a>`;
    navUl.insertBefore(li, navUl.querySelector('li:last-child'));
    badge = document.getElementById('cart-nav-badge');
  }
  badge.textContent   = totalQty;
  badge.style.display = totalQty > 0 ? 'inline-flex' : 'none';
}

/* ─────────────────────────────────────────────
   3. TOAST NOTIFICATIONS
   ───────────────────────────────────────────── */
function showToast(message, type) {
  if (typeof type === 'undefined') type = 'info';
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = 'toast toast-' + type;
  toast.textContent = message;
  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('toast-visible'));
  setTimeout(() => {
    toast.classList.remove('toast-visible');
    toast.addEventListener('transitionend', () => toast.remove());
  }, 3200);
}

/* ─────────────────────────────────────────────
   4. SEARCH & FILTER
   ───────────────────────────────────────────── */
function initSearchFilter() {
  const main = document.querySelector('main');
  if (!main) return;
  const searchBar = document.createElement('div');
  searchBar.className = 'search-filter-bar';
  searchBar.innerHTML = `
    <div class="search-input-wrap">
      <span class="search-icon">🔍</span>
      <input type="text" id="search-input" placeholder="Search dishes, cuisines…" autocomplete="off" />
    </div>
    <div class="filter-chips" id="filter-chips">
      <button class="chip active" data-filter="all">All</button>
      <button class="chip" data-filter="veg">🌿 Veg</button>
      <button class="chip" data-filter="nonveg">🍗 Non-Veg</button>
      <button class="chip" data-filter="pizza">Pizza</button>
      <button class="chip" data-filter="burger">Burgers</button>
      <button class="chip" data-filter="pasta">Pasta</button>
      <button class="chip" data-filter="salad">Salads</button>
      <button class="chip" data-filter="dessert">Desserts</button>
    </div>
  `;
  main.insertBefore(searchBar, main.firstChild);

  let activeFilter = 'all';

  document.getElementById('search-input').addEventListener('input', e => {
    filterCards(e.target.value.trim(), activeFilter);
  });
  document.getElementById('filter-chips').addEventListener('click', e => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    activeFilter = chip.dataset.filter;
    filterCards(document.getElementById('search-input').value.trim(), activeFilter);
  });
}

function filterCards(query, filter) {
  const cards = document.querySelectorAll('.food-card');
  let visible = 0;
  cards.forEach(card => {
    const title    = (card.querySelector('.food-title')?.textContent || '').toLowerCase();
    const category = card.dataset.category || '';
    const desc     = (card.querySelector('.food-description')?.textContent || '').toLowerCase();
    const matchQ   = !query || title.includes(query.toLowerCase()) || desc.includes(query.toLowerCase());
    const matchF   = filter === 'all' || category === filter;
    if (matchQ && matchF) { card.style.display = ''; visible++; }
    else { card.style.display = 'none'; }
  });

  let noRes = document.getElementById('no-results-msg');
  if (visible === 0) {
    if (!noRes) {
      noRes = document.createElement('p');
      noRes.id = 'no-results-msg';
      noRes.className = 'no-results';
      noRes.textContent = '😔 No dishes match your search. Try something else!';
      const bar = document.querySelector('.search-filter-bar');
      bar.parentNode.insertBefore(noRes, bar.nextSibling);
    }
    noRes.style.display = 'block';
  } else if (noRes) {
    noRes.style.display = 'none';
  }
}

/* ─────────────────────────────────────────────
   5. DARK MODE TOGGLE
   ───────────────────────────────────────────── */
function initDarkMode() {
  const header = document.querySelector('header');
  if (!header) return;

  const saved = localStorage.getItem('cravecraft-theme');
  if (saved === 'dark') document.documentElement.setAttribute('data-theme', 'dark');

  const toggle = document.createElement('button');
  toggle.id        = 'theme-toggle';
  toggle.className = 'theme-toggle-btn';
  toggle.title     = 'Toggle Dark / Light Mode';
  toggle.innerHTML = document.documentElement.getAttribute('data-theme') === 'dark' ? '☀️' : '🌙';
  header.appendChild(toggle);

  toggle.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
    toggle.innerHTML = isDark ? '🌙' : '☀️';
    localStorage.setItem('cravecraft-theme', isDark ? 'light' : 'dark');
    showToast(isDark ? '☀️ Light mode on' : '🌙 Dark mode on', 'info');
  });
}

/* ─────────────────────────────────────────────
   6. LOGIN FORM VALIDATION
   ───────────────────────────────────────────── */
function initLoginValidation() {
  const form = document.querySelector('.login-form');
  if (!form) return;
  const emailInput = document.getElementById('login-email');
  const passInput  = document.getElementById('login-password');

  form.addEventListener('submit', e => {
    let valid = true;
    clearFieldError(emailInput);
    clearFieldError(passInput);

    if (!emailInput.value.trim()) {
      showFieldError(emailInput, 'Email address is required.'); valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim())) {
      showFieldError(emailInput, 'Please enter a valid email address.'); valid = false;
    }
    if (!passInput.value) {
      showFieldError(passInput, 'Password is required.'); valid = false;
    } else if (passInput.value.length < 4) {
      showFieldError(passInput, 'Password must be at least 4 characters.'); valid = false;
    }

    if (!valid) {
      e.preventDefault();
      showToast('⚠️ Please fix the errors before signing in.', 'error');
    }
  });

  [emailInput, passInput].forEach(inp => {
    inp.addEventListener('input', () => clearFieldError(inp));
  });
}

function showFieldError(input, message) {
  input.classList.add('field-error');
  let err = input.parentElement.querySelector('.field-error-msg');
  if (!err) {
    err = document.createElement('span');
    err.className = 'field-error-msg';
    input.parentElement.appendChild(err);
  }
  err.textContent = message;
}

function clearFieldError(input) {
  input.classList.remove('field-error');
  const err = input.parentElement ? input.parentElement.querySelector('.field-error-msg') : null;
  if (err) err.remove();
}

/* ─────────────────────────────────────────────
   7. FAVOURITES / WISHLIST
   ───────────────────────────────────────────── */
function initFavourites() {
  const saved = JSON.parse(localStorage.getItem('cravecraft-favs') || '[]');
  document.querySelectorAll('.food-card').forEach(card => {
    const title = (card.querySelector('.food-title')?.textContent || '').trim();
    const id    = title.toLowerCase().replace(/\s+/g, '-');
    const heartBtn = document.createElement('button');
    heartBtn.className = 'heart-btn';
    heartBtn.setAttribute('aria-label', 'Toggle favourite');
    heartBtn.innerHTML = saved.includes(id) ? '❤️' : '🤍';
    if (saved.includes(id)) heartBtn.classList.add('active');

    const wrapper = card.querySelector('.food-image-wrapper');
    if (wrapper) wrapper.appendChild(heartBtn);

    heartBtn.addEventListener('click', e => {
      e.stopPropagation();
      e.preventDefault();
      toggleFavourite(id, heartBtn, title);
    });
  });
}

function toggleFavourite(id, btn, name) {
  let favs = JSON.parse(localStorage.getItem('cravecraft-favs') || '[]');
  if (favs.includes(id)) {
    favs = favs.filter(f => f !== id);
    btn.innerHTML = '🤍';
    btn.classList.remove('active');
    showToast('💔 "' + name + '" removed from favourites.', 'info');
  } else {
    favs.push(id);
    btn.innerHTML = '❤️';
    btn.classList.add('active');
    showToast('❤️ "' + name + '" saved to favourites!', 'success');
  }
  localStorage.setItem('cravecraft-favs', JSON.stringify(favs));
}

/* ─────────────────────────────────────────────
   8. ACTIVE NAV HIGHLIGHT ON SCROLL
   ───────────────────────────────────────────── */
function initNavHighlight() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(l => l.classList.remove('active'));
        const link = document.querySelector('.nav-link[href="#' + entry.target.id + '"]');
        if (link) link.classList.add('active');
      }
    });
  }, { rootMargin: '-30% 0px -65% 0px', threshold: 0 });

  sections.forEach(s => observer.observe(s));
}

/* ─────────────────────────────────────────────
   BOOTSTRAP
   ───────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  const isApp   = !!document.getElementById('main-navigation');
  const isLogin = !!document.querySelector('.login-form');

  initDarkMode();

  if (isApp) {
    initCart();
    initSearchFilter();
    initFavourites();
    initNavHighlight();
    updateCartBadge();
    renderCart();
  }
  if (isLogin) {
    initLoginValidation();
  }
});
