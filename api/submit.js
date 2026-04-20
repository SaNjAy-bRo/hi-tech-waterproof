module.exports = async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get the securely stored API key from Vercel environment variables
  const accessKey = process.env.WEB3FORMS_ACCESS_KEY;
  
  if (!accessKey) {
    return res.status(500).json({ error: 'Server configuration error: WEB3FORMS_ACCESS_KEY is missing in Vercel.' });
  }

  const { name, phone, botcheck } = req.body;

  // Anti-spam check: if botcheck is checked, reject the submission silently (it's hidden from real users)
  if (botcheck) {
    return res.status(400).json({ error: 'Spam detected' });
  }

  try {
    // Forward the payload server-to-server directly to Web3Forms API
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        access_key: accessKey,
        name: name || "Not provided",
        phone: phone || "Not provided",
        subject: `New Waterproofing Lead: ${name}`
      })
    });

    const result = await response.json();

    if (response.status === 200) {
      // Redirect safely back to the home page seamlessly
      return res.redirect(302, '/?success=true');
    } else {
      return res.redirect(302, '/?error=true');
    }
  } catch (error) {
    console.error('Error submitting form backend:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
