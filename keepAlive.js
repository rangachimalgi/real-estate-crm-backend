// keepAlive.js
import https from 'https';

// Function to make an HTTPS request to your own server
function pingServer() {
  https.get('https://real-estate-crm-backend-yfxi.onrender.com', (res) => {
    console.log('Server pinged with response status code:', res.statusCode);
  }).on('error', (e) => {
    console.error('Error pinging server:', e.message);
  });
}

// Set an interval to run the pingServer function every 15 minutes
setInterval(pingServer, 900000);