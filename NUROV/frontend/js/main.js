/* ==========================================================================
   Shared UI: navbar injection, toasts, confirm/info modals, small icon set
   ========================================================================== */

const Icon = {
  cart: `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>`,
  heart: `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.6z"/></svg>`,
  search: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>`,
  check: `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`,
  x: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>`,
  menu: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 12h18M3 6h18M3 18h18"/></svg>`,
  alert: `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`
};

/* ---------------- Navbar ---------------- */
function renderNavbar(activePage){
  const root = document.getElementById('navbar-root');
  if (!root) return;
  const user = Auth.getUser();

  root.innerHTML = `
  <nav class="navbar">
    <div class="container">
      <a href="index.html" class="brand"><span class="brand-mark">B</span><span id="nav-brand-name">Business Commerce</span></a>
      <div class="nav-links">
        <a href="index.html" data-page="home">Асосӣ</a>
        <a href="products.html" data-page="products">Маҳсулот</a>
        ${user ? '<a href="orders.html" data-page="orders">Фармоишҳо</a>' : ''}
        ${user && user.role === 'admin' ? '<a href="admin.html" data-page="admin">Админ</a>' : ''}
      </div>
      <div class="nav-actions">
        <a href="products.html" class="icon-btn" title="Ҷустуҷӯ">${Icon.search}</a>
        ${user ? `
          <a href="cart.html" class="icon-btn" title="Сабад">${Icon.cart}<span class="badge-count" id="cart-badge" style="display:none">0</span></a>
          <a href="profile.html" title="Профил">${user.avatar_url ? `<img class="avatar" src="${user.avatar_url}">` : `<span class="avatar" style="display:flex;align-items:center;justify-content:center;font-weight:700;color:var(--primary)">${(user.name||'U')[0].toUpperCase()}</span>`}</a>
        ` : `
          <a href="login.html" class="btn btn-ghost btn-sm">Воридшавӣ</a>
          <a href="register.html" class="btn btn-primary btn-sm">Сабти ном</a>
        `}
        <button class="icon-btn hamburger" id="hamburger-btn">${Icon.menu}</button>
      </div>
    </div>
  </nav>`;

  const activeLink = root.querySelector(`[data-page="${activePage}"]`);
  if (activeLink) activeLink.classList.add('active');

  if (user){
    Api.getCart().then(({ items }) => {
      const badge = document.getElementById('cart-badge');
      const count = items.reduce((s, i) => s + i.quantity, 0);
      if (badge && count > 0){ badge.style.display = 'flex'; badge.textContent = count; }
    }).catch(() => {});
  }

  // apply saved theme / brand name if available
  Api.getSettings().then(({ settings }) => {
    if (!settings) return;
    if (settings.company_name){
      document.querySelectorAll('#nav-brand-name, .site-brand-name').forEach(el => el.textContent = settings.company_name);
    }
    if (settings.primary_color) document.documentElement.style.setProperty('--primary', settings.primary_color);
    if (settings.accent_color) document.documentElement.style.setProperty('--accent', settings.accent_color);
  }).catch(() => {});
}

/* ---------------- Footer ---------------- */
function renderFooter(){
  const root = document.getElementById('footer-root');
  if (!root) return;
  root.innerHTML = `
  <footer class="site-footer">
    <div class="container">
      <div class="footer-grid">
        <div>
          <div class="brand" style="color:#fff;margin-bottom:14px;"><span class="brand-mark">B</span><span class="site-brand-name">Business Commerce</span></div>
          <p style="color:#9694B8;max-width:280px;">Платформаи савдои электронӣ барои бизнеси шумо — фаврӣ, боэътимод ва муосир.</p>
        </div>
        <div>
          <h4>Ширкат</h4>
          <a href="#">Дар бораи мо</a>
          <a href="#">Ҳамкорон</a>
          <a href="#">Вакансияҳо</a>
        </div>
        <div>
          <h4>Дастгирӣ</h4>
          <a href="#">Тамос бо мо</a>
          <a href="#">Саволҳои маъмул</a>
          <a href="orders.html">Пайгирии фармоиш</a>
        </div>
        <div>
          <h4>Ҳуқуқӣ</h4>
          <a href="#">Шартҳои истифода</a>
          <a href="#">Сиёсати махфият</a>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© ${new Date().getFullYear()} Business Commerce. Ҳамаи ҳуқуқҳо ҳифзшудаанд.</span>
        <span>Сохта бо Inter &amp; Poppins</span>
      </div>
    </div>
  </footer>`;
}

/* ---------------- Toasts ---------------- */
function ensureToastStack(){
  let stack = document.querySelector('.toast-stack');
  if (!stack){
    stack = document.createElement('div');
    stack.className = 'toast-stack';
    document.body.appendChild(stack);
  }
  return stack;
}
function toast(message, type = ''){
  const stack = ensureToastStack();
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span>${message}</span>`;
  stack.appendChild(el);
  setTimeout(() => {
    el.style.transition = 'opacity .25s ease, transform .25s ease';
    el.style.opacity = '0';
    el.style.transform = 'translateX(20px)';
    setTimeout(() => el.remove(), 250);
  }, 3200);
}

/* ---------------- Popup / Modal ---------------- */
function ensureModalRoot(){
  let root = document.getElementById('modal-root');
  if (!root){
    root = document.createElement('div');
    root.id = 'modal-root';
    document.body.appendChild(root);
  }
  return root;
}

function showModal({ icon = 'check', title, message, actions = [] }){
  const root = ensureModalRoot();
  const iconMarkup = icon === 'error' ? Icon.alert : Icon.check;
  const iconClass = icon === 'error' ? 'error' : '';

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true">
      <button class="modal-close" aria-label="Пӯшидан">${Icon.x}</button>
      <div class="modal-icon ${iconClass}">${iconMarkup}</div>
      <h3>${title}</h3>
      ${message ? `<p>${message}</p>` : ''}
      <div class="modal-actions"></div>
    </div>`;
  root.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('open'));

  const close = () => {
    overlay.classList.remove('open');
    setTimeout(() => overlay.remove(), 220);
  };
  overlay.querySelector('.modal-close').addEventListener('click', close);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

  const actionsWrap = overlay.querySelector('.modal-actions');
  if (actions.length === 0){
    const btn = document.createElement('button');
    btn.className = 'btn btn-primary btn-block';
    btn.textContent = 'Хуб';
    btn.addEventListener('click', close);
    actionsWrap.appendChild(btn);
  } else {
    actions.forEach(a => {
      const btn = document.createElement('button');
      btn.className = `btn ${a.className || 'btn-primary'} btn-block`;
      btn.textContent = a.label;
      btn.addEventListener('click', () => { if (a.onClick) a.onClick(); close(); });
      actionsWrap.appendChild(btn);
    });
  }
  return close;
}

function confirmModal({ title, message, confirmLabel = 'Тасдиқ', onConfirm }){
  showModal({
    icon: 'error',
    title,
    message,
    actions: [
      { label: 'Бекор кардан', className: 'btn-ghost', onClick: () => {} },
      { label: confirmLabel, className: 'btn-danger', onClick: onConfirm }
    ]
  });
}

/* ---------------- Mobile menu ---------------- */
document.addEventListener('click', (e) => {
  if (e.target.closest('#hamburger-btn')){
    const links = document.querySelector('.nav-links');
    if (links){
      const isOpen = links.style.display === 'flex';
      links.style.cssText = isOpen ? '' : 'display:flex; flex-direction:column; position:absolute; top:76px; left:0; right:0; background:var(--surface); padding:16px 24px; box-shadow: var(--shadow-md); border-bottom:1px solid var(--border);';
    }
  }
});

/* ---------------- Star rating helper ---------------- */
function starString(rating){
  const full = Math.round(rating);
  return '★'.repeat(full) + '☆'.repeat(5 - full);
}

/* ---------------- Currency helper ---------------- */
function money(v){
  return `${Number(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TJS`;
}

/* ---------------- Logout ---------------- */
function logout(){
  Auth.clear();
  window.location.href = 'login.html';
}
