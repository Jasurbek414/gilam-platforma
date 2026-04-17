const b = require('bcrypt');
const { Client } = require('pg');

const currentHash = '$2b$10$eOCsXSe4P0aECUtF8aYj2ugAlpzFNM.9t0Aq.Y6dDYNAlpic1PR92';

b.compare('123456', currentHash).then(async (ok) => {
  console.log('Hozirgi hash to`g`ri:', ok);

  // Hash yangilaymiz (ishonchli)
  const newHash = await b.hash('123456', 10);
  const verify = await b.compare('123456', newHash);
  console.log('Yangi hash test:', verify);

  const c = new Client({ host:'localhost', port:5432, user:'postgres', password:'postgres', database:'gilam_saas' });
  await c.connect();
  const r = await c.query('UPDATE users SET password_hash=$1 RETURNING full_name, phone', [newHash]);
  console.log('Yangilandi:', r.rows.map(u => u.full_name + ' ' + u.phone).join(', '));
  
  // Verify from DB
  const r2 = await c.query("SELECT password_hash FROM users WHERE phone='+998900504202'");
  const dbHash = r2.rows[0].password_hash;
  const finalOk = await b.compare('123456', dbHash);
  console.log('DB dan qayta tekshirish:', finalOk);
  
  await c.end();
  console.log('DONE. Endi backend restart qiling.');
}).catch(e => console.error(e.message));
