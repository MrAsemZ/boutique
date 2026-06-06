const KEY = 'boutique_guest_cart';

export function getGuestCart() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : { items: [] };
  } catch {
    return { items: [] };
  }
}

export function saveGuestCart(cart) {
  localStorage.setItem(KEY, JSON.stringify(cart));
}

export function addToGuestCart(product, variant, quantity = 1) {
  const cart = getGuestCart();
  const idx = cart.items.findIndex((i) => i.variantId === variant.id);
  if (idx !== -1) {
    cart.items[idx].quantity = Math.min(
      cart.items[idx].quantity + quantity,
      variant.stock ?? 99,
    );
  } else {
    cart.items.push({
      variantId: variant.id,
      productId: product.id,
      productName: product.name,
      productNameAr: product.name_ar,
      price: variant.price_override ?? product.sale_price ?? product.base_price ?? 0,
      imageUrl: product.primary_image_url ?? null,
      size: variant.size ?? null,
      color: variant.color ?? null,
      quantity,
      stock: variant.stock ?? 99,
    });
  }
  saveGuestCart(cart);
}

export function removeFromGuestCart(variantId) {
  const cart = getGuestCart();
  cart.items = cart.items.filter((i) => i.variantId !== variantId);
  saveGuestCart(cart);
}

export function updateGuestCartQuantity(variantId, quantity) {
  const cart = getGuestCart();
  const item = cart.items.find((i) => i.variantId === variantId);
  if (item) {
    item.quantity = Math.max(1, Math.min(quantity, item.stock ?? 99));
  }
  saveGuestCart(cart);
}

export function clearGuestCart() {
  localStorage.removeItem(KEY);
}

export function getGuestCartCount() {
  return getGuestCart().items.reduce((sum, i) => sum + i.quantity, 0);
}
