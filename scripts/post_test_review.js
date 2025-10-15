const https = require('https');

const postData = JSON.stringify({
  stationId: 'post-test',
  rating: 5,
  name: 'Automated Tester',
  contact: '000',
  comment: 'POST test',
  gps: { lat: 0, lng: 0 }
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/reviews',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData),
  },
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    try { console.log('Body:', JSON.parse(data)); } catch (e) { console.log('Body:', data); }
  });
});

req.on('error', (e) => { console.error('Request error:', e); });
req.write(postData);
req.end();
