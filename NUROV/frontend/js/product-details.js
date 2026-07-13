renderNavbar('products');
renderFooter();

const pid = new URLSearchParams(location.search).get('id');
let currentProduct = null;
let qty = 1;

function parseImages(images){
  try{ return typeof images === 'string' ? JSON.parse(images) : (images || []); }catch(e){ return []; }
}

async function loadProduct(){
  if (!pid){ document.getElementById('pd-root').innerHTML = '<p>Маҳсулот муайян нашуд.</p>'; return; }
  try{
    const { product, similar, reviews } = await Api.getProduct(pid);
    currentProduct = product;
    renderGallery(product);
    renderInfo(product);
    renderDescription(product);
    renderReviews(reviews);
    renderSimilar(similar);
  }catch(e){
    document.getElementById('pd-root').innerHTML = `<div class="empty-state"><h3>Маҳсулот ёфт нашуд</h3><p>${e.message}</p></div>`;
  }
}

function renderGallery(p){
  const images = parseImages(p.images);
  const list = images.length ? images : ['https://placehold.co/700x700?text=No+Image'];
  const mainEl = document.getElementById('pd-main-img');
  mainEl.classList.remove('skeleton');
  mainEl.innerHTML = `<img src="${list[0]}" alt="${p.title}" id="pd-main-actual">`;
  document.getElementById('pd-thumbs').innerHTML = list.map((src, i) =>
    `<button class="${i === 0 ? 'active' : ''}" data-src="${src}"><img src="${src}"></button>`
  ).join('');
  document.querySelectorAll('.pd-thumbs button').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('pd-main-actual').src = btn.dataset.src;
      document.querySelectorAll('.pd-thumbs button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
}

function renderInfo(p){
  const onSale = p.compare_price && Number(p.compare_price) > Number(p.price);
  document.getElementById('pd-info').innerHTML = `
    <div class="cat" style="margin-bottom:8px;">${p.category_name || 'Маҳсулот'}</div>
    <h1 style="font-size:1.9rem;">${p.title}</h1>
    <div class="rating" style="margin-bottom:10px;"><span class="stars">${starString(p.rating)}</span><span>${p.rating} (${p.rating_count} шарҳ)</span></div>
    <div class="pd-price-row">
      <span class="price">${money(p.price)}</span>
      ${onSale ? `<span class="price-compare">${money(p.compare_price)}</span>` : ''}
    </div>
    <p>${p.description || 'Тавсиф дастрас нест.'}</p>
    <p style="font-size:.88rem;color:${p.stock > 0 ? 'var(--success)' : 'var(--danger)'};font-weight:600;">
      ${p.stock > 0 ? `✓ Дар анбор мавҷуд аст (${p.stock} дона)` : '✕ Тамом шудааст'}
    </p>
    <div class="qty-stepper" id="qty-stepper">
      <button id="qty-minus">−</button><span id="qty-val">1</span><button id="qty-plus">+</button>
    </div>
    <div class="pd-actions">
      <button class="btn btn-primary" id="add-to-cart-btn" ${p.stock <= 0 ? 'disabled' : ''}>${Icon.cart} Ба сабад илова кардан</button>
      <button class="btn btn-ghost btn-icon" id="wish-btn-detail" aria-label="Дилхоҳ">${Icon.heart}</button>
    </div>`;

  document.getElementById('qty-minus').addEventListener('click', () => { qty = Math.max(1, qty - 1); document.getElementById('qty-val').textContent = qty; });
  document.getElementById('qty-plus').addEventListener('click', () => { qty = Math.min(p.stock || 99, qty + 1); document.getElementById('qty-val').textContent = qty; });

  document.getElementById('add-to-cart-btn').addEventListener('click', async () => {
    if (!Auth.isLoggedIn()){ window.location.href = 'login.html'; return; }
    try{
      await Api.addToCart(p.id, qty);
      renderNavbar('products');
      showModal({ title: 'Илова шуд!', message: `${qty} дона "${p.title}" ба сабад илова карда шуд.`,
        actions: [
          { label: 'Идомаи харид', className:'btn-ghost', onClick: () => {} },
          { label: 'Дидани сабад', onClick: () => window.location.href = 'cart.html' }
        ] });
    }catch(err){ showModal({ icon:'error', title:'Хатогӣ', message: err.message }); }
  });

  document.getElementById('wish-btn-detail').addEventListener('click', async () => {
    if (!Auth.isLoggedIn()){ window.location.href = 'login.html'; return; }
    try{ await Api.addWishlist(p.id); toast('Ба дилхоҳ илова шуд', 'success'); }
    catch(err){ toast(err.message, 'error'); }
  });
}

function renderDescription(p){
  document.getElementById('tab-desc').innerHTML = `<p style="max-width:760px;">${p.description || 'Тавсифи муфассал ба зудӣ илова карда мешавад.'}</p>`;
}

function renderReviews(reviews){
  const wrap = document.getElementById('tab-reviews');
  const list = reviews.length ? reviews.map(r => `
    <div class="review-item">
      <div class="rhead"><strong>${r.user_name}</strong><span class="stars">${starString(r.rating)}</span></div>
      <p style="margin:0;">${r.comment || ''}</p>
    </div>`).join('') : '<p>Ҳанӯз шарҳе нест. Аввалин шарҳро шумо гузоред!</p>';

  wrap.innerHTML = list + `
    <div class="card card-pad" style="margin-top:20px;max-width:500px;">
      <h3>Шарҳи худро гузоред</h3>
      <div class="field">
        <label>Баҳо (1-5)</label>
        <select id="review-rating"><option value="5">5 - Аъло</option><option value="4">4 - Хуб</option><option value="3">3 - Миёна</option><option value="2">2 - Бад</option><option value="1">1 - Хеле бад</option></select>
      </div>
      <div class="field"><label>Шарҳ</label><textarea id="review-comment" rows="3" placeholder="Фикри худро нависед..."></textarea></div>
      <button class="btn btn-primary btn-block" id="submit-review">Фиристодан</button>
    </div>`;

  document.getElementById('submit-review').addEventListener('click', async () => {
    if (!Auth.isLoggedIn()){ window.location.href = 'login.html'; return; }
    try{
      await Api.addReview(pid, { rating: Number(document.getElementById('review-rating').value), comment: document.getElementById('review-comment').value });
      toast('Шарҳи шумо сабт шуд', 'success');
      loadProduct();
    }catch(err){ toast(err.message, 'error'); }
  });
}

function renderSimilar(similar){
  const grid = document.getElementById('similar-grid');
  if (!similar || similar.length === 0){ grid.innerHTML = '<p>Маҳсулоти монанд ёфт нашуд.</p>'; return; }
  grid.innerHTML = similar.map(p => {
    const img = parseImages(p.images)[0] || 'https://placehold.co/400x400';
    return `<div class="product-card">
      <a href="product-details.html?id=${p.id}"><div class="thumb"><img src="${img}"></div></a>
      <div class="body">
        <a href="product-details.html?id=${p.id}"><h3>${p.title}</h3></a>
        <div class="price-row"><span class="price">${money(p.price)}</span></div>
        <div class="rating"><span class="stars">${starString(p.rating)}</span></div>
      </div></div>`;
  }).join('');
}

document.addEventListener('click', (e) => {
  const tabBtn = e.target.closest('.tab-btn');
  if (!tabBtn) return;
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  tabBtn.classList.add('active');
  document.getElementById('tab-desc').style.display = tabBtn.dataset.tab === 'desc' ? 'block' : 'none';
  document.getElementById('tab-reviews').style.display = tabBtn.dataset.tab === 'reviews' ? 'block' : 'none';
});

loadProduct();
