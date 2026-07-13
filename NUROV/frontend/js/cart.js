renderNavbar('products');
renderFooter();
Auth.requireLogin();

function parseImages(images){
  try{ return typeof images === 'string' ? JSON.parse(images) : (images || []); }catch(e){ return []; }
}

async function loadCart(){
  const wrap = document.getElementById('cart-items-wrap');
  try{
    const { items, total } = await Api.getCart();
    if (items.length === 0){
      wrap.innerHTML = `<div class="empty-state">
        <h3>Сабади шумо холист</h3><p>Маҳсулоти дилхоҳро илова кунед.</p>
        <a href="products.html" class="btn btn-primary" style="margin-top:12px;">Хариди маҳсулот</a>
      </div>`;
      document.getElementById('sum-subtotal').textContent = money(0);
      document.getElementById('sum-total').textContent = money(0);
      return;
    }

    wrap.innerHTML = items.map(it => {
      const img = parseImages(it.images)[0] || 'https://placehold.co/200x200';
      return `
      <div class="cart-item" data-id="${it.cart_item_id}">
        <img src="${img}" alt="${it.title}">
        <div>
          <h3 style="margin:0 0 4px;font-size:1rem;">${it.title}</h3>
          <span class="price">${money(it.price)}</span>
        </div>
        <div class="qty-stepper">
          <button class="q-minus">−</button><span>${it.quantity}</span><button class="q-plus">+</button>
        </div>
        <button class="remove-x" aria-label="Нест кардан">${Icon.x}</button>
      </div>`;
    }).join('');

    document.getElementById('sum-subtotal').textContent = money(total);
    document.getElementById('sum-total').textContent = money(total);
    attachCartHandlers();
  }catch(e){
    wrap.innerHTML = `<div class="empty-state"><h3>Хатогӣ</h3><p>${e.message}</p></div>`;
  }
}

function attachCartHandlers(){
  document.querySelectorAll('.cart-item').forEach(row => {
    const id = row.dataset.id;
    const qtySpan = row.querySelector('.qty-stepper span');
    row.querySelector('.q-plus').addEventListener('click', async () => {
      const newQty = Number(qtySpan.textContent) + 1;
      await Api.updateCartItem(id, newQty);
      loadCart(); renderNavbar('products');
    });
    row.querySelector('.q-minus').addEventListener('click', async () => {
      const newQty = Number(qtySpan.textContent) - 1;
      if (newQty < 1){
        confirmModal({ title: 'Нест кардан?', message: 'Ин маҳсулот аз сабад нест карда мешавад.', confirmLabel: 'Нест кардан',
          onConfirm: async () => { await Api.removeCartItem(id); loadCart(); renderNavbar('products'); } });
        return;
      }
      await Api.updateCartItem(id, newQty);
      loadCart(); renderNavbar('products');
    });
    row.querySelector('.remove-x').addEventListener('click', () => {
      confirmModal({ title: 'Нест кардан?', message: 'Ин маҳсулот аз сабад нест карда мешавад.', confirmLabel: 'Нест кардан',
        onConfirm: async () => { await Api.removeCartItem(id); loadCart(); renderNavbar('products'); } });
    });
  });
}

document.getElementById('checkout-btn').addEventListener('click', async () => {
  const address = document.getElementById('shipping-address').value.trim();
  const btn = document.getElementById('checkout-btn');
  btn.disabled = true; btn.textContent = 'Коркард...';
  try{
    const { orderId, total } = await Api.checkout({ shipping_address: address });
    renderNavbar('products');
    showModal({
      title: 'Фармоиш сабт шуд',
      message: `Фармоиши №${orderId} ба маблағи ${money(total)} қабул шуд.`,
      actions: [{ label: 'Дидани фармоишҳо', onClick: () => window.location.href = 'orders.html' }]
    });
  }catch(err){
    showModal({ icon:'error', title:'Хатогӣ дар пардохт', message: err.message });
  }finally{
    btn.disabled = false; btn.textContent = 'Пардохт кардан (Checkout)';
  }
});

loadCart();
