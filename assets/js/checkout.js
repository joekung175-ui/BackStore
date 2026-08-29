import { supabase } from './supabase.js';
import { validateCartServerSide, clearCart } from './cart.js';
import { validateSlip } from './utils.js';

export async function submitOrder(customer, paymentMethod, idempotencyKey) {
  const totals = await validateCartServerSide();
  if (!supabase) return { order_number: `DEMO-${Date.now().toString().slice(-8)}`, tracking_token: crypto.randomUUID(), demo: true };
  const couponCode = sessionStorage.getItem('checkoutCoupon') || null;
  const { data, error } = await supabase.rpc(couponCode ? 'create_order_with_coupon' : 'create_order', { p_customer: customer, p_items: totals.lines.map(line => ({ product_id: line.product_id, quantity: line.quantity })), p_payment_method: paymentMethod, p_idempotency_key: idempotencyKey, ...(couponCode ? { p_coupon_code: couponCode } : {}) });
  if (error) throw error; sessionStorage.removeItem('checkoutCoupon'); clearCart(); return data;
}
export async function uploadSlip(trackingToken, file) { validateSlip(file); if (!supabase) return { demo: true }; const name = `${crypto.randomUUID()}.${file.name.split('.').pop().toLowerCase()}`; const path = `${trackingToken}/${name}`; const { error: uploadError } = await supabase.storage.from('payment-slips').upload(path, file, { contentType: file.type, upsert: false }); if (uploadError) throw uploadError; const { error } = await supabase.rpc('register_payment_slip', { p_tracking_token: trackingToken, p_path: path, p_mime_type: file.type, p_size_bytes: file.size }); if (error) throw error; return { path }; }
