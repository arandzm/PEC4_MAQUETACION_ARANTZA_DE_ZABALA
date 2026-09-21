document.addEventListener("DOMContentLoaded", () => {
  // 1. Inyectar componentes emergentes en el DOM si no existen
  injectDrawers();

  // 2. Elementos del DOM
  const header = document.querySelector(".main-header");
  const overlay = document.getElementById("siteOverlay");
  const searchDrawer = document.getElementById("searchDrawer");
  const bagDrawer = document.getElementById("bagDrawer");
  
  // Enlaces de activación
  const searchBtn = Array.from(document.querySelectorAll("a")).find(
    (a) => a.textContent.trim() === "SEARCH"
  );
  const bagBtn = document.getElementById("bagCounter");
  const closeSearchBtn = document.getElementById("closeSearch");
  const closeBagBtn = document.getElementById("closeBag");

  // Función para abrir buscador
  if (searchBtn) {
    searchBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (header) header.classList.add("search-open");
      if (searchDrawer) searchDrawer.classList.add("active");
      if (overlay) overlay.classList.add("active");
      const searchInput = document.getElementById("searchInput");
      if (searchInput) searchInput.focus();
    });
  }

  // Función para abrir bolsa / carrito
  if (bagBtn) {
    bagBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (bagDrawer) bagDrawer.classList.add("active");
      if (overlay) overlay.classList.add("active");
    });
  }

  // Cierre genérico
  function closeAll() {
    if (header) header.classList.remove("search-open");
    if (searchDrawer) searchDrawer.classList.remove("active");
    if (bagDrawer) bagDrawer.classList.remove("active");
    if (overlay) overlay.classList.remove("active");
  }

  if (closeSearchBtn) closeSearchBtn.addEventListener("click", closeAll);
  if (closeBagBtn) closeBagBtn.addEventListener("click", closeAll);
  if (overlay) overlay.addEventListener("click", closeAll);

  // Cerrar con tecla Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeAll();
  });
});

/**
 * Inyecta el overlay, el buscador y el carrito en el body
 */
function injectDrawers() {
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
      <div class="bag-content">
        <p class="empty-bag-msg">YOUR BAG IS CURRENTLY EMPTY.</p>
      </div>
    `;
    document.body.appendChild(bagDrawer);
  }
}