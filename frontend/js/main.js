/* ============================================================
   main.js – Global initialisation: header, cart sidebar, reveal
   ============================================================ */

document.addEventListener('DOMContentLoaded', async () => {

  // ── Sticky header scroll shadow ────────────────────────
  const header = document.getElementById('site-header');
  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 10);
    }, { passive: true });
  }

  // ── Mobile nav toggle ──────────────────────────────────
  const navToggle = document.querySelector('.nav-toggle');
  const mobileNav = document.querySelector('.mobile-nav');
  const mobileClose = document.querySelector('.mobile-nav-close');

  navToggle?.addEventListener('click', () => {
    navToggle.classList.toggle('open');
    mobileNav?.classList.toggle('open');
    document.body.style.overflow = mobileNav?.classList.contains('open') ? 'hidden' : '';
  });
  mobileClose?.addEventListener('click', closeNav);
  mobileNav?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeNav));

  function closeNav() {
    navToggle?.classList.remove('open');
    mobileNav?.classList.remove('open');
    document.body.style.overflow = '';
  }

  // ── Active nav link ────────────────────────────────────
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.main-nav a, .mobile-nav a').forEach(a => {
    const href = a.getAttribute('href') || '';
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });

  // ── Announcement bar close ─────────────────────────────
  document.querySelector('.announcement-close')?.addEventListener('click', function () {
    document.getElementById('announcement-bar')?.remove();
  });

  // ── Cart sidebar ───────────────────────────────────────
  const cartBtn     = document.querySelector('#cart-btn');
  const cartSidebar = document.getElementById('cart-sidebar');
  const cartOverlay = document.getElementById('cart-overlay');
  const cartClose   = document.getElementById('cart-close');

  function openCart() {
    cartSidebar?.classList.add('open');
    cartOverlay?.classList.add('open');
    document.body.style.overflow = 'hidden';
    renderCartSidebar();
  }
  function closeCart() {
    cartSidebar?.classList.remove('open');
    cartOverlay?.classList.remove('open');
    document.body.style.overflow = '';
  }

  cartBtn?.addEventListener('click', openCart);
  cartClose?.addEventListener('click', closeCart);
  cartOverlay?.addEventListener('click', closeCart);

  function renderCartSidebar() {
    const body  = document.getElementById('cart-body');
    const total = document.getElementById('cart-total');
    if (!body) return;
    const items = window.Cart.get();
    if (!items.length) {
      body.innerHTML = `<div class="cart-empty">
        <div style="font-size:3rem;margin-bottom:1rem">🛒</div>
        <h4>Your cart is empty</h4>
        <p style="font-size:.875rem;color:var(--clr-gray-500);margin-top:.5rem">Browse our products and add something!</p>
        <a href="services.html" class="btn btn--primary btn--sm" style="margin-top:1rem">Shop Now</a>
      </div>`;
    } else {
      body.innerHTML = items.map(item => `
        <div class="cart-item">
          <img class="cart-item-img" src="${item.image || ''}" alt="${item.name}"
               onerror="this.src='https://via.placeholder.com/80x80?text=SKAY'">
          <div>
            <div class="cart-item-name">${item.name}</div>
            <div class="cart-item-meta">
              ${item.selectedSize ? `Size: ${item.selectedSize} · ` : ''}
              ${item.selectedColor ? `Color: ${item.selectedColor} · ` : ''}
              Qty: <input type="number" min="1" value="${item.quantity}"
                style="width:3.5rem;border:1px solid #e5e7eb;border-radius:.25rem;padding:.1rem .35rem;font-size:.8rem"
                onchange="window.Cart.updateQty('${item.id}', parseInt(this.value) || 1); renderCartSidebar && renderCartSidebar()">
            </div>
            <div class="cart-item-price">₹${(item.price * item.quantity).toLocaleString('en-IN')}</div>
          </div>
          <button class="cart-item-remove" onclick="window.Cart.remove('${item.id}')">✕</button>
        </div>`).join('');
    }
    if (total) total.textContent = `₹${window.Cart.total().toLocaleString('en-IN')}`;
  }

  // Re-render sidebar when cart changes
  window.Cart.onChange(() => {
    if (cartSidebar?.classList.contains('open')) renderCartSidebar();
  });

  // ── Scroll reveal ──────────────────────────────────────
  if (window.IntersectionObserver) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('revealed'); obs.unobserve(e.target); }
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
  } else {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('revealed'));
  }

  // ── Quick-view modal close ─────────────────────────────
  document.getElementById('quick-view-modal')?.addEventListener('click', function (e) {
    if (e.target === this) window.closeModal?.(this.id);
  });

  // ── Initialise Auth ────────────────────────────────────
  if (window.Auth) await window.Auth.init();

  // ── Quote Form Handling ────────────────────────────────
  const quoteForm = document.getElementById('quote-form');
  if (quoteForm) {
    console.log('Quote form found, attaching event listener');
    quoteForm.addEventListener('submit', async (e) => {
      console.log('Quote form submit event fired');
      e.preventDefault();
      console.log('Quote form submitted');
      
      const submitBtn = document.getElementById('quote-submit');
      const alertDiv = document.getElementById('quote-alert');
      const successDiv = document.getElementById('quote-success');
      
      // Clear previous alerts
      if (alertDiv) alertDiv.innerHTML = '';
      if (successDiv) successDiv.style.display = 'none';
      
      // Disable submit button
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';
      }
      
      try {
        // Collect form data - map form fields to backend expected format
        const formData = {
          name: document.getElementById('q-name')?.value?.trim(),
          email: document.getElementById('q-email')?.value?.trim(),
          phone: document.getElementById('q-phone')?.value?.trim(),
          productType: document.getElementById('q-product')?.value,
          quantity: document.getElementById('q-qty')?.value,
          description: [
            document.getElementById('q-desc')?.value?.trim(),
            document.getElementById('q-print')?.value ? `Print Method: ${document.getElementById('q-print')?.value}` : '',
            document.getElementById('q-deadline')?.value ? `Deadline: ${document.getElementById('q-deadline')?.value}` : '',
            document.getElementById('q-budget')?.value ? `Budget: ${document.getElementById('q-budget')?.value}` : '',
            document.getElementById('q-company')?.value?.trim() ? `Company: ${document.getElementById('q-company')?.value?.trim()}` : '',
          ].filter(Boolean).join('\n'),
        };
        
        // Validate required fields
        if (!formData.name || !formData.email || !formData.productType) {
          throw new Error('Please fill in all required fields (Name, Email, Product Type)');
        }
        
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
          throw new Error('Please enter a valid email address');
        }
        
        console.log('Form data:', formData);
        console.log('API object exists:', !!window.API);
        console.log('API services exists:', !!window.API?.services);
        console.log('API submitQuote exists:', typeof window.API?.services?.submitQuote);
        
        if (!window.API || !window.API.services || !window.API.services.submitQuote) {
          throw new Error('API not available. Please refresh the page and try again.');
        }
        
        // Submit quote
        const response = await window.API.services.submitQuote(formData);
        console.log('API response:', response);
        
        // Show success
        if (successDiv) successDiv.style.display = 'block';
        if (quoteForm) quoteForm.style.display = 'none';
        
        console.log('Quote submitted successfully:', response);
        
      } catch (error) {
        console.error('Quote submission failed:', error);
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          name: error.name,
          type: typeof error
        });
        
        let errorMessage = 'Unable to submit quote request at this time. Please try again later.';
        
        if (error && error.message) {
          if (error.message.includes('fill in all required fields')) {
            errorMessage = error.message;
          } else if (error.message.includes('valid email')) {
            errorMessage = error.message;
          } else if (error.message.includes('API not available')) {
            errorMessage = error.message;
          } else {
            errorMessage += ` (${error.message})`;
          }
        } else if (error) {
          errorMessage += ` (${error.name || 'Unknown error'})`;
        }
        
        // Show error message
        if (alertDiv) {
          alertDiv.innerHTML = `
            <div style="background:#fee2e2;border:1px solid #fecaca;color:#dc2626;padding:1rem;border-radius:.5rem;margin-bottom:1rem">
              <strong>${errorMessage}</strong>
              <br><small>Check browser console (F12) for technical details</small>
            </div>
          `;
        }
      } finally {
        // Re-enable submit button
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Submit Quote Request →';
        }
      }
    });
  }

  console.log('✅ SKAY frontend ready');
});

// Expose renderCartSidebar globally for re-use
window.renderCartSidebar = function () {
  const body  = document.getElementById('cart-body');
  const total = document.getElementById('cart-total');
  if (!body) return;
  const items = window.Cart?.get() || [];
  if (!items.length) {
    body.innerHTML = `<div class="cart-empty"><div style="font-size:3rem;margin-bottom:1rem">🛒</div><h4>Your cart is empty</h4></div>`;
  } else {
    body.innerHTML = items.map(item => `
      <div class="cart-item">
        <img class="cart-item-img" src="${item.image || ''}" alt="${item.name}"
             onerror="this.src='https://via.placeholder.com/80?text=S'">
        <div>
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-meta">${item.selectedSize ? 'Size: '+item.selectedSize+' · ' : ''}Qty: ${item.quantity}</div>
          <div class="cart-item-price">₹${(item.price * item.quantity).toLocaleString('en-IN')}</div>
        </div>
        <button class="cart-item-remove" onclick="window.Cart.remove('${item.id}')">✕</button>
      </div>`).join('');
  }
  if (total) total.textContent = `₹${(window.Cart?.total() || 0).toLocaleString('en-IN')}`;
};
