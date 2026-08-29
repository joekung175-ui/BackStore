import { defineConfig } from 'vite';

export default defineConfig({
  server: { port: 5173, strictPort: true },
  build: { target: 'es2022', rollupOptions: { input: {
    home: 'index.html', products: 'products.html', product: 'product.html', cart: 'cart.html', checkout: 'checkout.html', track: 'track-order.html', success: 'order-success.html', accountLogin: 'account-login.html', accountSignup: 'account-signup.html', account: 'account.html',
    login: 'admin/login.html', dashboard: 'admin/dashboard.html', adminProducts: 'admin/products.html', productForm: 'admin/product-form.html', categories: 'admin/categories.html', inventory: 'admin/inventory.html', orders: 'admin/orders.html', orderDetail: 'admin/order-detail.html', finance: 'admin/finance.html', reports: 'admin/reports.html', settings: 'admin/settings.html', ai: 'admin/ai.html'
  } } }
});
