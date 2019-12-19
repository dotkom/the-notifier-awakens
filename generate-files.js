const fs = require('fs');
const dotenv = require('dotenv');
const crypto = require('crypto');
require = require('esm')(module);

const extension = 'json';
const generatedFilePaths = {
  groups: `./build/api/groups.${extension}`,
  apis: `./build/api/apis.${extension}`,
  settings: `./build/api/settings.${extension}`,
  translations: `./build/api/translations.${extension}`,
  hash: `./build/api/hash.${extension}`,
};
const foldersToWatch = {
  defaults: './src/defaults',
  components: './src/components',
  core: './src',
};

dotenv.config();
try {
  const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
  for (let k in envConfig) {
    process.env[k] = envConfig[k];
  }
} catch (e) {
  // .env.local did not exist, but that does not matter
}

const mkdir = pathToDir =>
  pathToDir
    .slice(1)
    .split('/')
    .filter(dir => dir)
    .reduce((path, dir) => {
      const newPath = path + '/' + dir;
      if (!fs.existsSync(newPath)) {
        fs.mkdirSync(newPath);
      }
      return newPath;
    }, '.');

const defaults = require(foldersToWatch.defaults);
const getHash = str =>
  crypto
    .createHash('md5')
    .update(str)
    .digest('hex');

const writeDataToFile = (data, file) => {
  const json = JSON.stringify(data, null, 2);
  mkdir(
    file
      .split('/')
      .slice(0, -1)
      .join('/'),
  );
  fs.writeFileSync(file, json);
  return getHash(json);
};

const getDirectoryHash = folder =>
  getHash(
    require('child_process')
      .execSync(`cat ${folder}/*.*`)
      .toString('UTF-8'),
  );

const hashFile = {
  groups: writeDataToFile(
    defaults.defaultGroupSettings,
    generatedFilePaths.groups,
  ),
  apis: writeDataToFile(defaults.defaultApis, generatedFilePaths.apis),
  settings: writeDataToFile(
    defaults.defaultSettings,
    generatedFilePaths.settings,
  ),
  translations: writeDataToFile(
    defaults.defaultTranslations,
    generatedFilePaths.translations,
  ),
  components: getDirectoryHash(foldersToWatch.components),
  core: getDirectoryHash(foldersToWatch.core),
};

writeDataToFile(hashFile, generatedFilePaths.hash);
