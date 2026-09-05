'use strict';

/* ─────────────────────────────────────────────
   MOCK DATA
   ───────────────────────────────────────────── */
const MOCK_ORDER_HISTORY = [
  {
    id: 'CC-20260901-084',
    date: 'Sep 01, 2026',
    status: 'delivered',
    items: [
      { name: 'Chicken Biryani', qty: 1, price: 249 },
      { name: 'Garlic Naan', qty: 2, price: 40 }
    ],
    total: 329,
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=300&q=80' // Biryani
  },
  {
    id: 'CC-20260825-112',
    date: 'Aug 25, 2026',
    status: 'delivered',
    items: [
      { name: 'Wood-Fired Margherita Pizza', qty: 1, price: 14.99 },
      { name: 'Tiramisu Classico', qty: 1, price: 7.25 }
    ],
    total: 22.24,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=300&q=80'
  },
  {
    id: 'CC-20260810-045',
    date: 'Aug 10, 2026',
    status: 'cancelled',
    items: [
      { name: 'Classic Gourmet Beef Burger', qty: 2, price: 13.99 }
    ],
    total: 27.98,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=300&q=80'
  }
];

/* ─────────────────────────────────────────────
   1. LIVE TRACKING LOGIC
   ───────────────────────────────────────────── */
let trackInterval = null;
let currentStep = 0;
let trackSpeed = 4000; // ms per step

const stepMessages = [
  "Your order has been placed successfully!",
  "The chef is preparing your meal with care.",
  "Your food is on the way! Track the rider.",
  "Delivered! Enjoy your meal."
];

function initTracking() {
  resetTracking();
}

function startTrackingSimulation() {
  if (trackInterval) clearInterval(trackInterval);
  
  if (currentStep >= 3) return; // Already delivered

  trackInterval = setInterval(() => {
    if (currentStep < 3) {
      currentStep++;
      updateTrackingUI();
    } else {
      clearInterval(trackInterval);
    }
  }, trackSpeed);
}

function updateTrackingUI() {
  // Update Steps
  for (let i = 0; i <= 3; i++) {
    const stepEl = document.getElementById(`step-${i}`);
    const connEl = document.getElementById(`conn-${i}`);
    const timeEl = document.getElementById(`step-time-${i}`);
    
    if (i < currentStep) {
      // Completed step
      stepEl.className = 'track-step completed';
      if (connEl) connEl.className = 'track-connector completed';
      if (!timeEl.textContent) timeEl.textContent = getFormattedTime(-((currentStep - i) * 5)); 
    } else if (i === currentStep) {
      // Active step
      stepEl.className = 'track-step active';
      if (connEl) connEl.className = 'track-connector active';
      timeEl.textContent = getFormattedTime(0);
    } else {
      // Pending step
      stepEl.className = 'track-step';
      if (connEl) connEl.className = 'track-connector';
      timeEl.textContent = '';
    }
  }

  // Update Status Text
  document.getElementById('status-text').textContent = stepMessages[currentStep];

  // Update ETA
  const etaEl = document.getElementById('eta-time');
  if (currentStep === 3) {
    etaEl.textContent = 'Delivered';
    etaEl.style.color = 'var(--success)';
  } else {
    etaEl.textContent = `~${28 - (currentStep * 8)} min`;
    etaEl.style.color = 'var(--primary)';
  }
}

function setTrackSpeed(speed) {
  trackSpeed = speed;
  
  // Update active button state
  document.querySelectorAll('.demo-btn').forEach(btn => btn.classList.remove('active'));
  if (speed === 4000) document.getElementById('demo-slow').classList.add('active');
  if (speed === 1500) document.getElementById('demo-fast').classList.add('active');
  if (speed === 600)  document.getElementById('demo-instant').classList.add('active');
  
  // Restart simulation with new speed if not finished
  if (currentStep < 3) {
    startTrackingSimulation();
  }
}

function resetTracking() {
  if (trackInterval) clearInterval(trackInterval);
  currentStep = 0;
  
  // Reset UI
  for (let i = 0; i <= 3; i++) {
    document.getElementById(`step-${i}`).className = i === 0 ? 'track-step active' : 'track-step';
    const conn = document.getElementById(`conn-${i}`);
    if (conn) conn.className = 'track-connector';
    document.getElementById(`step-time-${i}`).textContent = i === 0 ? getFormattedTime(0) : '';
  }
  
  document.getElementById('status-text').textContent = stepMessages[0];
  document.getElementById('eta-time').textContent = '~28 min';
  document.getElementById('eta-time').style.color = 'var(--primary)';
  
  startTrackingSimulation();
}

function getFormattedTime(minuteOffset = 0) {
  const now = new Date();
  now.setMinutes(now.getMinutes() + minuteOffset);
  let hours = now.getHours();
  let minutes = now.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; 
  minutes = minutes < 10 ? '0' + minutes : minutes;
  return hours + ':' + minutes + ' ' + ampm;
}

/* ─────────────────────────────────────────────
   2. ORDER HISTORY LOGIC
   ───────────────────────────────────────────── */
function initOrderHistory() {
  renderOrderHistory('all');

  // Setup Tabs
  document.getElementById('history-tabs').addEventListener('click', (e) => {
    if (e.target.classList.contains('htab')) {
      document.querySelectorAll('.htab').forEach(btn => btn.classList.remove('active'));
      e.target.classList.add('active');
      renderOrderHistory(e.target.dataset.status);
    }
  });
}

function renderOrderHistory(filterStatus) {
  const listEl = document.getElementById('history-list');
  const emptyEl = document.getElementById('history-empty');
  listEl.innerHTML = '';

  const filteredOrders = MOCK_ORDER_HISTORY.filter(order => 
    filterStatus === 'all' || order.status === filterStatus
  );

  if (filteredOrders.length === 0) {
    listEl.style.display = 'none';
    emptyEl.style.display = 'flex';
    return;
  }

  listEl.style.display = 'flex';
  emptyEl.style.display = 'none';

  filteredOrders.forEach(order => {
    const isCurrencyINR = order.items.some(i => i.name.includes('Biryani') || i.name.includes('Naan'));
    const currSymbol = isCurrencyINR ? '₹' : '$';

    const card = document.createElement('div');
    card.className = 'history-card';
    card.innerHTML = `
      <div class="hcard-img-wrap">
        <img src="${order.image}" alt="${order.items[0].name}" class="hcard-img" />
      </div>
      <div class="hcard-content">
        <div class="hcard-header">
          <div>
            <h4 class="hcard-title">${order.items[0].name} ${order.items.length > 1 ? `+ ${order.items.length - 1} more` : ''}</h4>
            <p class="hcard-meta">Order ${order.id} • ${order.date}</p>
          </div>
          <span class="status-badge status-${order.status}">
            ${order.status === 'delivered' ? 'Delivered ✓' : 'Cancelled ✕'}
          </span>
        </div>
        <div class="hcard-items">
          ${order.items.map(item => `<span>${item.qty} × ${item.name}</span>`).join('<br>')}
        </div>
        <div class="hcard-footer">
          <span class="hcard-total">Total: ${currSymbol}${order.total.toFixed(2)}</span>
          <div class="hcard-actions">
            <button class="btn btn-secondary btn-sm" onclick="viewOrderDetails('${order.id}')">View Details</button>
            ${order.status === 'delivered' ? `<button class="btn btn-primary btn-sm" onclick="reorder('${order.id}')">Reorder 🔄</button>` : ''}
          </div>
        </div>
      </div>
    `;
    listEl.appendChild(card);
  });
}

/* ─────────────────────────────────────────────
   3. REORDER & MODALS
   ───────────────────────────────────────────── */
function reorder(orderId) {
  const order = MOCK_ORDER_HISTORY.find(o => o.id === orderId);
  if (!order) return;

  // In a real app, this would add the items to the global cart array
  // and update the cart UI. Here we just show a toast.
  
  // Try to use app.js toast if available
  if (typeof showToast === 'function') {
    showToast(`🔄 Reordered items from ${order.id}! Added to cart.`, 'success');
  } else {
    alert(`Reordered ${order.items[0].name}!`);
  }
}

function viewOrderDetails(orderId) {
  const order = MOCK_ORDER_HISTORY.find(o => o.id === orderId);
  if (!order) return;

  const modal = document.getElementById('order-modal');
  const modalBody = document.getElementById('modal-body');
  
  const isCurrencyINR = order.items.some(i => i.name.includes('Biryani') || i.name.includes('Naan'));
  const currSymbol = isCurrencyINR ? '₹' : '$';

  let itemsHtml = order.items.map(item => `
    <div class="modal-item-row">
      <span>${item.qty} × ${item.name}</span>
      <span>${currSymbol}${(item.price * item.qty).toFixed(2)}</span>
    </div>
  `).join('');

  modalBody.innerHTML = `
    <div class="modal-info-row">
      <span class="text-muted">Order ID:</span>
      <strong>${order.id}</strong>
    </div>
    <div class="modal-info-row">
      <span class="text-muted">Date:</span>
      <strong>${order.date}</strong>
    </div>
    <div class="modal-info-row">
      <span class="text-muted">Status:</span>
      <span class="status-badge status-${order.status}" style="font-size:0.75rem; padding: 2px 8px;">
        ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}
      </span>
    </div>
    
    <div class="modal-divider"></div>
    
    <h4 style="margin-bottom: 12px; font-family: 'Fraunces', serif;">Items</h4>
    ${itemsHtml}
    
    <div class="modal-divider"></div>
    
    <div class="modal-item-row" style="font-weight: 700; font-size: 1.1rem;">
      <span>Total Paid</span>
      <span>${currSymbol}${order.total.toFixed(2)}</span>
    </div>
  `;

  modal.style.display = 'flex';
}

function closeModal(e) {
  if (e.target.id === 'order-modal') {
    document.getElementById('order-modal').style.display = 'none';
  }
}

/* ─────────────────────────────────────────────
   BOOTSTRAP
   ───────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initTracking();
  initOrderHistory();
});
