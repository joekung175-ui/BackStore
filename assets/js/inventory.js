import { supabase } from './supabase.js';
export async function adjustInventory(productId, quantity, reason, idempotencyKey) { if (!supabase) throw new Error('โหมดตัวอย่างไม่อนุญาตให้ปรับสต็อก'); const { error } = await supabase.rpc('adjust_inventory', { p_product_id: productId, p_quantity: quantity, p_reason: reason, p_idempotency_key: idempotencyKey }); if (error) throw error; }
