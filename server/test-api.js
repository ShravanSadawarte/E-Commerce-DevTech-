const path = require('path');
process.env.NODE_ENV = 'test';
process.env.DB_DIALECT = 'sqlite';
process.env.DB_STORAGE = path.resolve(__dirname, 'database.test.sqlite');

const http = require('http');
const { app } = require('./src/app');
const { sequelize } = require('./src/config/database');

async function runTests() {
  console.log('--- Starting API Integration Tests ---');
  await sequelize.sync();

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(5099, resolve));
  console.log('[Test Server] Listening on port 5099');

  const baseUrl = 'http://localhost:5099/api';

  async function request(path, options = {}) {
    const url = `${baseUrl}${path}`;
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    const res = await fetch(url, { ...options, headers });
    const data = await res.json();
    return { status: res.status, data };
  }

  let passed = 0;
  let failed = 0;

  function assert(condition, name) {
    if (condition) {
      console.log(`✅ PASS: ${name}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${name}`);
      failed++;
    }
  }

  try {
    // 1. Health Check
    const health = await request('/health');
    assert(health.status === 200 && health.data.status === 'healthy', 'Health check endpoint');

    // 2. Customer Login
    const loginRes = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'john.doe@example.com', password: 'Customer@12345' }),
    });
    assert(loginRes.status === 200 && loginRes.data.success && loginRes.data.data.token, 'Customer login');
    const customerToken = loginRes.data?.data?.token;

    // 3. Admin Login
    const adminLoginRes = await request('/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'admin@devtech.com', password: 'Admin@12345' }),
    });
    assert(adminLoginRes.status === 200 && adminLoginRes.data.success && adminLoginRes.data.data.user.role === 'SUPER_ADMIN', 'Admin login');
    const adminToken = adminLoginRes.data?.data?.token;

    // 4. Products List & Filtering
    const productsRes = await request('/products?limit=5');
    assert(productsRes.status === 200 && productsRes.data.data.products.length > 0, 'Fetch products list');

    const filtersRes = await request('/products/filters');
    assert(filtersRes.status === 200 && filtersRes.data.data.categories.length > 0, 'Fetch filters metadata');

    // 5. Cart Operations
    const cartRes = await request('/cart', {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    assert(cartRes.status === 200 && cartRes.data.data.totals !== undefined, 'Fetch customer cart');

    // 6. Address Retrieval
    const addrRes = await request('/addresses', {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    assert(addrRes.status === 200 && addrRes.data.data.addresses.length > 0, 'Fetch saved addresses');

    // 7. Booking Slots
    const today = new Date().toISOString().split('T')[0];
    const slotsRes = await request(`/bookings/slots?date=${today}`);
    assert(slotsRes.status === 200 && slotsRes.data.data.slots.length > 0, 'Fetch available booking slots');

    // 8. Contact Form
    const contactRes = await request('/contact', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test Customer',
        email: 'test@example.com',
        subject: 'Test Subject',
        message: 'This is an automated test inquiry message.',
      }),
    });
    assert(contactRes.status === 201 && contactRes.data.success, 'Submit contact message');

    // 9. Admin Dashboard Metrics
    const adminStatsRes = await request('/admin/dashboard/stats', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(adminStatsRes.status === 200 && adminStatsRes.data.data.stats.totalProducts > 0, 'Admin dashboard statistics');

    console.log(`\n--- Test Summary: ${passed} Passed, ${failed} Failed ---`);
    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Test run failed with error:', err);
    process.exit(1);
  } finally {
    server.close();
  }
}

runTests();
