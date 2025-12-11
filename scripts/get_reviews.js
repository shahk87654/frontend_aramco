const https = require('https');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/reviews',
  method: 'GET',
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    try {
      const arr = JSON.parse(data);
      console.log('Count:', arr.length);
      console.log('Last item:', arr[arr.length - 1]);
    } catch (e) {
      console.log('Body:', data);
    }
  });
});

req.on('error', (e) => { console.error('Request error:', e); });
req.end();
