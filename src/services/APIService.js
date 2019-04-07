import {
  API,
  getStringParams,
  findObjectPaths,
  injectValuesIntoString,
  pipeTransform,
} from '../utils';
import { get, set } from 'object-path';
import ST from 'stjs';
import fecha from 'fecha';
import openSocket from 'socket.io-client';

fecha.i18n = {
  ...fecha.i18n,
  monthNames: [
    'Januar',
    'Februar',
    'Mars',
    'April',
    'Mai',
    'Juni',
    'Juli',
    'August',
    'September',
    'Oktober',
    'November',
    'Desember',
  ],
};

/**
 * The API service schedules API requests and passes the
 * data from the requests to a callback function.
 *
 * @param {array} apis List of APIs.
 * @param {function} callback Function that recieves data from the API calls.
 * @param {array} components List of components to check what APIs should be used.
 */
export default class APIService {
  constructor(apis, callback, settings = {}, components = []) {
    this.apis = apis;
    this.callback = callback;
    this.settings = settings;
    this.components = components;
    this.elapsedClockTime = 0;
    this.oldClockTime = 0;
    this.time = 0;
    this.interval = null;
    this.usedApis = {};
    this.attemptsUntilFail = 3;
    this.failedApis = {};
    this.workingApis = {};
    this.wsConnections = {};

    if (this.components.length) {
      this.updateUsedApis(this.components);
    }
  }

  /**
   * Starts the scheduling of requests.
   *
   * @param {number} time Start time (in seconds) of the scheduler.
   */
  start(time = 0) {
    this.time = time;
    this.oldClockTime = Date.now();

    this.interval = setInterval(() => {
      const newClockTime = Date.now();
      this.elapsedClockTime = newClockTime - this.oldClockTime;

      if (this.elapsedClockTime >= 1000) {
        this.oldClockTime = newClockTime - new Date().getMilliseconds() + 500;
        this.tick(this.time++);
      }
    }, 100);

    this.startWSConnections();
  }

  /**
   * Stops sending requests.
   *
   * @returns {number} Time (in seconds) when the API was stopped.
   */
  stop() {
    Object.values(this.wsConnections || {}).forEach(socket => socket.close());

    clearInterval(this.interval);

    return this.time;
  }

  /**
   * Transform URLs by injecting values from functions.
   * 
   * Examples:
```javascript
transform('[[now]]') => '2018-10-12T13:14:15Z'
transform('https://some.api/api?date=[[now.date]]') => 'https://some.api/api?date=2018-10-12'
```
   * @param {string} url Any URL, or string
   * @param {string} [start='[['] Encapsulation start
   * @param {string} [end=']]'] Encapsulation end
   * 
   * @returns {string} A transformed string
   */
  transform(url, start = '[[', end = ']]') {
    const functions = Object.assign(
      {
        now: () => Date.now(),
        'now.date': () => new Date().toISOString().slice(0, 10),
        'now.datetime': () => new Date().toISOString(),
        'now.time': () => new Date().toISOString().slice(11, 19),
      },
      this.settings,
    );
    return injectValuesIntoString(
      url,
      functions,
      null,
      start,
      end,
      ':',
      pipeTransform,
    );
  }

  /**
   * Decides what to do on each tick.
   *
   * @param {number} time Time (in seconds) of the tick.
   */
  tick(time = 0) {
    Object.keys(this.apis).forEach(apiName => {
      const api = this.apis[apiName];
      const { interval, delay = 0, offline = false } = api;
      if (!offline && (time - delay) % interval === 0 && time >= delay) {
        const urls = APIService.generateURLs(api, apiName);
        Object.entries(urls).forEach(([key, url]) => {
          if (
            key in this.usedApis &&
            this.usedApis[key] === 'http' &&
            this.hasNotFailed(key)
          ) {
            const { cache: useCache = false } = api;
            const callback = data => {
              if (typeof data === 'object' && 'error' in data) {
                this.handleFail(key, apiName);
                this.workingApis[key] = false;
              } else {
                this.workingApis[key] = true;
                if ('print' in api && api.print) {
                  console.log(
                    `Fra %c${key}%c:`,
                    'color: #f80',
                    'color: unset',
                    data,
                  );
                }
                const { scrape, transformDates } = api;
                if ('transform' in api) {
                  let transformedData = ST.select(data)
                    .transformWith(api.transform)
                    .root();
                  if (transformDates) {
                    transformedData = this.transformDates(
                      transformedData,
                      transformDates,
                    );
                  }
                  if ('printTransform' in api && api.printTransform) {
                    console.log(
                      `Transformert fra %c${key}%c:`,
                      'color: #f80',
                      'color: unset',
                      transformedData,
                    );
                  }
                  this.callback(key, transformedData, useCache, scrape);
                } else {
                  let transformedData = data;
                  if (transformDates) {
                    transformedData = this.transformDates(
                      transformedData,
                      transformDates,
                    );
                  }
                  this.callback(key, transformedData, useCache);
                }
              }
            };
            const error = () => {
              this.handleFail(key, apiName);
            };
            const urlTransformed = this.transform(url);
            const browserHeaders = {
              'User-Agent': navigator.userAgent,
            };
            this.request(
              urlTransformed,
              {
                cors: api.cors,
                ...api.request,
                headers: {
                  ...((api.request || {}).headers || {}),
                  ...(api.browser ? browserHeaders : {}),
                },
              },
              callback,
              error,
              useCache,
            );
          }
        });
      }
    });
  }

  startWSConnections() {
    Object.keys(this.usedApis)
      .filter(key => this.usedApis[key] === 'ws')
      .forEach(key => {
        const api = this.apis[key];
        this.wsConnections[key] = openSocket(api.url);
        this.wsConnections[key].on(api.channel, data => {
          if ('print' in api && api.print) {
            console.log(`Fra %c${key}%c:`, 'color: #f80', 'color: unset', data);
          }
          const { transformDates } = api;
          if ('transform' in api) {
            let transformedData = ST.select(data)
              .transformWith(api.transform)
              .root();
            if (transformDates) {
              transformedData = this.transformDates(
                transformedData,
                transformDates,
              );
            }
            if ('printTransform' in api && api.printTransform) {
              console.log(
                `Transformert fra %c${key}%c:`,
                'color: #f80',
                'color: unset',
                transformedData,
              );
            }
            this.callback(key, transformedData);
          } else {
            let transformedData = data;
            if (transformDates) {
              transformedData = this.transformDates(
                transformedData,
                transformDates,
              );
            }
            this.callback(key, transformedData);
          }
        });
      });
  }

  hasNotFailed(key) {
    return (
      !(key in this.failedApis) ||
      (key in this.failedApis && this.failedApis[key] < this.attemptsUntilFail)
    );
  }

  /**
   * A public function to use outside of the service.
   *
   * @param {string} key The API key name
   * @returns {boolean} If the API is offline
   */
  isOffline(key) {
    return !this.hasNotFailed(key);
  }

  /**
   * Get the fail count from an API.
   *
   * @param {string} key The API key name
   * @returns {number} Amount of fails from the API
   */
  getFailCount(key) {
    if (key in this.failedApis) {
      return this.failedApis[key];
    }

    return 0;
  }

  /**
   * An API is working if it has sent a request and returned a
   * successful result.
   *
   * @param {string} key The API key name
   * @returns {boolean} If the API is online
   */
  isOnline(key) {
    return key in this.workingApis && this.workingApis[key];
  }

  handleFail(key, apiName) {
    // Commented out because it is more important that it fails instead of giving up API
    const { delay = 0 } = this.apis[apiName];
    if (delay < 10) {
      this.apis[apiName].delay = delay * delay + 1;
    }
    if (key in this.failedApis) {
      //this.failedApis[key]++;
    } else {
      this.failedApis[key] = 1;
    }
  }

  /**
   * Get which APIs that are in use given the current components.
   *
   * @param {array} components List of components in view.
   *
   * @returns {{[api: string]: boolean}} API keys with boolean telling if it is used.
   */
  getUsedApis(components) {
    const apis = this.generateURLs();
    return Object.keys(apis).reduce((acc, key) => {
      let isUsed = components.some(component => {
        if ('apis' in component) {
          return Object.values(component.apis).some(value => {
            const settingValue = this.injectSettings(value);
            if (!~settingValue.indexOf(':')) return settingValue === key;
            return settingValue.split(':')[0] === key;
          });
        }
        return false;
      }, false);
      return Object.assign({}, acc, {
        [key]: isUsed ? (/^wss?:\/\//.test(apis[key]) ? 'ws' : 'http') : false,
      });
    }, {});
  }

  injectSettings(value) {
    return injectValuesIntoString(
      value,
      {
        ...this.settings,
        affiliationGroup: this.settings.affiliation.split('-')[0],
      },
      '',
      '{{',
      '}}',
    );
  }

  updateUsedApis(components = []) {
    this.usedApis = this.getUsedApis(components);
  }

  getApis() {
    return this.apis;
  }

  updateSettings({ apis = {}, settings = {}, components = [] }) {
    this.stop();

    this.apis = apis;
    this.settings = settings;
    this.usedApis = {};
    this.failedApis = {};
    this.workingApis = {};

    this.updateUsedApis(components);
    this.start();
  }

  scrape(path, data, callback, useCache) {
    const selectors = findObjectPaths(data, path);
    for (const selector of selectors) {
      const string = get(data, selector, '');
      const scrapeSections = getStringParams(string, '[[', ']]');
      for (const section of scrapeSections) {
        const selectorIndex = section.indexOf(':', 7);
        const req = section.slice(0, selectorIndex);
        const htmlSelector = section.slice(selectorIndex + 1);
        this.request(
          req,
          { htmlSelector },
          scrapeData => {
            callback(scrapeData, selector, section);
          },
          () => {},
          useCache,
        );
      }
    }
  }

  transformDates(data, datesToTransform) {
    for (const [path, dateFormat] of Object.entries(datesToTransform)) {
      const selectors = findObjectPaths(data, path);
      for (const selector of selectors) {
        const date = get(data, selector);
        const newDate = fecha.parse(date, dateFormat);
        set(data, selector, newDate);
      }
    }

    return data;
  }

  request(url, req, callback, error, useCache = false) {
    const [coreUrl, type = 'GET', body = ''] = url.split('#');
    switch (type.split(':')[0]) {
      case 'GET':
        API.getRequest(coreUrl, req, callback, error, useCache);
        break;
      case 'POST':
        const newReq = Object.assign({ body }, req);
        API.postRequest(coreUrl, newReq, callback, error, useCache);
        break;
      case 'RSS':
        API.getRSSRequest(coreUrl, req, callback, error, useCache);
        break;
      case 'HTML':
      // eslint-disable-next-line
      case 'HTML2JSON':
        const returnsDoc = 'document';
      // eslint-disable-next-line
      case 'HTML2HTML':
        const returnsHTML = returnsDoc || 'html';
      // eslint-disable-next-line
      case 'HTML2TEXT':
        const postfix = body.length ? `#${body}` : '';
        const htmlSelector = (type + postfix).split(':')[1] || req.htmlSelector;
        delete req.htmlSelector;
        API.getHTMLRequest(
          coreUrl,
          req,
          htmlSelector,
          callback,
          error,
          useCache,
          returnsHTML || 'text',
        );
        break;
      case 'TEXT':
        API.getTextRequest(coreUrl, req, callback, error, useCache);
        break;
      case 'TIME':
        callback(Date.now());
        break;
      default:
        API.getRequest(url, req, callback, error, useCache);
        break;
    }
  }

  /**
   * Generate URLs from a URL with multiple parameters.
   * ```
api = {
  url: 'http://.../{id.*}/{from,to}',
  id: {
    online: '23',
    abakus: '20',
    delta: '10'
  },
  from: 0,
  to: 1
}

generateURLs(api, 'bus') =>
{
  'bus.id.online.from': 'http://.../23/0',
  'bus.id.online.to': 'http://.../23/1',
  'bus.id.abakus.from': 'http://.../20/0',
  'bus.id.abakus.to': 'http://.../20/1',
  'bus.id.delta.from': 'http://.../10/0',
  'bus.id.delta.to': 'http://.../10/1'
}
```
   *
   * @param {object} api An API object.
   * @param {string} apiName Pointer to which API object.
   *
   * @returns {array} Array with URLs packed with context data.
   */
  static generateURLs(api, apiName) {
    const { url } = api;
    let postfix = '';
    const addPostfix = method => {
      const body =
        typeof api.body === 'object'
          ? JSON.stringify(api.body)
          : api.body || '';
      postfix = `#${method.toUpperCase()}#${body}`;
    };
    if ('method' in api && api.method !== 'GET') {
      addPostfix(api.method);
    }
    if (
      'request' in api &&
      'method' in api.request &&
      api.request.method !== 'GET'
    ) {
      addPostfix(api.request.method);
    }
    if (url.endsWith('#POST')) {
      const body =
        typeof api.body === 'object'
          ? JSON.stringify(api.body)
          : api.body || '';
      postfix = `#${body}`;
    }
    const urlWithPostfix = url + postfix;
    const params = getStringParams(urlWithPostfix);
    const fragments = urlWithPostfix.split(/{{[^}]+}}/g);
    const zip = fragments.slice(1).reduce(
      (acc, fragment, i) => {
        const newUrls = [];
        const newKeys = [];
        const nextParam = params[i] || '';
        const apiObjPaths = findObjectPaths(api, nextParam);
        acc.urls.forEach((oldURL, j) => {
          apiObjPaths.forEach(path => {
            const value = get(api, path, '');
            newUrls.push(oldURL + value + fragment);
            newKeys.push(acc.keys[j] + '.' + path);
          });
        });

        return {
          urls: newUrls,
          keys: newKeys,
        };
      },
      {
        urls: [fragments[0]],
        keys: [apiName],
      },
    );

    const urls = zip.urls.reduce((acc, url, i) => {
      return Object.assign({}, acc, {
        [zip.keys[i]]: url,
      });
    }, {});

    return urls;
  }

  /**
   * Generate all urls from all APIs.
   */
  generateURLs() {
    return Object.entries(this.apis).reduce((acc, [apiName, api]) => {
      return Object.assign({}, acc, APIService.generateURLs(api, apiName));
    }, {});
  }

  /**
   * Applies changes in the APIs and starts a new schedule
   * with the changes in the API.
   *
   * @param {array} apis List of APIs.
   * @param {boolean} restart Make it possible to not restart the service.
   */
  update(apis, restart = true) {
    let stopTime = 0;
    if (restart) stopTime = this.stop();

    this.apis = apis;
    this.updateUsedApis(this.components);

    if (restart) this.start(stopTime);
  }
}
