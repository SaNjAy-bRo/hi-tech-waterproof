const https = require('https');

module.exports = async function handler(req, res) {
  // Only allow POST requests for the form submission
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Retrieve securely stored API key from Vercel
  const accessKey = process.env.WEB3FORMS_ACCESS_KEY;
  if (!accessKey) {
    return res.status(500).json({ error: 'Server configuration error: WEB3FORMS_ACCESS_KEY is missing' });
  }

  const { name, phone, botcheck } = req.body;

  // Anti-spam check
  if (botcheck) {
    return res.status(400).json({ error: 'Spam detected' });
  }

  // Construct payload specifically for Web3Forms
  const payload = JSON.stringify({
    access_key: accessKey,
    name: name || "Not provided",
    phone: phone || "Not provided",
    subject: `New Waterproofing Lead: ${name}`
  });

  // Setup raw Node.js HTTP request configuration
  const options = {
    hostname: 'api.web3forms.com',
    port: 443,
    path: '/submit',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    }
  };

  // Execute request wrapping with Promise
  return new Promise((resolve, reject) => {
    const request = https.request(options, (response) => {
      // Regardless of internal errors with Web3Forms, handle gracefully
      if (response.statusCode >= 200 && response.statusCode < 300) {
         res.redirect(302, '/?success=true');
         resolve();
      } else {
         res.redirect(302, '/?error=true');
         resolve();
      }
    });

    request.on('error', (e) => {
      console.error('Server request error:', e);
      res.status(500).json({ error: 'Internal Server Error' });
      resolve();
    });

    // Write data to request body
    request.write(payload);
    request.end();
  });
}
