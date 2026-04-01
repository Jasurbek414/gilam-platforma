// API Test Script
const http = require('http');

function post(path, data) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(data);
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: `/api${path}`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
    }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve(JSON.parse(d)); } catch { resolve(d); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function get(path, token) {
  return new Promise((resolve, reject) => {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: `/api${path}`,
      method: 'GET',
      headers,
    }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve(JSON.parse(d)); } catch { resolve(d); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function test() {
  console.log('====== API TEST BOSHLANMOQDA ======\n');

  // 1. LOGIN Test
  console.log('1️⃣  LOGIN testi...');
  const loginResult = await post('/auth/login', {
    phone: '+998901234567',
    password: 'admin123'
  });
  console.log('   Token:', loginResult.access_token ? '✅ Olingan' : '❌ Xato');
  console.log('   Role:', loginResult.user?.role);
  console.log('   Ism:', loginResult.user?.fullName);
  const token = loginResult.access_token;

  // 2. COMPANIES ro'yxati
  console.log('\n2️⃣  KOMPANIYALAR ro\'yxati...');
  const companies = await get('/companies', token);
  console.log(`   Topildi: ${companies.length} ta kompaniya`);
  companies.forEach(c => console.log(`   - ${c.name} (${c.status})`));
  const companyId = companies[0]?.id;

  // 3. USERS ro'yxati
  console.log('\n3️⃣  FOYDALANUVCHILAR ro\'yxati...');
  const users = await get('/users', token);
  console.log(`   Topildi: ${users.length} ta foydalanuvchi`);
  users.forEach(u => console.log(`   - ${u.fullName} (${u.role})`));

  // 4. SERVICES ro'yxati
  if (companyId) {
    console.log('\n4️⃣  XIZMAT TURLARI ro\'yxati...');
    const services = await get(`/services/company/${companyId}`, token);
    console.log(`   Topildi: ${services.length} ta xizmat turi`);
    services.forEach(s => console.log(`   - ${s.name}: ${s.price} sum (${s.measurementUnit})`));

    // 5. CUSTOMERS ro'yxati
    console.log('\n5️⃣  MIJOZLAR ro\'yxati...');
    const customers = await get(`/customers/company/${companyId}`, token);
    console.log(`   Topildi: ${customers.length} ta mijoz`);
    customers.forEach(c => console.log(`   - ${c.fullName} (${c.phone1})`));
  }

  console.log('\n====== BARCHA TESTLAR YAKUNLANDI ======');
}

test().catch(console.error);
