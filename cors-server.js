/**
 * Some APIs do not allow CORS. This can be bypassed using a
 * middleware that do not care about CORS. Headers will be held
 * in tact preserving the request properly.
 */
const fs = require('fs');
const dotenv = require('dotenv');
const cors_proxy = require('cors-anywhere');

const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
for (let k in envConfig) {
  process.env[k] = envConfig[k];
}

const host = process.env.CORS_HOST || '0.0.0.0';
const port = process.env.CORS_PORT || 8080;
const domains = process.env.WHITELIST_DOMAINS || '';

cors_proxy
  .createServer({
    originWhitelist: domains.split(','),
  })
  .listen(port, host, () => {
    console.log(`Listening on ${host}:${port}`);
  });
