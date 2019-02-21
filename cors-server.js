/**
 * Some APIs do not allow CORS. This can be bypassed using a
 * middleware that do not care about CORS. Headers will be held
 * in tact preserving the request properly.
 */
var cors_proxy = require('cors-anywhere');
var host = process.env.HOST || '0.0.0.0';
var port = process.env.PORT || 8080;
var domains = process.env.WHITELIST_DOMAINS || '';

cors_proxy
  .createServer({
    originWhitelist: domains.split(','),
  })
  .listen(port, host, () => {
    console.log(`Listening on ${host}:${port}`);
  });
