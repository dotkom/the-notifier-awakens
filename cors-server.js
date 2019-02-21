/**
 * Some APIs do not allow CORS. This can be bypassed using a
 * middleware that do not care about CORS. Headers will be held
 * in tact preserving the request properly.
 */
const fs = require('fs');
const dotenv = require('dotenv');
const cors_proxy = require('cors-anywhere');

dotenv.config();
const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
for (let k in envConfig) {
  process.env[k] = envConfig[k];
}

const host = process.env.CORS_HOST || 'localhost';
const port = process.env.CORS_PORT || 8080;
const domains = process.env.ORIGIN_WHITELIST || '';

cors_proxy
  .createServer({
    originWhitelist: domains.split(','),
  })
  .listen(port, host, () => {
    console.log(`Listening on ${host}:${port}`);
    console.log(
      'Change host and port by setting CORS_HOST and CORS_PORT in .env.local',
    );
  });
