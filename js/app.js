// ChronoLux - Asosiy Dastur Logikasi va Interfeys Boshqaruvi

// Filtrlar holati
const FilterState = {
  category: "all",
  brands: [],
  mechanisms: [],
  maxPrice: 500000000,
  searchQuery: "",
  sortBy: "popular",
};

// DOM tayyor bo'lganda ishga tushirish
document.addEventListener("DOMContentLoaded", () => {
  initUI();
  renderProducts();
  Store.updateBadges();
  renderCartDrawer();
  renderWishlistDrawer();
});

// Interfeys elementlarini bog'lash
function initUI() {
  // Valyuta tugmalari
  const btnUzs = document.getElementById("curr-uzs");
  const btnUsd = document.getElementById("curr-usd");
  if (btnUzs && btnUsd) {
    btnUzs.addEventListener("click", () => Store.setCurrency("UZS"));
    btnUsd.addEventListener("click", () => Store.setCurrency("USD"));
  }
  updateCurrencyUI();

  // Qidiruv maydoni
  const searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      FilterState.searchQuery = e.target.value.toLowerCase().trim();
      renderProducts();
    });
  }

  // Saralash (Sort select)
  const sortSelect = document.getElementById("sort-select");
  if (sortSelect) {
    sortSelect.addEventListener("change", (e) => {
      FilterState.sortBy = e.target.value;
      renderProducts();
    });
  }

  // Kategoriya tezkor tablari
  const tabButtons = document.querySelectorAll(".tab-btn");
  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const cat = btn.getAttribute("data-category");
      FilterState.category = cat;

      // Sidebar radiolarni sinxronlashtirish
      const radio = document.querySelector(
        `input[name="cat-radio"][value="${cat}"]`,
      );
      if (radio) radio.checked = true;

      renderProducts();
    });
  });

  // Sidebar Kategoriya radiolari
  const catRadios = document.querySelectorAll('input[name="cat-radio"]');
  catRadios.forEach((radio) => {
    radio.addEventListener("change", (e) => {
      FilterState.category = e.target.value;

      // Tablarni sinxronlashtirish
      tabButtons.forEach((b) => {
        b.classList.toggle(
          "active",
          b.getAttribute("data-category") === e.target.value,
        );
      });

      renderProducts();
    });
  });

  // Brend chekbokslari
  const brandCheckboxes = document.querySelectorAll(
    'input[name="brand-filter"]',
  );
  brandCheckboxes.forEach((cb) => {
    cb.addEventListener("change", () => {
      FilterState.brands = Array.from(brandCheckboxes)
        .filter((c) => c.checked)
        .map((c) => c.value);
      renderProducts();
    });
  });

  // Mexanizm chekbokslari
  const mechCheckboxes = document.querySelectorAll('input[name="mech-filter"]');
  mechCheckboxes.forEach((cb) => {
    cb.addEventListener("change", () => {
      FilterState.mechanisms = Array.from(mechCheckboxes)
        .filter((c) => c.checked)
        .map((c) => c.value);
      renderProducts();
    });
  });

  // Narx slayderi
  const priceSlider = document.getElementById("price-slider");
  const priceMaxLabel = document.getElementById("price-max-label");
  if (priceSlider && priceMaxLabel) {
    priceSlider.addEventListener("input", (e) => {
      FilterState.maxPrice = parseInt(e.target.value);
      priceMaxLabel.textContent = formatPrice(
        FilterState.maxPrice,
        Store.currency,
      );
      renderProducts();
    });
  }

  // Filtrlarni tozalash tugmasi
  const resetBtn = document.getElementById("btn-reset-filters");
  if (resetBtn) {
    resetBtn.addEventListener("click", resetAllFilters);
  }

  // Drawer ochish / yopish hodisalari
  setupDrawers();

  // FAQ akkordeon
  setupFAQ();

  // Buyurtma formasi
  setupCheckoutForm();
}

// Valyuta UI faolligini yangilash
function updateCurrencyUI() {
  const btnUzs = document.getElementById("curr-uzs");
  const btnUsd = document.getElementById("curr-usd");
  if (btnUzs && btnUsd) {
    btnUzs.classList.toggle("active", Store.currency === "UZS");
    btnUsd.classList.toggle("active", Store.currency === "USD");
  }

  // Narx ko'rsatkichini yangilash
  const priceMaxLabel = document.getElementById("price-max-label");
  if (priceMaxLabel) {
    priceMaxLabel.textContent = formatPrice(
      FilterState.maxPrice,
      Store.currency,
    );
  }
}

// Filtrlarni butunlay tozalash
function resetAllFilters() {
  FilterState.category = "all";
  FilterState.brands = [];
  FilterState.mechanisms = [];
  FilterState.maxPrice = 500000000;
  FilterState.searchQuery = "";
  FilterState.sortBy = "popular";

  // Inputlarni tozalash
  const searchInput = document.getElementById("search-input");
  if (searchInput) searchInput.value = "";

  const sortSelect = document.getElementById("sort-select");
  if (sortSelect) sortSelect.value = "popular";

  const priceSlider = document.getElementById("price-slider");
  if (priceSlider) priceSlider.value = 500000000;

  document.querySelectorAll(".tab-btn").forEach((b) => {
    b.classList.toggle("active", b.getAttribute("data-category") === "all");
  });

  document.querySelectorAll('input[name="cat-radio"]').forEach((r) => {
    r.checked = r.value === "all";
  });

  document
    .querySelectorAll('input[name="brand-filter"], input[name="mech-filter"]')
    .forEach((c) => {
      c.checked = false;
    });

  updateCurrencyUI();
  renderProducts();
  showToast("Barcha filtrlar tozalandi", "info");
}

// Mahsulotlarni render qilish
function renderProducts() {
  const grid = document.getElementById("products-grid");
  const countEl = document.getElementById("catalog-count-num");
  if (!grid) return;

  // Filtrlash
  let filtered = WATCH_PRODUCTS.filter((product) => {
    // Kategoriya
    if (
      FilterState.category !== "all" &&
      product.category !== FilterState.category
    ) {
      return false;
    }

    // Brend
    if (
      FilterState.brands.length > 0 &&
      !FilterState.brands.includes(product.brand)
    ) {
      return false;
    }

    // Mexanizm
    if (FilterState.mechanisms.length > 0) {
      const matchMech = FilterState.mechanisms.some((m) =>
        product.mechanism.toLowerCase().includes(m.toLowerCase()),
      );
      if (!matchMech) return false;
    }

    // Narx
    if (product.price > FilterState.maxPrice) {
      return false;
    }

    // Qidiruv
    if (FilterState.searchQuery) {
      const query = FilterState.searchQuery;
      const matchText = (
        product.name +
        " " +
        product.brand +
        " " +
        product.description
      ).toLowerCase();
      if (!matchText.includes(query)) return false;
    }

    return true;
  });

  // Saralash
  switch (FilterState.sortBy) {
    case "price-asc":
      filtered.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      filtered.sort((a, b) => b.price - a.price);
      break;
    case "rating":
      filtered.sort((a, b) => b.rating - a.rating);
      break;
    case "new":
      filtered.sort(
        (a, b) => (b.badge === "Yangi" ? 1 : 0) - (a.badge === "Yangi" ? 1 : 0),
      );
      break;
    default: // popular
      filtered.sort((a, b) => b.reviewsCount - a.reviewsCount);
      break;
  }

  if (countEl) countEl.textContent = filtered.length;

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="no-products">
        <i class="fas fa-search"></i>
        <h3>Hech qanday soat topilmadi</h3>
        <p>Qidiruv shartlarini o'zgartirib ko'ring yoki filtrlarni tozalang.</p>
        <button class="btn-primary" style="margin-top: 18px;" onclick="resetAllFilters()">
          <i class="fas fa-undo"></i> Filtrlarni tozalash
        </button>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered
    .map((product) => {
      const isWished = Store.isInWishlist(product.id);
      const isCompared = Store.isInCompare(product.id);

      return `
      <div class="product-card" data-id="${product.id}">
        <div class="product-image-wrap">
          <img src="${product.image}" alt="${product.name}" loading="lazy">
          ${product.badge ? `<span class="product-badge badge-${product.badgeType}">${product.badge}</span>` : ""}
          <div class="product-actions">
            <button class="btn-card-action ${isWished ? "active" : ""}" title="Sevimlilarga qo'shish" onclick="Store.toggleWishlist(${product.id})">
              <i class="${isWished ? "fas" : "far"} fa-heart"></i>
            </button>
            <button class="btn-card-action" title="Tez ko'rish" onclick="openQuickView(${product.id})">
              <i class="fas fa-eye"></i>
            </button>
            <button class="btn-card-action ${isCompared ? "active" : ""}" title="Taqqoslash" onclick="Store.toggleCompare(${product.id})">
              <i class="fas fa-balance-scale"></i>
            </button>
          </div>
        </div>
        <div class="product-info">
          <span class="product-brand">${product.brand}</span>
          <h3 class="product-title" title="${product.name}">${product.name}</h3>
          
          <div class="product-meta">
            <div class="product-rating">
              <i class="fas fa-star"></i>
              <span>${product.rating}</span>
            </div>
            <span>•</span>
            <span>(${product.reviewsCount} sharh)</span>
          </div>

          <div class="product-tags">
            <span class="spec-tag"><i class="fas fa-cog"></i> ${product.mechanism.split(" ")[0]}</span>
            <span class="spec-tag"><i class="fas fa-ruler-combined"></i> ${product.diameter}</span>
          </div>

          <div class="product-footer">
            <div class="price-wrap">
              <span class="price-current">${formatPrice(product.price, Store.currency)}</span>
              ${product.oldPrice ? `<span class="price-old">${formatPrice(product.oldPrice, Store.currency)}</span>` : ""}
            </div>
            <button class="btn-add-cart" title="Savatchaga qo'shish" onclick="Store.addToCart(${product.id})">
              <i class="fas fa-shopping-bag"></i>
            </button>
          </div>
        </div>
      </div>
    `;
    })
    .join("");
}

// Savatchani render qilish (Drawer)
function renderCartDrawer() {
  const container = document.getElementById("cart-items-container");
  const countTitle = document.getElementById("cart-drawer-count");
  const subtotalEl = document.getElementById("cart-subtotal");
  const discountRow = document.getElementById("cart-discount-row");
  const discountEl = document.getElementById("cart-discount");
  const grandTotalEl = document.getElementById("cart-grand-total");

  if (!container) return;

  const totals = Store.getCartTotals();
  if (countTitle) countTitle.textContent = `(${totals.itemCount})`;

  if (totals.items.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-shopping-bag"></i>
        <h4>Savatchangiz bo'sh</h4>
        <p>Katalogimizdan o'zingizga ma'qul soatni tanlang va xarid qiling.</p>
        <button class="btn-primary" onclick="closeAllDrawers(); scrollToCatalog();">
          Katalogga o'tish
        </button>
      </div>
    `;
    if (subtotalEl) subtotalEl.textContent = formatPrice(0, Store.currency);
    if (grandTotalEl) grandTotalEl.textContent = formatPrice(0, Store.currency);
    if (discountRow) discountRow.style.display = "none";
    return;
  }

  container.innerHTML = totals.items
    .map(
      (item) => `
    <div class="drawer-item">
      <div class="drawer-item-img">
        <img src="${item.image}" alt="${item.name}">
      </div>
      <div class="drawer-item-info">
        <h4 class="drawer-item-title">${item.name}</h4>
        <div class="drawer-item-price">${formatPrice(item.price, Store.currency)}</div>
        <div class="qty-control">
          <button class="qty-btn" onclick="Store.updateQuantity(${item.id}, -1)">
            <i class="fas fa-minus"></i>
          </button>
          <span class="qty-val">${item.quantity}</span>
          <button class="qty-btn" onclick="Store.updateQuantity(${item.id}, 1)">
            <i class="fas fa-plus"></i>
          </button>
        </div>
      </div>
      <button class="btn-remove-item" title="O'chirish" onclick="Store.removeFromCart(${item.id})">
        <i class="fas fa-trash-alt"></i>
      </button>
    </div>
  `,
    )
    .join("");

  if (subtotalEl)
    subtotalEl.textContent = formatPrice(totals.subtotal, Store.currency);
  if (grandTotalEl)
    grandTotalEl.textContent = formatPrice(totals.grandTotal, Store.currency);

  if (discountRow && discountEl) {
    if (totals.discount > 0) {
      discountRow.style.display = "flex";
      discountEl.textContent = `-${formatPrice(totals.discount, Store.currency)} (${totals.promoDiscountPercent}%)`;
    } else {
      discountRow.style.display = "none";
    }
  }
}

// Sevimlilar Drawerini render qilish
function renderWishlistDrawer() {
  const container = document.getElementById("wishlist-items-container");
  const countTitle = document.getElementById("wishlist-drawer-count");
  if (!container) return;

  const wishlistIds = Store.getWishlist();
  if (countTitle) countTitle.textContent = `(${wishlistIds.length})`;

  const items = wishlistIds
    .map((id) => WATCH_PRODUCTS.find((p) => p.id === id))
    .filter(Boolean);

  if (items.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="far fa-heart"></i>
        <h4>Sevimlilar ro'yxati bo'sh</h4>
        <p>O'zingizga yoqqan soatlarni saqlab qo'yish uchun yurakcha belgisini bosing.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = items
    .map(
      (product) => `
    <div class="drawer-item">
      <div class="drawer-item-img">
        <img src="${product.image}" alt="${product.name}">
      </div>
      <div class="drawer-item-info">
        <h4 class="drawer-item-title">${product.name}</h4>
        <div class="drawer-item-price">${formatPrice(product.price, Store.currency)}</div>
        <button class="btn-primary" style="padding: 6px 14px; font-size: 12px; width: fit-content;" onclick="Store.addToCart(${product.id}); Store.toggleWishlist(${product.id});">
          <i class="fas fa-shopping-bag"></i> Savatga olish
        </button>
      </div>
      <button class="btn-remove-item" title="O'chirish" onclick="Store.toggleWishlist(${product.id})">
        <i class="fas fa-times"></i>
      </button>
    </div>
  `,
    )
    .join("");
}

// Taqqoslash modalini ochish va render qilish
function renderCompareModal() {
  const modal = document.getElementById("compare-modal");
  const body = document.getElementById("compare-modal-content");
  if (!modal || !body) return;

  const ids = Store.getCompare();
  if (ids.length < 2) {
    body.innerHTML = `
      <div class="empty-state" style="padding: 40px 20px;">
        <i class="fas fa-balance-scale"></i>
        <h3>Taqqoslash uchun 2 ta soat tanlang</h3>
        <p>Katalogdagi soatlar ustidagi tarozi belgisini bosib ikkita modelni tanlang.</p>
      </div>
    `;
    return;
  }

  const [p1, p2] = ids.map((id) => WATCH_PRODUCTS.find((p) => p.id === id));
  if (!p1 || !p2) return;

  body.innerHTML = `
    <div class="compare-grid">
      <!-- Ko'rsatkichlar nomlari -->
      <div class="compare-col">
        <div class="compare-head-cell">
          <h4 style="color: var(--gold-light);">Xususiyatlar</h4>
        </div>
        <div class="compare-row-item compare-label-cell">Brend</div>
        <div class="compare-row-item compare-label-cell">Narxi</div>
        <div class="compare-row-item compare-label-cell">Mexanizm turi</div>
        <div class="compare-row-item compare-label-cell">Korpus materiali</div>
        <div class="compare-row-item compare-label-cell">Tasma materiali</div>
        <div class="compare-row-item compare-label-cell">Shisha</div>
        <div class="compare-row-item compare-label-cell">Suvga chidamlilik</div>
        <div class="compare-row-item compare-label-cell">Diametri</div>
        <div class="compare-row-item compare-label-cell">Amallar</div>
      </div>

      <!-- 1-Soat -->
      <div class="compare-col">
        <div class="compare-head-cell">
          <img src="${p1.image}" alt="${p1.name}">
          <h4>${p1.name}</h4>
        </div>
        <div class="compare-row-item">${p1.brand}</div>
        <div class="compare-row-item" style="color: var(--gold-light); font-weight: 700;">${formatPrice(p1.price, Store.currency)}</div>
        <div class="compare-row-item">${p1.mechanism}</div>
        <div class="compare-row-item">${p1.caseMaterial}</div>
        <div class="compare-row-item">${p1.strapMaterial}</div>
        <div class="compare-row-item">${p1.glass}</div>
        <div class="compare-row-item">${p1.waterResistance}</div>
        <div class="compare-row-item">${p1.diameter}</div>
        <div class="compare-row-item">
          <button class="btn-primary" style="padding: 8px 16px; font-size: 13px;" onclick="Store.addToCart(${p1.id}); closeModal('compare-modal');">
            Savatga
          </button>
        </div>
      </div>

      <!-- 2-Soat -->
      <div class="compare-col">
        <div class="compare-head-cell">
          <img src="${p2.image}" alt="${p2.name}">
          <h4>${p2.name}</h4>
        </div>
        <div class="compare-row-item">${p2.brand}</div>
        <div class="compare-row-item" style="color: var(--gold-light); font-weight: 700;">${formatPrice(p2.price, Store.currency)}</div>
        <div class="compare-row-item">${p2.mechanism}</div>
        <div class="compare-row-item">${p2.caseMaterial}</div>
        <div class="compare-row-item">${p2.strapMaterial}</div>
        <div class="compare-row-item">${p2.glass}</div>
        <div class="compare-row-item">${p2.waterResistance}</div>
        <div class="compare-row-item">${p2.diameter}</div>
        <div class="compare-row-item">
          <button class="btn-primary" style="padding: 8px 16px; font-size: 13px;" onclick="Store.addToCart(${p2.id}); closeModal('compare-modal');">
            Savatga
          </button>
        </div>
      </div>
    </div>
  `;
}

// Tez ko'rish oynasini ochish
function openQuickView(productId) {
  const product = WATCH_PRODUCTS.find((p) => p.id === productId);
  if (!product) return;

  const modal = document.getElementById("quickview-modal");
  const container = document.getElementById("quickview-content");
  if (!modal || !container) return;

  container.innerHTML = `
    <div class="quick-view-grid">
      <div class="quick-view-image">
        <img src="${product.image}" alt="${product.name}">
      </div>
      <div class="quick-view-details">
        <span class="modal-brand">${product.brand}</span>
        <h2 class="modal-title">${product.name}</h2>

        <div class="modal-price-wrap">
          <span class="modal-price">${formatPrice(product.price, Store.currency)}</span>
          ${product.oldPrice ? `<span class="modal-old-price">${formatPrice(product.oldPrice, Store.currency)}</span>` : ""}
        </div>

        <p class="modal-desc">${product.description}</p>

        <table class="specs-table">
          <tr><td>Mexanizm:</td><td>${product.mechanism}</td></tr>
          <tr><td>Korpus materiali:</td><td>${product.caseMaterial}</td></tr>
          <tr><td>Tasma turi:</td><td>${product.strapMaterial}</td></tr>
          <tr><td>Shisha:</td><td>${product.glass}</td></tr>
          <tr><td>Suv o'tkazuvchanlik:</td><td>${product.waterResistance}</td></tr>
          <tr><td>Korpus diametri:</td><td>${product.diameter}</td></tr>
        </table>

        <div class="modal-action-row">
          <button class="btn-primary" style="flex: 1;" onclick="Store.addToCart(${product.id}); closeModal('quickview-modal');">
            <i class="fas fa-shopping-bag"></i> Savatchaga qo'shish
          </button>
          <button class="btn-outline" onclick="Store.toggleWishlist(${product.id})">
            <i class="${Store.isInWishlist(product.id) ? "fas" : "far"} fa-heart"></i>
          </button>
        </div>
      </div>
    </div>
  `;

  openModal("quickview-modal");
}

// Drawers va Modallarni ochish/yopish boshqaruvi
function setupDrawers() {
  // Savatcha drawer
  const btnCart = document.getElementById("btn-open-cart");
  const btnCloseCart = document.getElementById("btn-close-cart");
  const cartDrawer = document.getElementById("cart-drawer-overlay");

  if (btnCart && cartDrawer) {
    btnCart.addEventListener("click", () => {
      cartDrawer.classList.add("active");
    });
  }

  if (btnCloseCart && cartDrawer) {
    btnCloseCart.addEventListener("click", () => {
      cartDrawer.classList.remove("active");
    });
  }

  // Sevimlilar drawer
  const btnWishlist = document.getElementById("btn-open-wishlist");
  const btnCloseWishlist = document.getElementById("btn-close-wishlist");
  const wishlistDrawer = document.getElementById("wishlist-drawer-overlay");

  if (btnWishlist && wishlistDrawer) {
    btnWishlist.addEventListener("click", () => {
      wishlistDrawer.classList.add("active");
    });
  }

  if (btnCloseWishlist && wishlistDrawer) {
    btnCloseWishlist.addEventListener("click", () => {
      wishlistDrawer.classList.remove("active");
    });
  }

  // Taqqoslash modalini ochish
  const btnCompare = document.getElementById("btn-open-compare");
  if (btnCompare) {
    btnCompare.addEventListener("click", () => {
      renderCompareModal();
      openModal("compare-modal");
    });
  }

  // Overlay bosilganda yopish
  document.querySelectorAll(".drawer-overlay").forEach((drawer) => {
    drawer.addEventListener("click", (e) => {
      if (e.target === drawer) {
        drawer.classList.remove("active");
      }
    });
  });

  // Modallarni yopish
  document.querySelectorAll(".modal-overlay").forEach((modal) => {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.classList.remove("active");
      }
    });
  });

  // Mobil filtr tugmasi
  const btnMobileFilter = document.getElementById("btn-mobile-filter");
  const filterSidebar = document.getElementById("filter-sidebar");
  if (btnMobileFilter && filterSidebar) {
    btnMobileFilter.addEventListener("click", () => {
      filterSidebar.classList.toggle("mobile-open");
    });
  }

  // Promokod formasi
  const promoForm = document.getElementById("promo-form");
  if (promoForm) {
    promoForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const code = document.getElementById("promo-code-input").value;
      Store.applyPromo(code);
    });
  }
}

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add("active");
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove("active");
}

function closeAllDrawers() {
  document
    .querySelectorAll(".drawer-overlay")
    .forEach((d) => d.classList.remove("active"));
}

function scrollToCatalog() {
  const el = document.getElementById("catalog");
  if (el) el.scrollIntoView({ behavior: "smooth" });
}

// FAQ Accordion
function setupFAQ() {
  const items = document.querySelectorAll(".faq-item");
  items.forEach((item) => {
    const question = item.querySelector(".faq-question");
    question.addEventListener("click", () => {
      const isActive = item.classList.contains("active");
      items.forEach((i) => i.classList.remove("active"));
      if (!isActive) {
        item.classList.add("active");
      }
    });
  });
}

// Buyurtma berish formasi
function setupCheckoutForm() {
  const btnCheckout = document.getElementById("btn-start-checkout");
  const checkoutModal = document.getElementById("checkout-modal");
  const form = document.getElementById("checkout-form");

  if (btnCheckout) {
    btnCheckout.addEventListener("click", () => {
      const totals = Store.getCartTotals();
      if (totals.items.length === 0) {
        showToast("Savatchangizda mahsulot yo'q!", "error");
        return;
      }

      // Hisobni to'ldirish
      const summaryEl = document.getElementById("checkout-order-summary");
      if (summaryEl) {
        summaryEl.innerHTML = `
          <div style="font-size: 13px; color: var(--text-secondary); margin-bottom: 8px;">
            Mahsulotlar soni: <strong>${totals.itemCount} ta</strong>
          </div>
          <div style="font-size: 16px; font-weight: 700; color: var(--gold-light);">
            To'lanadigan jami summa: ${formatPrice(totals.grandTotal, Store.currency)}
          </div>
        `;
      }

      closeAllDrawers();
      openModal("checkout-modal");
    });
  }

  // To'lov turi tanlash
  const payRadios = document.querySelectorAll(".pay-radio-card");
  payRadios.forEach((card) => {
    card.addEventListener("click", () => {
      payRadios.forEach((c) => c.classList.remove("active"));
      card.classList.add("active");
      const radio = card.querySelector("input");
      if (radio) radio.checked = true;
    });
  });

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const totals = Store.getCartTotals();

      const name = document.getElementById("order-name").value;
      const phone = document.getElementById("order-phone").value;
      const address = document.getElementById("order-address").value;
      const notes = document.getElementById("order-notes").value;
      const paymentMethod =
        document.querySelector('input[name="payment-method"]:checked')?.value ||
        "Click";

      // Buyurtma matni
      const orderMessage = `
🎉 Yangi Buyurtma (ChronoLux)!
-----------------------------
Mijoz: ${name}
Telefon: ${phone}
Manzil: ${address}
To'lov usuli: ${paymentMethod}
Izoh: ${notes || "Yo'q"}

Mahsulotlar:
${totals.items.map((item) => `• ${item.name} (${item.quantity} dona) - ${formatPrice(item.itemTotal, Store.currency)}`).join("\n")}

Jami summa: ${formatPrice(totals.grandTotal, Store.currency)}
      `.trim();

      // Muvaffaqiyatli qabul qilish
      closeModal("checkout-modal");
      Store.clearCart();

      // Telegramga yuborish havolasi (ixtiyoriy)
      const encodedMsg = encodeURIComponent(orderMessage);
      const tgUrl = `https://t.me/share/url?url=${encodedMsg}`;

      // Tasdiq xabari
      alert(
        `Rahmat, ${name}!\n\nSizning buyurtmangiz muvaffaqiyatli qabul qilindi. Tez orada menejerimiz ${phone} raqamiga aloqaga chiqadi.\n\nUmumiy summa: ${formatPrice(totals.grandTotal, Store.currency)}`,
      );

      showToast("Buyurtmangiz muvaffaqiyatli qabul qilindi!", "success");
      form.reset();
    });
  }
}
