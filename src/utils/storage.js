export const STORAGE_KEY = "primefit_orders_v1";
export const CART_KEY = "primefit_cart_v1";

export function loadOrders() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

export function saveOrders(orders) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}
