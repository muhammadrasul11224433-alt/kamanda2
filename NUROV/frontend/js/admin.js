renderNavbar('admin');
Auth.requireAdmin();

let allCategories = [];

/* ---------------- Section switching ---------------- */
document.querySelectorAll('.admin-nav-link').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelectorAll('.admin-nav-link').forEach(l => l.classList.remove('active'));
    document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
    link.classList.add('active');
    document.getElementById(`section-${link.dataset.section}`).classList.add('active');
    if (link.dataset.section === 'products') loadAdminProducts();
    if (link.dataset.section === 'orders') loadAdminOrders();
    if (link.dataset.section === 'users') loadAdminUsers();
    if (link.dataset.section === 'categories') loadAdminCategories();
    if (link.dataset.section === 'settings') loadSettings();
  });
});

/* ---------------- Dashboard ---------------- */
async function loadDashboard(){
  try{
    const d = await Api.getDashboard();
    document.getElementById('stat-grid').innerHTML = `
      ${statCard('<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>', d.totalRevenue, 'Даромади умумӣ', true)}
      ${statCard('<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v2"/><path d="M3 8h18l-1.5 12.2a2 2 0 0 1-2 1.8H6.5a2 2 0 0 1-2-1.8z"/></svg>', d.totalOrders, 'Шумораи фармоишҳо')}
      ${statCard('<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.9"/><path d="M16 3.1a4 4 0 0 1 0 7.8"/></svg>', d.totalUsers, 'Шумораи корбарон')}
      ${statCard('<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.5 7.3 12 2 3.5 7.3v9.4L12 22l8.5-5.3z"/><path d="M3.5 7.3 12 12l8.5-4.7"/><path d="M12 22V12"/></svg>', d.totalProducts, 'Шумораи маҳсулот')}
    `;

    const maxRevenue = Math.max(...d.salesByDay.map(s => Number(s.revenue)), 1);
    document.getElementById('sales-chart').innerHTML = d.salesByDay.length ? d.salesByDay.map(s => `
      <div class="chart-bar" style="height:${Math.max(6, (Number(s.revenue) / maxRevenue) * 200)}px;" data-value="${money(s.revenue)}"></div>
    `).join('') : '<p style="color:var(--ink-faint);">Ҳанӯз маълумот нест.</p>';

    const statusColors = { Pending:'var(--warning)', Processing:'var(--info)', Shipped:'var(--primary)', Delivered:'var(--success)', Cancelled:'var(--danger)' };
    const totalStatus = d.statusBreakdown.reduce((s, x) => s + x.count, 0) || 1;
    document.getElementById('status-breakdown').innerHTML = d.statusBreakdown.map(s => `
      <div style="margin-bottom:12px;">
        <div class="flex-between" style="font-size:.85rem;margin-bottom:4px;"><span>${s.status}</span><span>${s.count}</span></div>
        <div style="height:8px;border-radius:4px;background:var(--surface-alt);overflow:hidden;">
          <div style="height:100%;width:${(s.count/totalStatus)*100}%;background:${statusColors[s.status] || 'var(--primary)'};"></div>
        </div>
      </div>`).join('') || '<p style="color:var(--ink-faint);">Маълумот нест.</p>';

    document.getElementById('top-products-body').innerHTML = d.topProducts.map(p => `
      <tr><td>${p.title}</td><td>${p.unitsSold} дона</td></tr>
    `).join('') || '<tr><td colspan="2">Маълумот нест.</td></tr>';
  }catch(e){ toast(e.message, 'error'); }
}

function statCard(icon, value, label, isMoney){
  return `<div class="card stat-card">
    <div class="top"><div class="ic" style="background:var(--primary-100);">${icon}</div></div>
    <div class="val">${isMoney ? money(value) : value}</div>
    <div class="lbl">${label}</div>
  </div>`;
}

/* ---------------- Products ---------------- */
async function loadAdminProducts(){
  const body = document.getElementById('admin-products-body');
  body.innerHTML = `<tr><td colspan="6">Боргирӣ...</td></tr>`;
  try{
    const { categories } = await Api.getCategories();
    allCategories = categories;
    document.getElementById('p-category').innerHTML = categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');

    const { products } = await Api.getProducts({ limit: 100 });
    body.innerHTML = products.map(p => {
      const images = typeof p.images === 'string' ? JSON.parse(p.images) : p.images;
      const img = (images && images[0]) || 'https://placehold.co/100x100';
      return `<tr>
        <td><img class="table-thumb" src="${img}"></td>
        <td>${p.title}</td>
        <td>${p.category_name || '—'}</td>
        <td>${money(p.price)}</td>
        <td>${p.stock}</td>
        <td><div class="row-actions">
          <button class="edit-product-btn" data-id="${p.id}" title="Таҳрир"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg></button>
          <button class="delete-product-btn" data-id="${p.id}" title="Нест кардан"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg></button>
        </div></td>
      </tr>`;
    }).join('') || '<tr><td colspan="6">Маҳсулот нест.</td></tr>';

    document.querySelectorAll('.edit-product-btn').forEach(btn => btn.addEventListener('click', () => openProductModal(btn.dataset.id, products)));
    document.querySelectorAll('.delete-product-btn').forEach(btn => btn.addEventListener('click', () => {
      confirmModal({ title: 'Маҳсулотро нест кунем?', message: 'Ин амал бебозгашт аст.', confirmLabel: 'Нест кардан',
        onConfirm: async () => { await Api.deleteProduct(btn.dataset.id); toast('Маҳсулот нест шуд', 'success'); loadAdminProducts(); } });
    }));
  }catch(e){ body.innerHTML = `<tr><td colspan="6">${e.message}</td></tr>`; }
}

function openProductModal(id, productsCache){
  const overlay = document.getElementById('product-modal-overlay');
  const form = document.getElementById('product-form');
  form.reset();
  document.getElementById('p-id').value = '';
  document.getElementById('product-modal-title').textContent = id ? 'Таҳрири маҳсулот' : 'Маҳсулоти нав';

  if (id){
    const p = productsCache.find(x => String(x.id) === String(id));
    if (p){
      document.getElementById('p-id').value = p.id;
      document.getElementById('p-title').value = p.title;
      document.getElementById('p-description').value = p.description || '';
      document.getElementById('p-price').value = p.price;
      document.getElementById('p-compare-price').value = p.compare_price || '';
      document.getElementById('p-stock').value = p.stock;
      document.getElementById('p-category').value = p.category_id || '';
      const images = typeof p.images === 'string' ? JSON.parse(p.images) : p.images;
      document.getElementById('p-image').value = (images && images[0]) || '';
      document.getElementById('p-featured').checked = !!p.is_featured;
    }
  }
  overlay.classList.add('open');
}
document.getElementById('new-product-btn').addEventListener('click', () => openProductModal(null, []));
document.getElementById('product-modal-close').addEventListener('click', () => document.getElementById('product-modal-overlay').classList.remove('open'));
document.getElementById('product-modal-overlay').addEventListener('click', (e) => { if (e.target.id === 'product-modal-overlay') e.currentTarget.classList.remove('open'); });

document.getElementById('product-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('p-id').value;
  const payload = {
    title: document.getElementById('p-title').value.trim(),
    description: document.getElementById('p-description').value.trim(),
    price: Number(document.getElementById('p-price').value),
    compare_price: document.getElementById('p-compare-price').value ? Number(document.getElementById('p-compare-price').value) : null,
    stock: Number(document.getElementById('p-stock').value),
    category_id: document.getElementById('p-category').value || null,
    images: document.getElementById('p-image').value ? [document.getElementById('p-image').value] : [],
    is_featured: document.getElementById('p-featured').checked
  };
  try{
    if (id) await Api.updateProduct(id, payload);
    else await Api.createProduct(payload);
    document.getElementById('product-modal-overlay').classList.remove('open');
    toast('Маҳсулот захира шуд ✓', 'success');
    loadAdminProducts();
  }catch(err){ toast(err.message, 'error'); }
});

/* ---------------- Orders ---------------- */
let currentOrderStatusFilter = '';
document.querySelectorAll('#order-status-tabs button').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#order-status-tabs button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentOrderStatusFilter = btn.dataset.status;
    loadAdminOrders();
  });
});

async function loadAdminOrders(){
  const body = document.getElementById('admin-orders-body');
  body.innerHTML = `<tr><td colspan="5">Боргирӣ...</td></tr>`;
  try{
    const { orders } = await Api.getAllOrders(currentOrderStatusFilter);
    body.innerHTML = orders.map(o => `
      <tr>
        <td>#${o.id}</td>
        <td>${o.customer_name}<br><span style="color:var(--ink-faint);font-size:.8rem;">${o.customer_email}</span></td>
        <td>${money(o.total)}</td>
        <td>${new Date(o.created_at).toLocaleDateString('tg-TJ')}</td>
        <td>
          <select class="status-select" data-id="${o.id}" style="padding:6px 10px;border-radius:8px;border:1.5px solid var(--border-strong);">
            ${['Pending','Processing','Shipped','Delivered','Cancelled'].map(s => `<option value="${s}" ${s === o.status ? 'selected' : ''}>${s}</option>`).join('')}
          </select>
        </td>
      </tr>`).join('') || '<tr><td colspan="5">Фармоиш нест.</td></tr>';

    document.querySelectorAll('.status-select').forEach(sel => {
      sel.addEventListener('change', async () => {
        try{ await Api.updateOrderStatus(sel.dataset.id, sel.value); toast('Статус навсозӣ шуд ✓', 'success'); }
        catch(err){ toast(err.message, 'error'); }
      });
    });
  }catch(e){ body.innerHTML = `<tr><td colspan="5">${e.message}</td></tr>`; }
}

/* ---------------- Users ---------------- */
async function loadAdminUsers(){
  const body = document.getElementById('admin-users-body');
  body.innerHTML = `<tr><td colspan="5">Боргирӣ...</td></tr>`;
  try{
    const { users } = await Api.getUsers();
    body.innerHTML = users.map(u => `
      <tr>
        <td>${u.name}</td>
        <td>${u.email}</td>
        <td>
          <select class="role-select" data-id="${u.id}" style="padding:6px 10px;border-radius:8px;border:1.5px solid var(--border-strong);">
            <option value="customer" ${u.role === 'customer' ? 'selected' : ''}>customer</option>
            <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>admin</option>
          </select>
        </td>
        <td>${new Date(u.created_at).toLocaleDateString('tg-TJ')}</td>
        <td><div class="row-actions"><button class="delete-user-btn" data-id="${u.id}" title="Нест кардан"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg></button></div></td>
      </tr>`).join('') || '<tr><td colspan="5">Корбар нест.</td></tr>';

    document.querySelectorAll('.role-select').forEach(sel => {
      sel.addEventListener('change', async () => {
        try{ await Api.updateUserRole(sel.dataset.id, sel.value); toast('Нақш навсозӣ шуд ✓', 'success'); }
        catch(err){ toast(err.message, 'error'); }
      });
    });
    document.querySelectorAll('.delete-user-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        confirmModal({ title: 'Корбарро нест кунем?', message: 'Ин амал бебозгашт аст.', confirmLabel: 'Нест кардан',
          onConfirm: async () => { await Api.deleteUser(btn.dataset.id); toast('Корбар нест шуд', 'success'); loadAdminUsers(); } });
      });
    });
  }catch(e){ body.innerHTML = `<tr><td colspan="5">${e.message}</td></tr>`; }
}

/* ---------------- Categories ---------------- */
async function loadAdminCategories(){
  const body = document.getElementById('admin-categories-body');
  try{
    const { categories } = await Api.getCategories();
    body.innerHTML = categories.map(c => `
      <tr><td>${c.name}</td><td>${c.slug}</td>
        <td><button class="delete-cat-btn" data-id="${c.id}" title="Нест кардан"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg></button></td></tr>
    `).join('') || '<tr><td colspan="3">Категория нест.</td></tr>';
    document.querySelectorAll('.delete-cat-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        confirmModal({ title: 'Категорияро нест кунем?', confirmLabel: 'Нест кардан',
          onConfirm: async () => { await Api.deleteCategory(btn.dataset.id); toast('Категория нест шуд', 'success'); loadAdminCategories(); } });
      });
    });
  }catch(e){ body.innerHTML = `<tr><td colspan="3">${e.message}</td></tr>`; }
}

document.getElementById('new-category-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  try{
    await Api.createCategory({ name: document.getElementById('cat-name').value.trim(), slug: document.getElementById('cat-slug').value.trim() });
    document.getElementById('new-category-form').reset();
    toast('Категория илова шуд ✓', 'success');
    loadAdminCategories();
  }catch(err){ toast(err.message, 'error'); }
});

/* ---------------- Settings ---------------- */
async function loadSettings(){
  try{
    const { settings } = await Api.getSettings();
    document.getElementById('set-company-name').value = settings.company_name || '';
    document.getElementById('set-logo-url').value = settings.logo_url || '';
    document.getElementById('set-primary-color').value = settings.primary_color || '#4F46E5';
    document.getElementById('set-accent-color').value = settings.accent_color || '#FF6B4A';
    document.getElementById('primary-color-val').textContent = settings.primary_color || '#4F46E5';
    document.getElementById('accent-color-val').textContent = settings.accent_color || '#FF6B4A';
    document.getElementById('set-currency').value = settings.currency || 'TJS';
    document.getElementById('set-maintenance').checked = !!settings.maintenance_mode;
  }catch(e){ toast(e.message, 'error'); }
}
document.getElementById('set-primary-color').addEventListener('input', (e) => document.getElementById('primary-color-val').textContent = e.target.value);
document.getElementById('set-accent-color').addEventListener('input', (e) => document.getElementById('accent-color-val').textContent = e.target.value);

document.getElementById('settings-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  try{
    await Api.updateSettings({
      company_name: document.getElementById('set-company-name').value.trim(),
      logo_url: document.getElementById('set-logo-url').value.trim(),
      primary_color: document.getElementById('set-primary-color').value,
      accent_color: document.getElementById('set-accent-color').value,
      currency: document.getElementById('set-currency').value.trim(),
      maintenance_mode: document.getElementById('set-maintenance').checked
    });
    toast('Танзимот захира шуд ✓', 'success');
    renderNavbar('admin');
  }catch(err){ toast(err.message, 'error'); }
});

loadDashboard();
