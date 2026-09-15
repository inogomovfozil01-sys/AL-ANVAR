// ChronoLux - Savatcha, Sevimlilar va Buyurtma boshqaruvi
const STORAGE_KEYS = {
  CART: "chronolux_cart",
  WISHLIST: "chronolux_wishlist",
  COMPARE: "chronolux_compare",
  CURRENCY: "chronolux_currency",
  APPLIED_PROMO: "chronolux_promo",
};

// Promokodlar ro'yxati va chegirma foizlari
const PROMO_CODES = {
  LUXURY10: 0.1, // 10% chegirma
  CHRONO5: 0.05, // 5% chegirma
  VIP20: 0.2, // 20% chegirma
};

// Global Store Ob'ekti
const Store = {
  currency: localStorage.getItem(STORAGE_KEYS.CURRENCY) || "UZS",
  promoCode: localStorage.getItem(STORAGE_KEYS.APPLIED_PROMO) || null,

  // Savatchani yuklash
  getCart() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CART);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  // Savatchani saqlash
  saveCart(cart) {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
    this.updateBadges();
  },

  // Savatchaga qo'shish
  addToCart(productId, qty = 1) {
    const product = WATCH_PRODUCTS.find((p) => p.id === productId);
    if (!product) return;

    const cart = this.getCart();
    const existingIndex = cart.findIndex((item) => item.id === productId);

    if (existingIndex > -1) {
      cart[existingIndex].quantity += qty;
    } else {
      cart.push({ id: productId, quantity: qty });
    }

    this.saveCart(cart);
    showToast(`"${product.name}" savatchaga qo'shildi!`, "success");
    renderCartDrawer();
  },

  // Savatchadan sonini o'zgartirish
  updateQuantity(productId, delta) {
    let cart = this.getCart();
    const item = cart.find((i) => i.id === productId);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
      cart = cart.filter((i) => i.id !== productId);
    }

    this.saveCart(cart);
    renderCartDrawer();
  },

  // Savatchadan o'chirish
  removeFromCart(productId) {
    let cart = this.getCart();
    cart = cart.filter((item) => item.id !== productId);
    this.saveCart(cart);
    renderCartDrawer();
    showToast("Mahsulot savatchadan olib tashlandi", "info");
  },

  // Savatchani tozalash
  clearCart() {
    this.saveCart([]);
    localStorage.removeItem(STORAGE_KEYS.APPLIED_PROMO);
    this.promoCode = null;
    renderCartDrawer();
  },

  // To'liq hisob-kitoblar
  getCartTotals() {
    const cart = this.getCart();
    let subtotal = 0;
    let itemCount = 0;

    const items = cart
      .map((item) => {
        const prod = WATCH_PRODUCTS.find((p) => p.id === item.id);
        if (!prod) return null;
        const total = prod.price * item.quantity;
        subtotal += total;
        itemCount += item.quantity;
        return {
          ...prod,
          quantity: item.quantity,
          itemTotal: total,
        };
      })
      .filter(Boolean);

    // Promokod chegirmasi
    let discount = 0;
    if (this.promoCode && PROMO_CODES[this.promoCode]) {
      discount = Math.round(subtotal * PROMO_CODES[this.promoCode]);
    }

    const grandTotal = Math.max(0, subtotal - discount);

    return {
      items,
      itemCount,
      subtotal,
      discount,
      promoDiscountPercent: this.promoCode
        ? PROMO_CODES[this.promoCode] * 100
        : 0,
      grandTotal,
    };
  },

  // Promokod qo'llash
  applyPromo(code) {
    const cleanCode = (code || "").trim().toUpperCase();
    if (PROMO_CODES[cleanCode]) {
      this.promoCode = cleanCode;
      localStorage.setItem(STORAGE_KEYS.APPLIED_PROMO, cleanCode);
      showToast(
        `Promokod qabul qilindi! ${PROMO_CODES[cleanCode] * 100}% chegirma.`,
        "success",
      );
      renderCartDrawer();
      return true;
    } else {
      showToast("Noto'g'ri promokod. Masalan: LUXURY10 yoki VIP20", "error");
      return false;
    }
  },

  // Sevimlilarni olish
  getWishlist() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WISHLIST);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  // Sevimlilarga qo'shish yoki o'chirish
  toggleWishlist(productId) {
    const product = WATCH_PRODUCTS.find((p) => p.id === productId);
    if (!product) return;

    let wishlist = this.getWishlist();
    const index = wishlist.indexOf(productId);

    if (index > -1) {
      wishlist.splice(index, 1);
      showToast(`"${product.name}" sevimlilardan olib tashlandi`, "info");
    } else {
      wishlist.push(productId);
      showToast(`"${product.name}" sevimlilarga qo'shildi!`, "success");
    }

    localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(wishlist));
    this.updateBadges();
    renderWishlistDrawer();
    renderProducts(); // Yurakcha belgilarini yangilash
  },

  isInWishlist(productId) {
    return this.getWishlist().includes(productId);
  },

  // Taqqoslash ro'yxatini olish
  getCompare() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.COMPARE);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  // Taqqoslashga qo'shish / o'chirish (maksimal 2 ta soat)
  toggleCompare(productId) {
    let list = this.getCompare();
    const index = list.indexOf(productId);

    if (index > -1) {
      list.splice(index, 1);
      showToast("Soat taqqoslash ro'yxatidan olib tashlandi", "info");
    } else {
      if (list.length >= 2) {
        // Eski birinchisini chiqarib yangisini qo'shamiz
        list.shift();
      }
      list.push(productId);
      showToast(
        "Soat taqqoslashga qo'shildi! (Ikkita soat solishtiriladi)",
        "success",
      );
    }

    localStorage.setItem(STORAGE_KEYS.COMPARE, JSON.stringify(list));
    this.updateBadges();
    renderCompareModal();
  },

  isInCompare(productId) {
    return this.getCompare().includes(productId);
  },

  // Valyutani almashtirish (UZS <-> USD)
  setCurrency(curr) {
    this.currency = curr;
    localStorage.setItem(STORAGE_KEYS.CURRENCY, curr);
    renderProducts();
    renderCartDrawer();
    renderWishlistDrawer();
    updateCurrencyUI();
  },

  // Yuqori paneldagi sanoqlarni yangilash
  updateBadges() {
    const cartTotals = this.getCartTotals();
    const cartBadge = document.getElementById("cart-badge");
    const wishlistBadge = document.getElementById("wishlist-badge");
    const compareBadge = document.getElementById("compare-badge");

    if (cartBadge) {
      cartBadge.textContent = cartTotals.itemCount;
      cartBadge.style.display =
        cartTotals.itemCount > 0 ? "inline-flex" : "none";
    }

    const wishlistCount = this.getWishlist().length;
    if (wishlistBadge) {
      wishlistBadge.textContent = wishlistCount;
      wishlistBadge.style.display = wishlistCount > 0 ? "inline-flex" : "none";
    }

    const compareCount = this.getCompare().length;
    if (compareBadge) {
      compareBadge.textContent = compareCount;
      compareBadge.style.display = compareCount > 0 ? "inline-flex" : "none";
    }
  },
};

// Toast bildirishnomalari chiqarish
function showToast(message, type = "info") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;

  let icon = '<i class="fas fa-info-circle"></i>';
  if (type === "success") icon = '<i class="fas fa-check-circle"></i>';
  if (type === "error") icon = '<i class="fas fa-exclamation-circle"></i>';

  toast.innerHTML = `
    <span class="toast-icon">${icon}</span>
    <span class="toast-message">${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("show");
  }, 10);

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 400);
  }, 3500);
}
