const midtransClient = require('midtrans-client');

const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: 'SB-Mid-server-GwUP_WGbJPXsDzsNEBRs8IYA',
  clientKey: 'SB-Mid-client-61XuGAwQ8Bj8LxSS'
});

module.exports = snap;