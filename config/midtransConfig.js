const midtransClient = require('midtrans-client');

const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: 'SB-Mid-server-jZ7qn8QPNjcfZSdDSnnseYTO',
  clientKey: 'SB-Mid-client-Npn8WygG0q1SDP3w'
});

module.exports = snap;