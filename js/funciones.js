
/* ----------------------------------------------------------
   1. CONFIGURACIÓN
   ---------------------------------------------------------- */
const CONFIG = {
  storageKeys: {
    cart: "arimaCart",
    newsletter: "arimaNewsletterSubscribed",
  },
  emailRegex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  genericSearchTerms: ["top", "tops", "ropa", "colección", "coleccion", "shop", "all", "new"],
};

/* ----------------------------------------------------------
   2. UTILIDADES
   ---------------------------------------------------------- */
const dom = {
  one: (selector, scope = document) => scope.querySelector(selector),
  all: (selector, scope = document) => Array.from(scope.querySelectorAll(selector)),
};

function isValidEmail(value) {
  return CONFIG.emailRegex.test(value.trim());
}

function parsePrice(priceText) {
  // "€85,00 EUR" -> 85.00
  const numeric = priceText.replace(/[^\d,.-]/g, "").replace(",", ".");
  return parseFloat(numeric) || 0;
}

function formatPrice(amount) {
  return `€${amount.toFixed(2).replace(".", ",")} EUR`;
}

function showFeedback(element, message, type) {
  if (!element) return;
  element.textContent = message;
  element.classList.remove("is-success", "is-error");
  element.classList.add(type === "success" ? "is-success" : "is-error");
}

function ensureFeedbackElement(afterElement, id) {
  let feedback = document.getElementById(id);
  if (!feedback) {
    feedback = document.createElement("p");
    feedback.id = id;
    feedback.className = "form-feedback";
    feedback.setAttribute("aria-live", "polite");
    afterElement.insertAdjacentElement("afterend", feedback);
  }
  return feedback;
}

/* ----------------------------------------------------------
   3. ESTADO GLOBAL DE LA APP
   ---------------------------------------------------------- */
const state = {
  cart: [],
  activeProduct: null,
};

/* ----------------------------------------------------------
   4. REFERENCIAS AL DOM (cacheadas una sola vez)
   ---------------------------------------------------------- */
const refs = {};

function cacheRefs() {
  refs.header = dom.one(".main-header");
  refs.menuToggle = dom.one("#menuToggle");
  refs.searchBtn = dom.one("#searchBtn");
  refs.bagBtn = dom.one("#bagCounter");
  refs.mainContent = dom.one("main");

  refs.overlay = null;
  refs.searchDrawer = null;
  refs.bagDrawer = null;
  refs.bagContent = null;
  refs.bagFooter = null;
  refs.bagSubtotal = null;
  refs.searchInput = null;
  refs.closeSearchBtn = null;
  refs.closeBagBtn = null;
  refs.lightbox = null;
  refs.lightboxImage = null;
  refs.lightboxTitle = null;
  refs.lightboxPrice = null;
  refs.lightboxAddBtn = null;
  refs.lightboxFeedback = null;
  refs.closeLightboxBtn = null;
}

/* ----------------------------------------------------------
   5. NAVEGACIÓN: MENÚ HAMBURGUESA (RESPONSIVE)
   ---------------------------------------------------------- */
function setViewportHeightVar() {

  const realViewportUnit = window.innerHeight * 0.01;
  document.documentElement.style.setProperty("--vh", `${realViewportUnit}px`);
}

function initResponsiveMenu() {
  if (!refs.header || !refs.menuToggle) return;

  refs.menuToggle.addEventListener("click", () => {
    const isOpen = refs.header.classList.toggle("nav-open");
    refs.menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  const navLeft = dom.one("#navLeft", refs.header);
  if (navLeft) {
    navLeft.addEventListener("click", (event) => {
      if (event.target.tagName === "A") closeMobileMenu();
    });
  }
}

function closeMobileMenu() {
  if (!refs.header) return;
  refs.header.classList.remove("nav-open");
  if (refs.menuToggle) refs.menuToggle.setAttribute("aria-expanded", "false");
}

/* ----------------------------------------------------------
   6. PANELES EMERGENTES: OVERLAY, SEARCH DRAWER, BAG DRAWER, LIGHTBOX
   ---------------------------------------------------------- */
function injectOverlays() {
  if (!document.getElementById("siteOverlay")) {
    const overlay = document.createElement("div");
    overlay.className = "site-overlay";
    overlay.id = "siteOverlay";
    document.body.appendChild(overlay);
  }

  if (!document.getElementById("searchDrawer")) {
    const searchDrawer = document.createElement("div");
    searchDrawer.className = "search-drawer";
    searchDrawer.id = "searchDrawer";
    searchDrawer.innerHTML = `
      <div class="search-drawer-content">
        <div class="search-input-group">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input type="search" id="searchInput" placeholder="SEARCH FOR..." autocomplete="off">
        </div>
        <button class="drawer-close-btn" id="closeSearch" aria-label="Cerrar búsqueda">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    `;
    document.body.appendChild(searchDrawer);
  }

  if (!document.getElementById("bagDrawer")) {
    const bagDrawer = document.createElement("div");
    bagDrawer.className = "bag-drawer";
    bagDrawer.id = "bagDrawer";
    bagDrawer.innerHTML = `
      <div class="bag-header">
        <h2>YOUR BAG</h2>
        <button class="drawer-close-btn" id="closeBag" aria-label="Cerrar bolsa">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <div class="bag-content" id="bagContent">
        <p class="empty-bag-msg">YOUR BAG IS CURRENTLY EMPTY.</p>
      </div>
      <div class="bag-footer" id="bagFooter" hidden>
        <div class="bag-subtotal">
          <span>Subtotal</span>
          <span id="bagSubtotal">€0,00 EUR</span>
        </div>
      </div>
    `;
    document.body.appendChild(bagDrawer);
  }

  if (!document.getElementById("productLightbox")) {
    const lightbox = document.createElement("div");
    lightbox.className = "lightbox";
    lightbox.id = "productLightbox";
    lightbox.innerHTML = `
      <div class="lightbox-content">
        <button class="drawer-close-btn lightbox-close" id="closeLightbox" aria-label="Cerrar vista rápida">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        <div class="lightbox-image-wrapper">
          <img id="lightboxImage" src="" alt="">
        </div>
        <div class="lightbox-info">
          <h2 id="lightboxTitle"></h2>
          <p id="lightboxPrice"></p>
          <button type="button" class="btn-add-bag" id="lightboxAddBtn">ADD TO BAG</button>
          <p class="lightbox-feedback" id="lightboxFeedback" aria-live="polite"></p>
        </div>
      </div>
    `;
    document.body.appendChild(lightbox);
  }

  refs.overlay = dom.one("#siteOverlay");
  refs.searchDrawer = dom.one("#searchDrawer");
  refs.searchInput = dom.one("#searchInput");
  refs.closeSearchBtn = dom.one("#closeSearch");

  refs.bagDrawer = dom.one("#bagDrawer");
  refs.bagContent = dom.one("#bagContent");
  refs.bagFooter = dom.one("#bagFooter");
  refs.bagSubtotal = dom.one("#bagSubtotal");
  refs.closeBagBtn = dom.one("#closeBag");

  refs.lightbox = dom.one("#productLightbox");
  refs.lightboxImage = dom.one("#lightboxImage");
  refs.lightboxTitle = dom.one("#lightboxTitle");
  refs.lightboxPrice = dom.one("#lightboxPrice");
  refs.lightboxAddBtn = dom.one("#lightboxAddBtn");
  refs.lightboxFeedback = dom.one("#lightboxFeedback");
  refs.closeLightboxBtn = dom.one("#closeLightbox");
}

function closeAllPanels() {
  closeMobileMenu();
  if (refs.searchDrawer) refs.searchDrawer.classList.remove("active");
  if (refs.bagDrawer) refs.bagDrawer.classList.remove("active");
  if (refs.lightbox) refs.lightbox.classList.remove("active");
  if (refs.overlay) refs.overlay.classList.remove("active");
  unlockPageScroll();
}

function lockPageScroll() {
  document.documentElement.classList.add("no-scroll");
  document.body.classList.add("no-scroll");
}

function unlockPageScroll() {
  document.documentElement.classList.remove("no-scroll");
  document.body.classList.remove("no-scroll");
}

function positionPanels() {
  if (!refs.header) return;
  const headerBottom = Math.round(refs.header.getBoundingClientRect().bottom);

  if (refs.searchDrawer) {
    refs.searchDrawer.style.top = `${headerBottom}px`;
  }
  if (refs.overlay) {
    refs.overlay.style.top = `${headerBottom}px`;
    refs.overlay.style.height = `calc(100vh - ${headerBottom}px)`;
  }
}

function openSearchDrawer() {
  positionPanels();
  if (refs.header) refs.header.classList.add("search-open");
  if (refs.searchDrawer) refs.searchDrawer.classList.add("active");
  if (refs.overlay) refs.overlay.classList.add("active");
  lockPageScroll();
  if (refs.searchInput) {
    refs.searchInput.value = "";
    refs.searchInput.focus();
  }
}

function openBagDrawer() {
  positionPanels();
  if (refs.bagDrawer) refs.bagDrawer.classList.add("active");
  if (refs.overlay) refs.overlay.classList.add("active");
  lockPageScroll();
}

function openLightbox() {
  positionPanels();
  if (refs.lightbox) refs.lightbox.classList.add("active");
  if (refs.overlay) refs.overlay.classList.add("active");
  lockPageScroll();
}

function initPanelEvents() {
  if (refs.searchBtn) {
    refs.searchBtn.addEventListener("click", (event) => {
      event.preventDefault();
      openSearchDrawer();
    });
  }

  if (refs.bagBtn) {
    refs.bagBtn.addEventListener("click", (event) => {
      event.preventDefault();
      openBagDrawer();
    });
  }

  if (refs.closeSearchBtn) refs.closeSearchBtn.addEventListener("click", closeAllPanels);
  if (refs.closeBagBtn) refs.closeBagBtn.addEventListener("click", closeAllPanels);
  if (refs.closeLightboxBtn) refs.closeLightboxBtn.addEventListener("click", closeAllPanels);
  if (refs.overlay) refs.overlay.addEventListener("click", closeAllPanels);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeAllPanels();
  });

  window.addEventListener("resize", () => {
    if (refs.searchDrawer?.classList.contains("active") || refs.overlay?.classList.contains("active")) {
      positionPanels();
    }
  });

  if (refs.searchInput) {
    refs.searchInput.addEventListener("keydown", handleSearchSubmit);
  }
}

/* ----------------------------------------------------------
   7. BUSCADOR / FILTRADO DE PRODUCTOS
   ---------------------------------------------------------- */
function handleSearchSubmit(event) {
  if (event.key !== "Enter") return;
  event.preventDefault();

  const query = refs.searchInput.value.trim().toLowerCase();
  if (query.length === 0) return;

  if (window.location.pathname.includes("shop.html")) {
    filterProductsGenerically(query);
    closeAllPanels();
    const newUrl = `${window.location.pathname}?search=${encodeURIComponent(query)}`;
    window.history.pushState({ path: newUrl }, "", newUrl);
  } else {
    window.location.href = `shop.html?search=${encodeURIComponent(query)}`;
  }
}

function filterProductsGenerically(term) {
  const cleanTerm = term.toLowerCase().trim();
  const productCards = dom.all(".product-card");
  const isGenericSearch = CONFIG.genericSearchTerms.some(
    (word) => cleanTerm.includes(word) || word.includes(cleanTerm)
  );

  productCards.forEach((card) => {
    const textContent = card.textContent.toLowerCase();
    const category = (card.getAttribute("data-category") || "").toLowerCase();
    const matches = isGenericSearch || textContent.includes(cleanTerm) || category.includes(cleanTerm);
    card.style.display = matches ? "" : "none";
  });
}

function applyInitialSearchFilter() {
  if (!window.location.pathname.includes("shop.html")) return;
  const urlParams = new URLSearchParams(window.location.search);
  const searchTerm = urlParams.get("search");
  if (searchTerm) filterProductsGenerically(searchTerm);
}

/* ----------------------------------------------------------
   8. LIGHTBOX DE PRODUCTO (VISTA RÁPIDA)
   ---------------------------------------------------------- */
function readProductFromCard(card) {
  const image = dom.one("img", card);
  const title = dom.one(".product-title", card);
  const price = dom.one(".product-price", card);

  return {
    id: card.dataset.productId,
    name: title ? title.textContent.trim() : "Producto Arima",
    priceText: price ? price.textContent.trim() : "€0,00 EUR",
    priceValue: price ? parsePrice(price.textContent) : 0,
    image: image ? image.getAttribute("src") : "",
    alt: image ? image.getAttribute("alt") : "",
  };
}

function openProductLightbox(product) {
  state.activeProduct = product;

  refs.lightboxImage.setAttribute("src", product.image);
  refs.lightboxImage.setAttribute("alt", product.alt);
  refs.lightboxTitle.textContent = product.name;
  refs.lightboxPrice.textContent = product.priceText;
  refs.lightboxFeedback.textContent = "";

  openLightbox();
}

function initProductGrid() {

  if (!refs.mainContent) return;

  refs.mainContent.addEventListener("click", (event) => {
    const card = event.target.closest(".product-card");
    if (!card) return;
    const product = readProductFromCard(card);
    openProductLightbox(product);
  });

  if (refs.lightboxAddBtn) {
    refs.lightboxAddBtn.addEventListener("click", () => {
      if (!state.activeProduct) return;
      addToCart(state.activeProduct);
      showFeedback(refs.lightboxFeedback, "Añadido a tu bolsa.", "success");
    });
  }
}

/* ----------------------------------------------------------
   9. CARRITO / BOLSA DE COMPRA
   ---------------------------------------------------------- */
function loadCart() {
  try {
    const stored = localStorage.getItem(CONFIG.storageKeys.cart);
    state.cart = stored ? JSON.parse(stored) : [];
  } catch (error) {
    state.cart = [];
  }
}

function saveCart() {
  localStorage.setItem(CONFIG.storageKeys.cart, JSON.stringify(state.cart));
}

function addToCart(product) {
  const existingItem = state.cart.find((item) => item.id === product.id);
  if (existingItem) {
    existingItem.qty += 1;
  } else {
    state.cart.push({
      id: product.id,
      name: product.name,
      priceValue: product.priceValue,
      image: product.image,
      qty: 1,
    });
  }
  saveCart();
  renderCart();
}

function changeItemQty(productId, delta) {
  const item = state.cart.find((entry) => entry.id === productId);
  if (!item) return;

  item.qty += delta;
  if (item.qty <= 0) {
    state.cart = state.cart.filter((entry) => entry.id !== productId);
  }
  saveCart();
  renderCart();
}

function getCartCount() {
  return state.cart.reduce((total, item) => total + item.qty, 0);
}

function getCartSubtotal() {
  return state.cart.reduce((total, item) => total + item.qty * item.priceValue, 0);
}

function updateBagCounters() {
  const count = getCartCount();
  dom.all("#bagCounter").forEach((el) => {
    el.textContent = `BAG (${count})`;
  });
}

function renderCart() {
  updateBagCounters();
  if (!refs.bagContent) return;

  if (state.cart.length === 0) {
    refs.bagContent.innerHTML = `<p class="empty-bag-msg">YOUR BAG IS CURRENTLY EMPTY.</p>`;
    if (refs.bagFooter) refs.bagFooter.hidden = true;
    return;
  }

  const itemsMarkup = state.cart
    .map(
      (item) => `
      <div class="cart-item" data-id="${item.id}">
        <div class="cart-item-image">
          <img src="${item.image}" alt="${item.name}">
        </div>
        <div class="cart-item-info">
          <p class="cart-item-name">${item.name}</p>
          <p class="cart-item-price">${formatPrice(item.priceValue)}</p>
          <div class="cart-item-qty">
            <button type="button" class="qty-btn" data-action="decrease" data-id="${item.id}" aria-label="Restar unidad">−</button>
            <span>${item.qty}</span>
            <button type="button" class="qty-btn" data-action="increase" data-id="${item.id}" aria-label="Sumar unidad">+</button>
          </div>
        </div>
      </div>`
    )
    .join("");

  refs.bagContent.innerHTML = `<div class="cart-item-list">${itemsMarkup}</div>`;

  if (refs.bagFooter) {
    refs.bagFooter.hidden = false;
    refs.bagSubtotal.textContent = formatPrice(getCartSubtotal());
  }
}

function initCartEvents() {
  if (!refs.bagContent) return;

  refs.bagContent.addEventListener("click", (event) => {
    const button = event.target.closest(".qty-btn");
    if (!button) return;
    const delta = button.dataset.action === "increase" ? 1 : -1;
    changeItemQty(button.dataset.id, delta);
  });
}

/* ----------------------------------------------------------
   10. FORMULARIO NEWSLETTER (about, index, new_in, shop)
   ---------------------------------------------------------- */
function initNewsletterForm() {
  const form = dom.one("#newsletterForm");
  if (!form) return;

  const emailInput = dom.one("#newsletterEmail", form);
  const feedback = ensureFeedbackElement(form, "newsletterFeedback");

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!isValidEmail(emailInput.value)) {
      showFeedback(feedback, "Introduce un email válido.", "error");
      emailInput.focus();
      return;
    }

    showFeedback(feedback, "¡Gracias por suscribirte!", "success");
    form.reset();
  });
}

/* ----------------------------------------------------------
   11. PÁGINA LOGIN: EMAIL, SHOP PAY, PREFERENCIA NEWSLETTER
   ---------------------------------------------------------- */
function initLoginForm() {
  const form = dom.one("#loginForm");
  if (!form) return;

  const emailInput = dom.one("#emailInput", form);
  const feedback = ensureFeedbackElement(form, "loginFeedback");

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!isValidEmail(emailInput.value)) {
      showFeedback(feedback, "Ese email no parece válido.", "error");
      emailInput.focus();
      return;
    }

    showFeedback(feedback, "Te hemos enviado un enlace de acceso.", "success");
    form.reset();
  });
}

function initShopPayButton() {
  const button = dom.one("#btnShopPay");
  if (!button) return;

  button.addEventListener("click", () => {
    const originalText = button.innerHTML;
    button.disabled = true;
    button.textContent = "Redirecting…";

    window.setTimeout(() => {
      button.disabled = false;
      button.innerHTML = originalText;
    }, 1800);
  });
}

function initNewsletterCheckbox() {
  const checkbox = dom.one("#newsletterCheckbox");
  if (!checkbox) return;

  const stored = localStorage.getItem(CONFIG.storageKeys.newsletter);
  if (stored !== null) checkbox.checked = stored === "true";

  checkbox.addEventListener("change", () => {
    localStorage.setItem(CONFIG.storageKeys.newsletter, String(checkbox.checked));
  });
}

/* ----------------------------------------------------------
   12. INICIALIZACIÓN GENERAL
   ---------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  cacheRefs();
  injectOverlays();
  setViewportHeightVar();
  positionPanels();

  initResponsiveMenu();
  initPanelEvents();
  applyInitialSearchFilter();

  loadCart();
  initProductGrid();
  initCartEvents();
  renderCart();

  initNewsletterForm();
  initLoginForm();
  initShopPayButton();
  initNewsletterCheckbox();
});

window.addEventListener("load", () => {
  setViewportHeightVar();
  positionPanels();
});

window.addEventListener("resize", setViewportHeightVar);
window.addEventListener("orientationchange", setViewportHeightVar);
