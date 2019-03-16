/**
 * This server is simply used to gather all current
 * IP adresses and images from all infoscreens. This
 * is to make it easy to maintain the infoscreens by
 * taking screenshots, check if they are alive and
 * reboot them if necessary.
 */
const fs = require('fs');
const dotenv = require('dotenv');
const http = require('http');
const formidable = require('formidable');

dotenv.config();
const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
for (let k in envConfig) {
  process.env[k] = envConfig[k];
}

const port = process.env.STATUS_SERVER_PORT || 8090;
const root =
  '/' + (process.env.STATUS_SERVER_ROOT || '').replace(/(^\/|\/$)/g, '');
const settings = {
  root,
  rootLength: root === '/' ? 0 : root.length,
  folders: {
    ip: `${__dirname}/notiwatch/ips`,
    screenshots: `${__dirname}/notiwatch/screenshots`,
  },
  files: {
    tokens: `${__dirname}/notiwatch/tokens.txt`,
    install: `${__dirname}/infoscreen-setup/bin/notiwall`,
  },
  validate: {
    getUrl: /^[0-9\. a-zøæå]*$/,
    user: /[0-9A-Za-z\/+=]+/,
    postScreenshotUrl: /^\/screenshot\/(.+)$/,
    postIpUrl: /^\/ip\/(.+)$/,
    postIpData: /^[0-9\. a-zøæå:\[\]]*$/,
    getScreenshotUrl: /^\/(.+)\/screenshot\.png$/,
    getIpUrl: /^\/(.+)\/ip$/,
    getInfoscreenUrl: /^\/(.+)$/,
    getInstallWithInfoUrl: /^\/(.+)\/notiwall\.sh$/,
    getInstallUrl: /^\/notiwall\.sh$/,
  },
};

const btoa = string => Buffer.from(string).toString('base64');
const atob = base64 => Buffer.from(base64, 'base64').toString('ascii');

const updateIP = (file, ip) => {
  fs.writeFile(`${settings.folders.ip}/${file}.txt`, ip, () => {});
};

const checkIfValidToken = (user, callback) => {
  fs.readFile(settings.files.tokens, (err, content) => {
    if (err) {
      callback(false);
    } else {
      const tokens = content
        .toString()
        .trim()
        .split('\n');
      callback(!!~tokens.indexOf(user));
    }
  });
};

const listInfoscreens = callback => {
  fs.readFile(settings.files.tokens, (err, content) => {
    if (err) {
      callback([]);
    } else {
      const users = content
        .toString()
        .trim()
        .split('\n');
      callback([...new Set(users.map(user => getUsernameFromUser(user)))]);
    }
  });
};

const getInfoscreenIp = (username, callback) => {
  fs.readFile(`${settings.folders.ip}/${username}.txt`, (err, content) => {
    if (err) {
      callback(false);
    } else {
      callback(content.toString().trim());
    }
  });
};

const getInfoscreenScreenshot = (username, callback) => {
  fs.readFile(
    `${settings.folders.screenshots}/${username}.png`,
    (err, content) => {
      if (err) {
        callback(false);
      } else {
        callback(content);
      }
    },
  );
};

const checkIfInfoscreenExists = infoscreenName => {
  return fs.existsSync(`${settings.folders.ip}/${infoscreenName}.txt`);
};

const returnResult = (
  res,
  statusCode = 200,
  message = '',
  description = '',
) => {
  res.statusCode = statusCode;
  res.statusMessage = http.STATUS_CODES[statusCode];
  res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
  const type = statusCode >= 200 && statusCode < 400 ? 'result' : 'error';
  const descriptionObj = description ? { description } : {};
  if (typeof message === 'object') {
    res.end(
      JSON.stringify(
        Object.assign(descriptionObj, {
          statusCode: res.statusCode,
          [type]: message,
        }),
      ),
    );
  } else {
    res.end(
      JSON.stringify(
        Object.assign(descriptionObj, {
          statusCode: res.statusCode,
          [type]: message || res.statusMessage,
        }),
      ),
    );
  }
};

const getUserFromUrl = (url, regex) => {
  const creds = regex.exec(url)[1] || '';
  return atob(creds);
};

const getUsernameFromUser = user => {
  return user.slice(0, user.indexOf(':'));
};

const requestHandler = (req, res) => {
  const url = req.url.slice(settings.rootLength);
  const urlLower = url.toLowerCase();

  // POsting data
  if (req.method === 'POST') {
    // If screenshot
    if (settings.validate.postScreenshotUrl.test(urlLower)) {
      const user = getUserFromUrl(url, settings.validate.postScreenshotUrl);
      const username = getUsernameFromUser(user);

      checkIfValidToken(user, valid => {
        if (valid) {
          var form = new formidable.IncomingForm();
          form.maxFileSize = 200 * 1024 * 1024;
          form.uploadDir = settings.folders.screenshots;
          form.parse(req);

          form.on('fileBegin', (_, file) => {
            file.path = `${form.uploadDir}/${username}.png`;
          });
          form.on('error', function() {
            returnResult(res, 400);
          });
          form.on('aborted', function() {
            returnResult(res, 400);
          });
          form.on('end', function() {
            returnResult(res, 201);
          });
        } else {
          returnResult(res, 401);
        }
      });
    }

    // If IP
    else if (settings.validate.postIpUrl.test(urlLower)) {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', () => {
        // Getting the base64 user credentials from url
        const user = getUserFromUrl(url, settings.validate.postIpUrl);
        // Check if body is valid before saving it
        if (settings.validate.postIpData.test(body.toLowerCase())) {
          const ip = body;
          checkIfValidToken(user, valid => {
            if (valid) {
              const username = getUsernameFromUser(user);
              updateIP(username, ip);
              returnResult(res, 201);
            } else {
              returnResult(res, 401);
            }
          });
        } else {
          returnResult(
            res,
            400,
            'Format failed. Follow this format: ' +
              settings.validate.postIpData,
          );
        }
      });
    }

    // If not IP or screenshot
    else {
      returnResult(res, 400);
    }
  }

  // Getting data
  else if (req.method === 'GET') {
    // Get IP only
    if (settings.validate.getIpUrl.test(urlLower)) {
      const user = getUserFromUrl(url, settings.validate.getIpUrl);
      const username = getUsernameFromUser(user);
      if (checkIfInfoscreenExists(username)) {
        checkIfValidToken(user, valid => {
          if (valid) {
            getInfoscreenIp(username, content => {
              if (content) {
                returnResult(res, 200, content);
              } else {
                returnResult(res, 404);
              }
            });
          } else {
            returnResult(res, 401);
          }
        });
      } else {
        returnResult(res, 400, `Infoscreen "${username}" does not exist`);
      }
    }

    // Get screenshot only (as .png)
    else if (settings.validate.getScreenshotUrl.test(urlLower)) {
      const user = getUserFromUrl(url, settings.validate.getScreenshotUrl);
      const username = getUsernameFromUser(user);
      if (checkIfInfoscreenExists(username)) {
        checkIfValidToken(user, valid => {
          if (valid) {
            getInfoscreenScreenshot(username, screenshot => {
              if (screenshot) {
                res.writeHead(200, { 'Content-Type': 'image/png' });
                res.end(screenshot, 'binary');
              } else {
                returnResult(res, 404);
              }
            });
          } else {
            returnResult(res, 401);
          }
        });
      } else {
        returnResult(res, 400, `Infoscreen "${username}" does not exist`);
      }
    }

    // Get installation script with user in url (in bash)
    else if (settings.validate.getInstallWithInfoUrl.test(urlLower)) {
      const user = getUserFromUrl(url, settings.validate.getInstallWithInfoUrl);
      const [username, token = ''] = user.split(':');
      fs.readFile(settings.files.install, (err, content) => {
        if (err) {
          returnResult(res, 404);
        } else {
          res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
          res.end(
            content
              .toString()
              .replace(/\$1/, username)
              .replace(/\$2/, token),
          );
        }
      });
    }

    // Get installation script (in bash)
    else if (settings.validate.getInstallUrl.test(urlLower)) {
      fs.readFile(settings.files.install, (err, content) => {
        if (err) {
          returnResult(res, 404);
        } else {
          res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
          res.end(content.toString());
        }
      });
    }

    // Get infoscreen information
    else if (settings.validate.getInfoscreenUrl.test(urlLower)) {
      const user = getUserFromUrl(url, settings.validate.getInfoscreenUrl);
      const username = getUsernameFromUser(user);
      if (checkIfInfoscreenExists(username)) {
        checkIfValidToken(user, valid => {
          if (valid) {
            getInfoscreenIp(username, content => {
              if (content) {
                returnResult(res, 200, {
                  ip: content,
                  screenshot: `/${btoa(user)}/screenshot.png`,
                });
              } else {
                returnResult(res, 200, {
                  screenshot: `/${btoa(user)}/screenshot.png`,
                });
              }
            });
          } else {
            returnResult(res, 401);
          }
        });
      } else {
        returnResult(res, 400, `Infoscreen "${username}" does not exist`);
      }
    }

    // Get list of infoscreens available
    else {
      if (url === '/') {
        listInfoscreens(infoscreens => {
          returnResult(
            res,
            200,
            infoscreens,
            'List of all infoscreens registered. To get info from them a token is required. Token is inserted like this: online:token => /base64("online:token") => url = /b25saW5lOnRva2Vu. Function btoa(str) can convert to base64 in all browsers.',
          );
        });
      } else {
        returnResult(res, 400);
      }
    }
  } else {
    returnResult(res, 405);
  }
};

const server = http.createServer(requestHandler);

server.listen(port, err => {
  if (err) {
    return console.log(err);
  }

  console.log(`Server is listening on ${port}`);
});
