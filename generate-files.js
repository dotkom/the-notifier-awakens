const fs = require('fs');
const dotenv = require('dotenv');
const crypto = require('crypto');
require = require('esm')(module);

dotenv.config();
const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
for (let k in envConfig) {
  process.env[k] = envConfig[k];
}

const defaults = require('./src/defaults');
const generateTo = './build/api';
if (!fs.existsSync(generateTo)) {
  fs.mkdirSync(generateTo);
}
const getHash = str =>
  crypto
    .createHash('md5')
    .update(str)
    .digest('hex');

const writeDataToFile = (data, file) => {
  const json = JSON.stringify(data, null, 2);
  fs.writeFileSync(`${generateTo}/${file}`, json);
  return getHash(json);
};

const getDirectoryHash = folder =>
  getHash(
    require('child_process')
      .execSync(`cat ${folder}/*.*`)
      .toString('UTF-8'),
  );

const hashFile = {
  affiliations: writeDataToFile(
    defaults.defaultAffiliationSettings,
    'affiliations.json',
  ),
  apis: writeDataToFile(defaults.defaultApis, 'apis.json'),
  settings: writeDataToFile(defaults.defaultSettings, 'settings.json'),
  translations: writeDataToFile(
    defaults.defaultTranslations,
    'translations.json',
  ),
  components: getDirectoryHash('src/components'),
  core: getDirectoryHash('src'),
};

writeDataToFile(hashFile, 'hash.json');
