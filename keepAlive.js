// keepAlive.js
import https from 'https';

// Function to make an HTTPS request to your own server
function pingServer() {
  const url = 'https://real-estate-crm-backend-yfxi.onrender.com';
  
  console.log(`🔄 Pinging server at ${new Date().toISOString()}`);
  
  https.get(url, (res) => {
    console.log(`✅ Server pinged successfully - Status: ${res.statusCode}`);
    
    // Log response headers for debugging
    console.log(`📊 Response headers:`, res.headers);
    
  }).on('error', (e) => {
    console.error(`❌ Error pinging server: ${e.message}`);
  });
}

// Initial ping when script starts
console.log('🚀 Keep-alive script started');
pingServer();

// Set interval to ping every 5 minutes (300000ms) instead of 15 minutes
// Free Render tier sleeps after 15 minutes of inactivity, so ping more frequently
const PING_INTERVAL = 5 * 60 * 1000; // 5 minutes

setInterval(pingServer, PING_INTERVAL);

console.log(`⏰ Will ping server every ${PING_INTERVAL / 1000 / 60} minutes`);

// Graceful shutdown handling
process.on('SIGINT', () => {
  console.log('🛑 Keep-alive script stopped');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('🛑 Keep-alive script stopped');
  process.exit(0);
}); 