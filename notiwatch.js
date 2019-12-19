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
const socket = require('socket.io');
let io = null;

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
    install: `${__dirname}/infoscreen-setup/bin/notiwall`,
    sensors: `${__dirname}/notiwatch/sensors.json`,
    tokens: `${__dirname}/notiwatch/tokens.txt`,
  },
  validate: {
    getUrl: /^[0-9\. a-zøæå]*$/,
    user: /[0-9A-Za-z\/+=]+/,
    postScreenshotUrl: /^\/screenshot\/(.+)$/,
    postIpUrl: /^\/ip\/(.+)$/,
    postSensorUrl: /^\/sensors\/(.+)$/,
    postSensorFormat: `{
  "name": "<name>",
  "type": "door|coffee|light",
  "value": "<value>",
  [, "<coords>": "<lat>,<lng>", "description": "<description>"]
}`,
    postIpData: /^[0-9\. a-zøæå:\[\]]*$/,
    getScreenshotUrl: /^\/(.+)\/screenshot\.png$/,
    getIpUrl: /^\/(.+)\/ip$/,
    getSensorsUrl: /^\/(.+)\/sensors$/,
    getInfoscreenUrl: /^\/(.+)$/,
    getInstallWithInfoUrl: /^\/(.+)\/notiwall\.sh$/,
    getInstallUrl: /^\/notiwall\.sh$/,
  },
};

let sensorData = {};
if (fs.existsSync(settings.files.sensors)) {
  try {
    sensorData = JSON.parse(fs.readFileSync(settings.files.sensors));
  } catch (ex) {
    sensorData = {};
  }
}

const btoa = string => Buffer.from(string).toString('base64');
const atob = base64 => Buffer.from(base64, 'base64').toString('ascii');

const updateIP = (file, ip) => {
  fs.writeFile(`${settings.folders.ip}/${file}.txt`, ip, () => {});
};

const updateSensor = (key, data) => {
  if (!(key in sensorData)) {
    sensorData[key] = {};
    data['log'] = [];
    io.of(`/${key}/${data.name}`).on('connection', socket => {
      const dataCopy = Object.assign({}, data);
      delete dataCopy.log;
      socket.emit('status', dataCopy);
    });
  } else if (data.name in sensorData[key]) {
    if ('log' in sensorData[key][data.name]) {
      data['log'] = sensorData[key][data.name]['log'].slice(0, 49);
    } else {
      data['log'] = [];
    }
  } else {
    data['log'] = [];
  }
  data['log'] = [{ date: data.updated, value: data.value }].concat(data['log']);
  if (data.value !== sensorData[key][data.name].value) {
    const dataCopy = Object.assign({}, data);
    delete dataCopy.log;
    io.of(`/${key}/${data.name}`).emit('status', dataCopy);
  }
  sensorData[key][data.name] = data;
};

const saveSensorDataToFile = () => {
  fs.writeFileSync(settings.files.sensors, JSON.stringify(sensorData));
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
      callback(!!~tokens.indexOf(user.replace(/:$/, '')));
    }
  });
};

const checkIfUserExists = (user, callback) => {
  fs.readFile(settings.files.tokens, (err, content) => {
    if (err) {
      callback(false);
    } else {
      const tokens = content
        .toString()
        .trim()
        .split('\n')
        .map(t => t.split(':')[0]);
      callback(!!~tokens.indexOf(user.split(':')[0]));
    }
  });
};

const getUserFromUrl = (url, regex) => {
  const creds = regex.exec(url)[1] || '';
  return atob(creds);
};

const getUsernameFromUser = user => {
  const pos = user.indexOf(':');
  return ~pos ? user.slice(0, pos) : user;
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

const getInfoscreenSensors = (username, callback = () => {}) => {
  const data = username in sensorData && sensorData[username];
  callback(data);
  return data;
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
  return (
    infoscreenName in sensorData ||
    fs.existsSync(`${settings.folders.ip}/${infoscreenName}.txt`)
  );
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
          statusCode: statusCode,
          [type]: message,
        }),
      ),
    );
  } else {
    res.end(
      JSON.stringify(
        Object.assign(descriptionObj, {
          statusCode: statusCode,
          [type]: message || res.statusMessage,
        }),
      ),
    );
  }
};

const requestHandler = (req, res) => {
  const url = req.url.slice(settings.rootLength).split('?')[0];
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
              updateIP(username, `${new Date().toISOString()}: ${ip}`);
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

    // If sensors
    else if (settings.validate.postSensorUrl.test(urlLower)) {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', () => {
        // Getting the base64 user credentials from url
        const user = getUserFromUrl(url, settings.validate.postSensorUrl);
        try {
          const sensordata = JSON.parse(body);
          if (
            'name' in sensordata &&
            'type' in sensordata &&
            'value' in sensordata
          ) {
            checkIfValidToken(user, valid => {
              if (valid) {
                const username = getUsernameFromUser(user);
                sensordata['updated'] = new Date().toISOString();
                updateSensor(username, sensordata);
                returnResult(res, 201);
              } else {
                returnResult(res, 401);
              }
            });
          } else {
            returnResult(
              res,
              400,
              `Missing key in body. Use this format: ${settings.validate.postSensorFormat}`,
            );
          }
        } catch (ex) {
          returnResult(
            res,
            400,
            `JSON in body is invalid. Use this format: ${settings.validate.postSensorFormat}`,
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
        checkIfUserExists(user, valid => {
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

    // Get sensors only
    else if (settings.validate.getSensorsUrl.test(urlLower)) {
      const user = getUserFromUrl(url, settings.validate.getSensorsUrl);
      const username = getUsernameFromUser(user);
      if (checkIfInfoscreenExists(username)) {
        checkIfUserExists(user, valid => {
          if (valid) {
            const sensors = getInfoscreenSensors(username);
            if (sensors) {
              returnResult(res, 200, sensors);
            } else {
              returnResult(res, 404);
            }
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
              const sensors = getInfoscreenSensors(username);
              returnResult(res, 200, {
                ...(sensors && { sensors }),
                ...(content && { ip: content }),
                screenshot: `/${btoa(user)}/screenshot.png`,
              });
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
      if (url === '/' || url === '') {
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
io = socket(server);

Object.entries(sensorData).forEach(infoscreen => {
  const infoscreenName = infoscreen[0];
  Object.entries(infoscreen[1]).forEach(sensor => {
    sensorName = sensor[0];
    data = sensor[1];
    io.of(`/${infoscreenName}/${sensorName}`).on('connection', socket => {
      const dataCopy = Object.assign(
        {},
        sensorData[infoscreenName][sensorName],
      );
      delete dataCopy.log;
      socket.emit('status', dataCopy);
    });
  });
});

server.listen(port, err => {
  if (err) {
    return console.log(err);
  }

  console.log(`Server is listening on ${port}`);
});

// Save to file before exit as we want a persistent storage
process.stdin.resume();

function exitHandler(options, _) {
  if (options.cleanup) {
    saveSensorDataToFile();
  }
  if (options.exit) process.exit();
}

if (process.env.REACT_APP_DEBUG !== 'true') {
  process.on('exit', exitHandler.bind(this, { cleanup: true }));
  process.on('SIGINT', exitHandler.bind(this, { exit: true }));
  process.on('SIGTERM', exitHandler.bind(this, { exit: true }));
  process.on('SIGUSR1', exitHandler.bind(this, { exit: true }));
  process.on('SIGUSR2', exitHandler.bind(this, { exit: true }));
  process.on('uncaughtException', exitHandler.bind(this, { exit: true }));
}
