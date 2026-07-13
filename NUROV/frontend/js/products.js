renderNavbar('products');
renderFooter();

const params = new URLSearchParams(location.search);
let state = {
  search: params.get('search') || '',
  category: params.get('category') || '',
  minPrice: '',
  maxPrice: '',
  sort: '',
  page: 1,
  limit: 9
};

document.getElementById('search-input').value = state.search;

function productCard(p){
  let images = [];
  try{ images = typeof p.images === 'string' ? JSON.parse(p.images) : p.images; }catch(e){ images = []; }
  const img = (images && images[0]) || 'https://placehold.co/500x500?text=No+Image';
  const onSale = p.compare_price && Number(p.compare_price) > Number(p.price);
  return `
  <div class="product-card">
    <a href="product-details.html?id=${p.id}">
      <div class="thumb">
        ${onSale ? '<span class="badge-sale">Тахфиф</span>' : ''}
        <img src="${img}" alt="${p.title}" loading="lazy">
      </div>
    </a>
    <button class="wish-btn" data-id="${p.id}" aria-label="Дилхоҳ">${Icon.heart}</button>
    <div class="body">
      <div class="cat">${p.category_name || 'Маҳсулот'}</div>
      <a href="product-details.html?id=${p.id}"><h3>${p.title}</h3></a>
      <div class="price-row">
        <span class="price">${money(p.price)}</span>
        ${onSale ? `<span class="price-compare">${money(p.compare_price)}</span>` : ''}
      </div>
      <div class="rating"><span class="stars">${starString(p.rating)}</span><span>(${p.rating_count || 0})</span></div>
      <button class="btn btn-primary btn-block btn-sm add-cart-btn" data-id="${p.id}" style="margin-top:10px;">Ба сабад илова кардан</button>
    </div>
  </div>`;
}

async function loadCategories(){
  try{
    const { categories } = await Api.getCategories();
    const list = document.getElementById('category-list');
    const allActive = !state.category ? 'active' : '';
    list.innerHTML = `<label class="checkbox-row" style="cursor:pointer;"><input type="radio" name="cat" value="" ${!state.category ? 'checked' : ''}> Ҳама категорияҳо</label>` +
      categories.map(c => `<label class="checkbox-row" style="cursor:pointer;"><input type="radio" name="cat" value="${c.slug}" ${state.category === c.slug ? 'checked' : ''}> ${c.name}</label>`).join('');
    list.querySelectorAll('input[name="cat"]').forEach(inp => {
      inp.addEventListener('change', () => { state.category = inp.value; state.page = 1; loadProducts(); });
    });
  }catch(e){}
}

async function loadProducts(){
  const grid = document.getElementById('products-grid');
  const resultCount = document.getElementById('result-count');
  grid.innerHTML = Array.from({length:6}).map(() => `<div class="skeleton" style="height:320px;"></div>`).join('');

  try{
    const { products, total } = await Api.getProducts({
      search: state.search, category: state.category, minPrice: state.minPrice,
      maxPrice: state.maxPrice, sort: state.sort, page: state.page, limit: state.limit
    });

    if (products.length === 0){
      grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1;">
        <h3>Маҳсулот ёфт нашуд</h3><p>Филтрҳои дигарро санҷед.</p></div>`;
      resultCount.textContent = '0 маҳсулот ёфт шуд';
      document.getElementById('pagination').innerHTML = '';
      return;
    }

    resultCount.textContent = `${total} маҳсулот ёфт шуд`;
    grid.innerHTML = products.map(productCard).join('');
    attachCardHandlers();
    renderPagination(total);
  }catch(e){
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1;">
      <h3>Пайваст ба сервер имконнопазир аст</h3><p>Мутмаин шавед, ки backend дар http://localhost:5000 кор мекунад.</p></div>`;
  }
}

function attachCardHandlers(){
  document.querySelectorAll('.wish-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      if (!Auth.isLoggedIn()){ window.location.href = 'login.html'; return; }
      try{ await Api.addWishlist(btn.dataset.id); btn.classList.add('active'); toast('Ба дилхоҳ илова шуд', 'success'); }
      catch(err){ toast(err.message, 'error'); }
    });
  });
  document.querySelectorAll('.add-cart-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!Auth.isLoggedIn()){ window.location.href = 'login.html'; return; }
      try{
        await Api.addToCart(btn.dataset.id, 1);
        toast('Ба сабад илова шуд ✓', 'success');
        renderNavbar('products');
      }catch(err){ toast(err.message, 'error'); }
    });
  });
}

function renderPagination(total){
  const pages = Math.ceil(total / state.limit);
  const el = document.getElementById('pagination');
  if (pages <= 1){ el.innerHTML = ''; return; }
  let html = '';
  for (let i = 1; i <= pages; i++){
    html += `<button class="${i === state.page ? 'active' : ''}" data-page="${i}">${i}</button>`;
  }
  el.innerHTML = html;
  el.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => { state.page = Number(btn.dataset.page); loadProducts(); window.scrollTo({top:0, behavior:'smooth'}); });
  });
}

let searchTimer;
document.getElementById('search-input').addEventListener('input', (e) => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => { state.search = e.target.value; state.page = 1; loadProducts(); }, 400);
});
document.getElementById('sort-select').addEventListener('change', (e) => { state.sort = e.target.value; loadProducts(); });
document.getElementById('apply-filters').addEventListener('click', () => {
  state.minPrice = document.getElementById('min-price').value;
  state.maxPrice = document.getElementById('max-price').value;
  state.page = 1;
  loadProducts();
});
document.getElementById('clear-filters').addEventListener('click', () => {
  state = { search: '', category: '', minPrice: '', maxPrice: '', sort: '', page: 1, limit: 9 };
  document.getElementById('search-input').value = '';
  document.getElementById('min-price').value = '';
  document.getElementById('max-price').value = '';
  document.getElementById('sort-select').value = '';
  loadCategories();
  loadProducts();
});

loadCategories();
loadProducts();
