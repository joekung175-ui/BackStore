import { APP_CONFIG } from './config.js';
import { getProducts, getSettings } from './store.js';
import { calculateTotals } from './business.js';

export const getCart = () => JSON.parse(localStorage.getItem(APP_CONFIG.cartKey) || '[]');
export const saveCart = cart => localStorage.setItem(APP_CONFIG.cartKey, JSON.stringify(cart));
export const cartCount = () => getCart().reduce((sum, line) => sum + line.quantity, 0);
export function addToCart(product, quantity = 1) { const cart = getCart(); const found = cart.find(line => line.product_id === product.id); const next = (found?.quantity || 0) + quantity; if (next > product.available_stock) throw new Error('จำนวนสินค้าเกินสต็อกที่พร้อมขาย'); if (found) found.quantity = next; else cart.push({ product_id: product.id, quantity }); saveCart(cart); }
export function updateCart(productId, quantity, available) { const cart = getCart(); const line = cart.find(item => item.product_id === productId); if (!line) return; if (quantity <= 0) cart.splice(cart.indexOf(line), 1); else { if (quantity > available) throw new Error('สินค้าในสต็อกไม่เพียงพอ'); line.quantity = quantity; } saveCart(cart); }
export function clearCart() { saveCart([]); }
export const calculateCart = calculateTotals;
export async function validateCartServerSide() { const [products, settings] = await Promise.all([getProducts(), getSettings()]); const totals = calculateCart(getCart(), products, settings); for (const line of totals.lines) if (line.quantity > line.product.available_stock) throw new Error(`${line.product.name} มีสต็อกไม่พอ`); return totals; }
