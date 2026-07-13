renderNavbar('home');
renderFooter();

function productCard(p){
  const img = (JSON.parse(p.images || '[]')[0]) || (Array.isArray(p.images) ? p.images[0] : '') || 'https://placehold.co/500x500?text=No+Image';
  const onSale = p.compare_price && Number(p.compare_price) > Number(p.price);
  return `
  <div class="product-card">
    <a href="product-details.html?id=${p.id}">
      <div class="thumb">
        ${onSale ? '<span class="badge-sale">Тахфиф</span>' : ''}
        <img src="${img}" alt="${p.title}" loading="lazy">
      </div>
    </a>
    <button class="wish-btn" data-id="${p.id}" aria-label="Ба дилхоҳ илова кардан">${Icon.heart}</button>
    <div class="body">
      <div class="cat">${p.category_name || 'Маҳсулот'}</div>
      <a href="product-details.html?id=${p.id}"><h3>${p.title}</h3></a>
      <div class="price-row">
        <span class="price">${money(p.price)}</span>
        ${onSale ? `<span class="price-compare">${money(p.compare_price)}</span>` : ''}
      </div>
      <div class="rating"><span class="stars">${starString(p.rating)}</span><span>(${p.rating_count || 0})</span></div>
    </div>
  </div>`;
}

async function loadCategories(){
  try{
    const { categories } = await Api.getCategories();
    const strip = document.getElementById('cat-strip');
    strip.innerHTML = `<li><a class="cat-chip active" href="products.html">Ҳама</a></li>` +
      categories.map(c => `<li><a class="cat-chip" href="products.html?category=${c.slug}">${c.name}</a></li>`).join('');
  }catch(e){ /* backend offline — silently skip */ }
}

let featuredProducts = [];
let sliderIndex = 0;

async function loadFeatured(){
  const track = document.getElementById('featured-track');
  try{
    const { products, total } = await Api.getProducts({ limit: 8, sort: 'rating' });
    featuredProducts = products;
    document.getElementById('stat-products').textContent = total ? `${total}+` : `${products.length}+`;
    track.innerHTML = products.map(productCard).join('');
    attachWishlistHandlers();
  }catch(e){
    track.innerHTML = `<p style="padding:20px;">Барои дидани маҳсулот backend-ро оғоз кунед (backend/README).</p>`;
  }
}

function attachWishlistHandlers(){
  document.querySelectorAll('.wish-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      if (!Auth.isLoggedIn()){ window.location.href = 'login.html'; return; }
      try{
        await Api.addWishlist(btn.dataset.id);
        btn.classList.add('active');
        toast('Ба рӯйхати дилхоҳ илова шуд', 'success');
      }catch(err){ toast(err.message, 'error'); }
    });
  });
}

function slide(dir){
  const track = document.getElementById('featured-track');
  const cardWidth = 270 + 20; // width + gap
  const maxIndex = Math.max(0, featuredProducts.length - 3);
  sliderIndex = Math.min(Math.max(sliderIndex + dir, 0), maxIndex);
  track.style.transform = `translateX(-${sliderIndex * cardWidth}px)`;
}

document.getElementById('slide-prev').addEventListener('click', () => slide(-1));
document.getElementById('slide-next').addEventListener('click', () => slide(1));

loadCategories();
loadFeatured();
