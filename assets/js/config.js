export const APP_CONFIG = {
  lowStockDefault: 5,
  currency: 'THB',
  cartKey: 'thai-store-cart-v1',
  envReady: Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY)
};
