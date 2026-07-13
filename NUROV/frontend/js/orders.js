renderNavbar('orders');
renderFooter();
Auth.requireLogin();

const STAGES = ['Pending', 'Processing', 'Shipped', 'Delivered'];

function statusTracker(status){
  if (status === 'Cancelled'){
    return `<span class="status-pill status-Cancelled">Бекор карда шуд</span>`;
  }
  const currentIndex = STAGES.indexOf(status);
  return `<div style="display:flex;align-items:center;gap:4px;margin-top:10px;">
    ${STAGES.map((s, i) => `
      <div style="display:flex;align-items:center;gap:4px;flex:${i < STAGES.length - 1 ? 1 : 0};">
        <div style="width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.65rem;font-weight:800;
          background:${i <= currentIndex ? 'var(--primary)' : 'var(--border)'};color:${i <= currentIndex ? '#fff' : 'var(--ink-faint)'};">${i+1}</div>
        ${i < STAGES.length - 1 ? `<div style="flex:1;height:3px;border-radius:2px;background:${i < currentIndex ? 'var(--primary)' : 'var(--border)'};"></div>` : ''}
      </div>`).join('')}
  </div>
  <div style="display:flex;justify-content:space-between;font-size:.7rem;color:var(--ink-faint);margin-top:6px;">
    ${STAGES.map(s => `<span>${s}</span>`).join('')}
  </div>`;
}

async function loadOrders(){
  const wrap = document.getElementById('orders-list');
  try{
    const { orders } = await Api.getMyOrders();
    if (orders.length === 0){
      wrap.innerHTML = `<div class="empty-state"><h3>Ҳанӯз фармоише нест</h3><p>Аввалин хариди худро анҷом диҳед.</p>
        <a href="products.html" class="btn btn-primary" style="margin-top:12px;">Хариди маҳсулот</a></div>`;
      return;
    }
    wrap.innerHTML = orders.map(o => `
      <div class="card card-pad" style="margin-bottom:16px;">
        <div class="flex-between">
          <div>
            <h3 style="margin-bottom:2px;">Фармоиши №${o.id}</h3>
            <p style="margin:0;font-size:.85rem;">${new Date(o.created_at).toLocaleDateString('tg-TJ', { year:'numeric', month:'long', day:'numeric' })}</p>
          </div>
          <div style="text-align:right;">
            <span class="status-pill status-${o.status}">${o.status}</span>
            <p style="margin:6px 0 0;font-weight:800;">${money(o.total)}</p>
          </div>
        </div>
        ${statusTracker(o.status)}
        <div style="margin-top:14px;border-top:1px solid var(--border);padding-top:14px;">
          ${o.items.map(it => `<div style="display:flex;justify-content:space-between;font-size:.88rem;padding:4px 0;">
            <span>${it.title_snapshot} × ${it.quantity}</span><span>${money(it.price_snapshot * it.quantity)}</span></div>`).join('')}
        </div>
      </div>`).join('');
  }catch(e){
    wrap.innerHTML = `<div class="empty-state"><h3>Хатогӣ</h3><p>${e.message}</p></div>`;
  }
}

loadOrders();
