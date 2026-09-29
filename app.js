const products = [
  { id: "bebel", artist: "BEBEL GILBERTO", title: "Tanto Tempo", year: "2000", type: "BRASIL · MPB", category: "brasil", price: 149.9, badge: "CLÁSSICO", cover: "bebel", label: "#f1bf34" },
  { id: "joao", artist: "JOÃO GILBERTO", title: "Amoroso", year: "1977", type: "BRASIL · BOSSA NOVA", category: "brasil", price: 189.9, badge: "EDIÇÃO ESPECIAL", cover: "joao", label: "#d84b35" },
  { id: "nina", artist: "NINA SIMONE", title: "Little Girl Blue", year: "1958", type: "JAZZ · SOUL", category: "jazz", price: 169.9, badge: "REEDIÇÃO", cover: "nina", label: "#d9563a" },
  { id: "tim", artist: "TIM MAIA", title: "Racional Vol. 1", year: "1975", type: "BRASIL · SOUL", category: "brasil", price: 219.9, badge: "RARIDADE", cover: "tim", label: "#db4832" },
  { id: "gal", artist: "GAL COSTA", title: "Índia", year: "1973", type: "BRASIL · MPB", category: "brasil", price: 159.9, badge: "MAIS OUVIDO", cover: "gal", label: "#e8c74a" },
  { id: "bad", artist: "BADBADNOTGOOD", title: "IV", year: "2016", type: "INDIE · JAZZ", category: "indie", price: 199.9, badge: "NOVO POR AQUI", cover: "bad", label: "#efc84c" },
  { id: "cartola", artist: "CARTOLA", title: "Cartola", year: "1976", type: "SAMBA · BRASIL", category: "samba", price: 159.9, badge: "SAMBA", cover: "samba", coverTitle: "CARTOLA", label: "#e5c54a" },
  { id: "rita", artist: "RITA LEE", title: "Fruto Proibido", year: "1975", type: "ROCK · BRASIL", category: "rock", price: 179.9, badge: "ROCK", cover: "rock", coverTitle: "FRUTO\nPROIBIDO", label: "#e84832" },
  { id: "bach", artist: "JOHANN SEBASTIAN BACH", title: "Cello Suites", year: "1965", type: "CLÁSSICA", category: "classica", price: 189.9, badge: "CLÁSSICA", cover: "classica", coverTitle: "CELLO\nSUITES", label: "#263cd2" },
  { id: "cinema", artist: "ENNIO MORRICONE", title: "Cinema Paradiso", year: "1988", type: "TRILHA SONORA", category: "trilhas", price: 209.9, badge: "TRILHAS", cover: "trilhas", coverTitle: "CINEMA\nPARADISO", label: "#f3c528" },
  { id: "comp", artist: "VÁRIOS ARTISTAS", title: "Brasil de todos os sons", year: "2024", type: "COMPILAÇÃO · OUTROS", category: "outros", price: 139.9, badge: "OUTROS SONS", cover: "outros", coverTitle: "OUTROS\nSONS", label: "#768966" }
];
const money = n => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);
const grid = document.getElementById("productGrid");
const cart = new Map();
let activeFilter = "todos";
let shipping = null;
let toastTimer;
const menuToggle = document.getElementById("menuToggle");
const siteMenu = document.getElementById("siteMenu");

function setMenuOpen(open) {
  siteMenu.hidden = !open;
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
}
menuToggle.addEventListener("click", () => setMenuOpen(siteMenu.hidden));
siteMenu.addEventListener("click", e => { if (e.target.closest("a")) setMenuOpen(false); });
document.addEventListener("click", e => {
  if (!e.target.closest(".site-header") && !e.target.closest("#siteMenu")) setMenuOpen(false);
});

function coverMarkup(product) {
  const titles = { bebel:"TANTO\nTEMPO", joao:"AMOROSO", nina:"LITTLE GIRL\nBLUE", tim:"RACIONAL\nVOL. 1", gal:"ÍNDIA", bad:"IV" };
  return `<div class="sleeve ${product.cover}" style="--label:${product.label}"><span class="cover-title">${product.coverTitle || titles[product.id]}</span><span class="disc-art"></span><span class="cover-type">${product.artist} · ${product.year}</span></div>`;
}
function renderProducts() {
  const query = document.getElementById("searchInput").value.trim().toLocaleLowerCase("pt-BR");
  let shown = products.filter(p => {
    const categoryMatch = activeFilter === "todos" || (activeFilter === "novidades" ? p.badge === "NOVO POR AQUI" : activeFilter === "jazz" ? p.category === "jazz" || p.type.includes("JAZZ") : activeFilter === "brasil" ? p.type.includes("BRASIL") : p.category === activeFilter);
    const queryMatch = !query || `${p.artist} ${p.title} ${p.type}`.toLocaleLowerCase("pt-BR").includes(query);
    return categoryMatch && queryMatch;
  });
  const sort = document.getElementById("sortSelect").value;
  if (sort === "price-low") shown.sort((a,b) => a.price-b.price);
  if (sort === "price-high") shown.sort((a,b) => b.price-a.price);
  document.getElementById("catalogCount").textContent = `${String(shown.length).padStart(2,"0")} / ${String(products.length).padStart(2,"0")}`;
  grid.innerHTML = shown.length ? shown.map(p => `<article class="product-card"><div class="product-image"><span class="product-badge">${p.badge}</span><div class="vinyl-disc" style="--label:${p.label}"></div>${coverMarkup(p)}<button class="quick-add" data-add="${p.id}" aria-label="Adicionar ${p.title} à sacola">+</button></div><div class="product-info"><span class="product-artist">${p.artist}</span><span class="product-price">${money(p.price)}<sub>ou 3x sem juros</sub></span><span class="product-title">${p.title}</span><span class="product-meta">${p.year} &nbsp;·&nbsp; ${p.type}</span></div></article>`).join("") : `<div class="no-results">Não encontramos esse disco. Tente outro artista ou estilo.</div>`;
}
function quantity() { return [...cart.values()].reduce((sum, item) => sum + item.qty, 0); }
function subtotal() { return [...cart.values()].reduce((sum, item) => sum + item.product.price * item.qty, 0); }
function refreshCart() {
  const count = quantity();
  const total = subtotal();
  document.getElementById("cartCount").textContent = count;
  document.getElementById("drawerCount").textContent = `(${count})`;
  document.getElementById("subtotalValue").textContent = money(total);
  document.getElementById("mobileCount").textContent = count;
  document.getElementById("mobileTotal").textContent = money(total);
  document.getElementById("mobileCartBar").classList.toggle("visible", count > 0);
  document.getElementById("cartEmpty").hidden = count > 0;
  document.getElementById("cartBottom").hidden = count === 0;
  document.getElementById("cartContent").innerHTML = [...cart.values()].map(({product:p,qty}) => `<div class="cart-item"><div class="cart-thumb" style="background:#e7e3d8">${coverMarkup(p)}</div><div><p class="cart-item-artist">${p.artist}</p><p class="cart-item-name">${p.title}</p><div class="qty-control"><button data-qty="${p.id}" data-delta="-1" aria-label="Diminuir quantidade">−</button><span>${qty}</span><button data-qty="${p.id}" data-delta="1" aria-label="Aumentar quantidade">+</button><button class="remove-item" data-remove="${p.id}">remover</button></div></div><strong class="cart-item-price">${money(p.price*qty)}</strong></div>`).join("");
  const shippingValue = document.getElementById("shippingValue");
  shippingValue.textContent = total >= 300 ? "Grátis" : shipping === null ? "Calculada no próximo passo" : money(shipping);
}
function showToast(message) {
  const toast = document.getElementById("toast"); toast.textContent = message; toast.classList.add("show");
  clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove("show"), 2100);
}
function addToCart(id) {
  const product = products.find(p => p.id === id); const existing = cart.get(id);
  cart.set(id, { product, qty: (existing?.qty || 0) + 1 }); refreshCart(); showToast(`${product.title} entrou na sacola`);
}
function openCart() { document.body.classList.add("cart-open"); document.getElementById("cartDrawer").setAttribute("aria-hidden","false"); }
function closeCart() { document.body.classList.remove("cart-open"); document.getElementById("cartDrawer").setAttribute("aria-hidden","true"); }
grid.addEventListener("click", e => { const button = e.target.closest("[data-add]"); if (button) addToCart(button.dataset.add); });
document.getElementById("cartContent").addEventListener("click", e => {
  const qtyButton = e.target.closest("[data-qty]"); const removeButton = e.target.closest("[data-remove]");
  if (removeButton) cart.delete(removeButton.dataset.remove);
  if (qtyButton) { const item = cart.get(qtyButton.dataset.qty); item.qty += Number(qtyButton.dataset.delta); if (item.qty < 1) cart.delete(qtyButton.dataset.qty); }
  refreshCart();
});
document.querySelectorAll(".filter-chip").forEach(button => button.addEventListener("click", () => { document.querySelector(".filter-chip.active").classList.remove("active"); button.classList.add("active"); activeFilter = button.dataset.filter; renderProducts(); }));
document.getElementById("sortSelect").addEventListener("change", renderProducts);
document.getElementById("searchInput").addEventListener("input", renderProducts);
function showSearch() { const panel = document.getElementById("searchPanel"); panel.hidden = false; document.getElementById("searchInput").focus(); panel.scrollIntoView({ behavior:"smooth", block:"center" }); }
document.querySelector(".search-toggle").addEventListener("click", showSearch);
document.getElementById("searchButton").addEventListener("click", showSearch);
document.getElementById("searchClose").addEventListener("click", () => { document.getElementById("searchInput").value = ""; document.getElementById("searchPanel").hidden = true; renderProducts(); });
document.getElementById("cartOpen").addEventListener("click", openCart);
document.getElementById("mobileCartOpen").addEventListener("click", openCart);
document.getElementById("cartClose").addEventListener("click", closeCart);
document.getElementById("drawerScrim").addEventListener("click", closeCart);
document.getElementById("backToShop").addEventListener("click", closeCart);
document.addEventListener("keydown", e => { if (e.key === "Escape") { closeCart(); closeCheckout(); setMenuOpen(false); } });
document.getElementById("cepInput").addEventListener("input", e => { let v = e.target.value.replace(/\D/g,"").slice(0,8); if(v.length>5) v=v.slice(0,5)+"-"+v.slice(5); e.target.value=v; });
document.getElementById("calcShipping").addEventListener("click", () => {
  const cep = document.getElementById("cepInput").value.replace(/\D/g,""); const output = document.getElementById("shippingResult");
  if (cep.length !== 8) { output.textContent = "Digite um CEP válido com 8 números."; output.style.color = "var(--red)"; return; }
  output.style.color = "";
  if (subtotal() >= 300) { shipping = 0; output.textContent = "Boa! Seu pedido tem frete grátis."; }
  else { const prefix = Number(cep.slice(0,2)); shipping = prefix <= 39 ? 18.9 : prefix <= 69 ? 24.9 : 29.9; output.textContent = `Entrega estimada: 5 a 9 dias úteis · ${money(shipping)}.`; }
  document.getElementById("checkoutCep").value = document.getElementById("cepInput").value; refreshCart();
});
const modal = document.getElementById("checkoutModal");
function openCheckout() { modal.classList.add("open"); modal.setAttribute("aria-hidden","false"); document.getElementById("checkoutCep").value = document.getElementById("cepInput").value; }
function closeCheckout() { modal.classList.remove("open"); modal.setAttribute("aria-hidden","true"); }
document.getElementById("checkoutButton").addEventListener("click", openCheckout);
document.getElementById("modalClose").addEventListener("click", closeCheckout);
modal.addEventListener("click", e => { if(e.target === modal) closeCheckout(); });
document.getElementById("placeOrder").addEventListener("click", () => { const fields = [...document.querySelectorAll(".checkout-fields input")]; const missing = fields.find(input => !input.value.trim()); if (missing) { missing.focus(); missing.style.borderColor = "var(--red)"; showToast("Preencha seus dados para continuar"); return; } document.getElementById("checkoutForm").hidden = true; document.getElementById("orderSuccess").hidden = false; });
document.getElementById("finishOrder").addEventListener("click", () => { cart.clear(); shipping = null; refreshCart(); closeCheckout(); closeCart(); document.getElementById("checkoutForm").hidden = false; document.getElementById("orderSuccess").hidden = true; });
renderProducts(); refreshCart();
