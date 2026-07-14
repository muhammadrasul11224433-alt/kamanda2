// ============ PRODUCT DATA ============
const products = [
  {
    id: 1,
    title: "Trek Marlin 7 — Кӯҳӣ",
    cat: "kuhi",
    catLabel: "Кӯҳӣ (MTB)",
    price: 4200,
    oldPrice: 4800,
    rating: "⭐ 4.8 (98)",
    img: "https://images.unsplash.com/photo-1553978297-833d09932d31?w=500&q=80",
    badge: "Тахфиф"
  },
  {
    id: 2,
    title: "Giant Escape — Шаҳрӣ",
    cat: "shahri",
    catLabel: "Шаҳрӣ",
    price: 2800,
    oldPrice: null,
    rating: "⭐ 4.7 (76)",
    img: "https://images.unsplash.com/photo-1571333250630-f0230c320b6d?w=500&q=80",
    badge: "Нав"
  },
  {
    id: 3,
    title: "RadPower E-Bike",
    cat: "barqi",
    catLabel: "Барқӣ (E-Bike)",
    price: 8900,
    oldPrice: 9900,
    rating: "⭐ 4.9 (142)",
    img: "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=500&q=80",
    badge: "Тахфиф"
  },
  {
    id: 4,
    title: "Specialized Allez — Мусобиқавӣ",
    cat: "musobiqa",
    catLabel: "Мусобиқавӣ",
    price: 6500,
    oldPrice: null,
    rating: "⭐ 4.6 (54)",
    img: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=500&q=80",
    badge: null
  },
  {
    id: 5,
    title: "Kids Explorer 16\"",
    cat: "kudak",
    catLabel: "Барои кӯдакон",
    price: 1450,
    oldPrice: 1700,
    rating: "⭐ 4.8 (65)",
    img: "https://images.unsplash.com/photo-1502744688674-c619d1586c9e?w=500&q=80",
    badge: "Маъмул"
  },
  {
    id: 6,
    title: "Каски Муҳофизатӣ Pro",
    cat: "abzor",
    catLabel: "Ҷиҳозот",
    price: 350,
    oldPrice: null,
    rating: "⭐ 4.5 (89)",
    img: "https://images.unsplash.com/photo-1544191696-102709daa1b9?w=500&q=80",
    badge: null
  },
  {
    id: 7,
    title: "Cannondale Trail — Кӯҳӣ",
    cat: "kuhi",
    catLabel: "Кӯҳӣ (MTB)",
    price: 5100,
    oldPrice: null,
    rating: "⭐ 4.7 (110)",
    img: "https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=500&q=80",
    badge: "Маъмул"
  },
  {
    id: 8,
    title: "Схема Шаҳрии Comfort",
    cat: "shahri",
    catLabel: "Шаҳрӣ",
    price: 2350,
    oldPrice: 2600,
    rating: "⭐ 4.6 (48)",
    img: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=500&q=80",
    badge: "Тахфиф"
  },
  {
    id: 9,
    title: "Ҷиҳози Ёрирасон (Гардиши LED, қулф, помпа)",
    cat: "abzor",
    catLabel: "Ҷиҳозот",
    price: 280,
    oldPrice: null,
    rating: "⭐ 4.4 (37)",
    img: "https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=500&q=80",
    badge: null
  }
];

// ============ STATE ============
let cart = JSON.parse(localStorage.getItem("veloyurt_cart")) || [];
let currentFilter = "all";

// ============ RENDER PRODUCTS ============
function renderProducts(){
  const grid = document.getElementById("productsGrid");
  const searchTerm = document.getElementById("searchInput").value.toLowerCase();

  const filtered = products.filter(p => {
    const matchCat = currentFilter === "all" || p.cat === currentFilter;
    const matchSearch = p.title.toLowerCase().includes(searchTerm);
    return matchCat && matchSearch;
  });

  if(filtered.length === 0){
    grid.innerHTML = `<p style="grid-column:1/-1;text-align:center;color:var(--text-light);padding:40px;">Ҳеҷ велосипед ёфт нашуд 😔</p>`;
    return;
  }

  grid.innerHTML = filtered.map(p => `
    <div class="product-card">
      <div class="product-img">
        ${p.badge ? `<span class="product-badge">${p.badge}</span>` : ""}
        <button class="wishlist-btn" onclick="toggleWishlist(this)">🤍</button>
        <img src="${p.img}" alt="${p.title}" loading="lazy">
      </div>
      <div class="product-info">
        <span class="product-cat">${p.catLabel}</span>
        <h3 class="product-title">${p.title}</h3>
        <p class="product-rating">${p.rating}</p>
        <div class="product-footer">
          <span class="product-price">
            ${p.oldPrice ? `<small>${p.oldPrice} с.</small>` : ""}${p.price} с.
          </span>
          <button class="add-btn" onclick="addToCart(${p.id})">+</button>
        </div>
      </div>
    </div>
  `).join("");
}

function toggleWishlist(btn){
  btn.textContent = btn.textContent === "🤍" ? "❤️" : "🤍";
}

// ============ CART LOGIC ============
function saveCart(){
  localStorage.setItem("veloyurt_cart", JSON.stringify(cart));
  updateCartUI();
}

function addToCart(id){
  const product = products.find(p => p.id === id);
  const existing = cart.find(item => item.id === id);

  if(existing){
    existing.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  saveCart();
  showToast(`"${product.title}" ба сабад илова шуд ✅`);
}

function changeQty(id, delta){
  const item = cart.find(i => i.id === id);
  if(!item) return;
  item.qty += delta;
  if(item.qty <= 0){
    cart = cart.filter(i => i.id !== id);
  }
  saveCart();
}

function removeFromCart(id){
  cart = cart.filter(i => i.id !== id);
  saveCart();
}

function updateCartUI(){
  const cartItemsEl = document.getElementById("cartItems");
  const cartCountEl = document.getElementById("cartCount");
  const cartTotalEl = document.getElementById("cartTotal");

  const totalQty = cart.reduce((sum, i) => sum + i.qty, 0);
  cartCountEl.textContent = totalQty;

  if(cart.length === 0){
    cartItemsEl.innerHTML = `<div class="empty-cart">Сабади шумо холист 🛒<br>Велосипеди дилхоҳро илова кунед</div>`;
  } else {
    cartItemsEl.innerHTML = cart.map(item => `
      <div class="cart-item">
        <img src="${item.img}" alt="${item.title}">
        <div class="cart-item-info">
          <h5>${item.title}</h5>
          <p>${item.price} сомонӣ</p>
          <div class="qty-control">
            <button onclick="changeQty(${item.id}, -1)">−</button>
            <span>${item.qty}</span>
            <button onclick="changeQty(${item.id}, 1)">+</button>
          </div>
          <button class="remove-btn" onclick="removeFromCart(${item.id})">Нест кардан</button>
        </div>
      </div>
    `).join("");
  }

  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  cartTotalEl.textContent = `${total} сомонӣ`;
}

// ============ TOAST ============
let toastTimeout;
function showToast(msg){
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove("show"), 2500);
}

// ============ EVENT LISTENERS ============
document.addEventListener("DOMContentLoaded", () => {
  renderProducts();
  updateCartUI();

  // Category filter
  document.querySelectorAll(".cat-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      document.querySelectorAll(".cat-chip").forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      currentFilter = chip.dataset.cat;
      renderProducts();
    });
  });

  // Search
  const searchBtn = document.getElementById("searchBtn");
  const searchBox = document.getElementById("searchBox");
  const searchInput = document.getElementById("searchInput");

  searchBtn.addEventListener("click", () => {
    searchBox.classList.toggle("open");
    if(searchBox.classList.contains("open")) searchInput.focus();
  });
  searchInput.addEventListener("input", renderProducts);

  // Cart drawer
  const cartDrawer = document.getElementById("cartDrawer");
  const overlay = document.getElementById("overlay");

  document.getElementById("cartBtn").addEventListener("click", () => {
    cartDrawer.classList.add("open");
    overlay.classList.add("show");
  });
  document.getElementById("closeCart").addEventListener("click", closeCart);
  overlay.addEventListener("click", closeCart);

  function closeCart(){
    cartDrawer.classList.remove("open");
    overlay.classList.remove("show");
  }

  // Checkout
  document.getElementById("checkoutBtn").addEventListener("click", () => {
    if(cart.length === 0){
      showToast("Сабади шумо холист!");
      return;
    }
    showToast("Фармоиши шумо қабул шуд! Мо ба зудӣ тамос мегирем 🚴");
    cart = [];
    saveCart();
    closeCart();
  });

  // Mobile burger menu
  const burgerBtn = document.getElementById("burgerBtn");
  const menu = document.getElementById("menu");
  burgerBtn.addEventListener("click", () => {
    menu.classList.toggle("open");
  });
  document.querySelectorAll(".menu a").forEach(link => {
    link.addEventListener("click", () => menu.classList.remove("open"));
  });

  // Newsletter form
  document.getElementById("newsletterForm").addEventListener("submit", (e) => {
    e.preventDefault();
    showToast("Ташаккур барои обуна шудан! 🚵");
    e.target.reset();
  });

  // Nav active state
  document.querySelectorAll(".menu a").forEach(link => {
    link.addEventListener("click", () => {
      document.querySelectorAll(".menu a").forEach(a => a.classList.remove("active"));
      link.classList.add("active");
    });
  });
});
