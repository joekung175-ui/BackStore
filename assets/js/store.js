import { supabase } from './supabase.js';

export const demoSettings = { store_name: 'บ้านใบชา', logo_url: '/assets/images/store-logo.png', description: 'ของดีคัดสรรสำหรับทุกวัน', phone: '02-000-0000', email: 'hello@example.test', primary_color: '#245842', accent_color: '#ec7658', shipping_fee_satang: 5000, free_shipping_min_satang: 70000, promptpay_name: 'ชื่อบัญชีตัวอย่าง', promptpay_id: '0000000000000' };
export const productDisplayImage = '/assets/images/product-placeholder.svg';
export const demoCategories = ['ผงชาเขียว', 'ผงมัจฉะ', 'ผงชาสมุนไพร', 'ผงชาต่างๆ'];
export const demoProducts = [
  ['ผงชาเขียวพรีเมียม 100 กรัม', 'POW-GREEN-100', 22900, null, 20, 'ผงชาเขียว'],
  ['ผงมัทฉะเกรดพิธีการ 50 กรัม', 'POW-MATCHA-050', 32900, 36900, 15, 'ผงมัจฉะ'],
  ['ผงมัทฉะลาเต้ 200 กรัม', 'POW-MATCHA-LATTE', 25900, null, 18, 'ผงมัจฉะ'],
  ['ผงชาขิงสมุนไพร 150 กรัม', 'POW-HERBAL-GINGER', 17900, null, 12, 'ผงชาสมุนไพร'],
  ['ผงชามะลิ 150 กรัม', 'POW-JASMINE-150', 18900, null, 10, 'ผงชาต่างๆ'],
  ['ผงชาไทยเข้มข้น 200 กรัม', 'POW-THAI-200', 19900, 22900, 14, 'ผงชาต่างๆ']
].map(([name, sku, price_satang, compare_at_satang, available_stock, category], index) => ({ id: `demo-powder-${index + 1}`, name, sku, price_satang, compare_at_satang, available_stock, category, featured: index < 4, best_seller: index === 1 || index === 2, created_at: new Date(Date.now() - index * 86400000).toISOString(), image_url: productDisplayImage }));

export async function getSettings() { if (!supabase) return demoSettings; const { data, error } = await supabase.from('store_settings').select('*').eq('is_published', true).single(); if (error) throw error; return data; }
export async function getProducts({ includeInactive = false } = {}) { if (!supabase) return demoProducts; let query = supabase.from('products').select('*, categories(name), product_images(url, alt_text, sort_order)').is('deleted_at', null).order('created_at', { ascending: false }); if (!includeInactive) query = query.eq('is_active', true); const { data, error } = await query; if (error) throw error; return data.map(product => ({ ...product, category: product.categories?.name, source_image_url: product.product_images?.[0]?.url || null, image_url: productDisplayImage, featured: product.is_featured, best_seller: product.is_best_seller })); }
export const getProduct = async id => (await getProducts()).find(product => product.id === id) || null;
