import { API_ROOT } from '../constants';
import { parseString } from 'xml2js';
import Storage from './storage';

export const cache = new Storage(null, 'cache');
export const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/';

export const API = {
  /**
   * Receive data from key in cache. The url and type needs to match the key in the cache.
   *
   * @param {string} url Any url
   * @param {string} type HTML:{css-selector}{?(at)attr}, RSS, or POST:{SHA256 of payload}
   *
   * @returns {any} Data from cache
   */
  getRequestFromCache(url, type) {
    return cache.get(API.removeDotsFromUrl(`${url}#${type}`));
  },

  /**
   * Add data to cache using an ID on a spesific format.
   *
   * @param {string} url Any url
   * @param {string} type HTML:{css-selector}{?(at)attr}, RSS, or POST:{SHA256 of payload}
   * @param {any} data The data from request
   */
  addRequestToCache(url, type, data) {
    cache.set(API.removeDotsFromUrl(`${url}#${type}`), data, true);
    API.getRequestFromCache(url, type);
  },

  /**
   * Dots (.) are used to access properties from objects. Replace them to "(dot)" instead.
   *
   * @param {string} url Any url
   */
  removeDotsFromUrl(url) {
    return url.replace(/\./g, '(dot)');
  },

  /**
   * Replace (dot) with an actual ".".
   *
   * @param {string} url Any url
   */
  addDotsFromUrl(url) {
    return url.replace(/\(dot\)/g, '.');
  },

  /**
   * Create a sha256 hash from payload.
   *
   * @param {any} message Input to hash function
   * @returns {string} sha256 hash
   */
  async sha256(message) {
    const msgBuffer = new TextEncoder('utf-8').encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map(b => ('00' + b.toString(16)).slice(-2))
      .join('');
    return hashHex;
  },

  /**
   * Send a POST request.
   *
   * @param {string} url The URL to POST to
   * @param {object} req Headers and more request spesific (see the fetch API)
   * @param {function} callback Function that retrieves data from request
   * @param {function} error Error from when request fails
   * @param {boolean} useCache Tell if cache should be used if available
   */
  postRequest(
    url,
    req,
    callback = () => {},
    error = () => {},
    useCache = false,
  ) {
    req.method = 'POST';
    req.headers = Object.assign(
      {
        'Content-Type': 'application/json',
      },
      req.headers,
    );
    req.body =
      typeof req.body === 'object' ? JSON.stringify(req.body || {}) : req.body;

    if (useCache) {
      (async function() {
        const hash = await API.sha256(req.body);
        const cacheData = API.getRequestFromCache(url, `POST:${hash}`);

        if (cacheData) {
          callback(cacheData);
          return;
        }

        return fetch(API.transformURL(url), req)
          .then(res => res.json())
          .then(data => {
            callback(data);
            API.addRequestToCache(url, `POST:${hash}`, data);
          })
          .catch(error);
      })();
    } else {
      return fetch(API.transformURL(url), req)
        .then(res => res.json())
        .then(data => {
          callback(data);
        })
        .catch(error);
    }
  },

  /**
   * Send a GET request.
   *
   * @param {string} url The URL to GET from
   * @param {object} req Headers and more request spesific (see the fetch API)
   * @param {function} callback Function that retrieves data from request
   * @param {function} error Error from when request fails
   * @param {boolean} useCache Tell if cache should be used if available
   */
  getRequest(
    url,
    req,
    callback = () => {},
    error = () => {},
    useCache = false,
  ) {
    if (useCache) {
      const cacheData = API.getRequestFromCache(url, 'GET');
      if (cacheData) {
        callback(cacheData);
        return;
      }
    }
    const prefix = req.cors ? CORS_PROXY : '';
    delete req.cors;
    return fetch(API.transformURL(prefix + url), req)
      .then(res => res.json())
      .then(data => {
        callback(data);
        if (useCache) API.addRequestToCache(url, 'GET', data);
      })
      .catch(error);
  },

  /**
   * Send a GET request, resolve CORS and parse RSS.
   *
   * @param {string} url The URL to GET from
   * @param {object} req Headers and more request spesific (see the fetch API)
   * @param {function} callback Function that retrieves data from request
   * @param {function} error Error from when request fails
   * @param {boolean} useCache Tell if cache should be used if available
   */
  getRSSRequest(
    url,
    req,
    callback = () => {},
    error = () => {},
    useCache = false,
  ) {
    if (useCache) {
      const cacheData = API.getRequestFromCache(url, 'RSS');
      if (cacheData) {
        callback(cacheData);
        return;
      }
    }
    const prefix = req.cors || true ? CORS_PROXY : '';
    delete req.cors;
    return fetch(API.transformURL(prefix + url), req)
      .then(res => res.text())
      .then(res => {
        parseString(res, (_, parsedResult) => {
          callback(parsedResult);
          if (useCache) API.addRequestToCache(url, 'RSS', parsedResult);
        });
      })
      .catch(error);
  },

  /**
   * Send a GET request and resolve CORS.
   *
   * @param {string} url The URL to GET from
   * @param {object} req Headers and more request spesific (see the fetch API)
   * @param {function} callback Function that retrieves data from request
   * @param {function} error Error from when request fails
   * @param {boolean} useCache Tell if cache should be used if available
   */
  getHTMLRequest(
    url,
    req,
    selector = '',
    callback = () => {},
    error = () => {},
    useCache = false,
    returns = 'text',
  ) {
    if (useCache) {
      const cacheData = API.getRequestFromCache(url, `HTML:${selector}`);
      if (cacheData || cacheData === '') {
        callback(cacheData);
        return;
      }
    }
    const prefix = req.cors || true ? CORS_PROXY : '';
    delete req.cors;
    return fetch(API.transformURL(prefix + url), req)
      .then(res => res.text())
      .then(html => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        let [querySelector = ':root', attribute = ''] = selector.split('@');
        if (querySelector === '') {
          querySelector = ':root';
        }
        const element = doc.querySelector(querySelector);
        let scrapeData = '';
        let avoidReturn = false;
        if (element !== null) {
          if (attribute) {
            scrapeData = element.getAttribute(attribute);
          } else {
            if (returns === 'html') {
              scrapeData = element.innerHTML;
            } else if (returns === 'document') {
              avoidReturn = true;
              parseString(element.outerHTML, (_, parsedResult) => {
                scrapeData = parsedResult;
                callback(scrapeData);
                if (useCache)
                  API.addRequestToCache(url, `HTML:${selector}`, scrapeData);
              });
            } else {
              scrapeData = element.innerText;
            }
          }
        }
        if (!avoidReturn) {
          callback(scrapeData);
          if (useCache)
            API.addRequestToCache(url, `HTML:${selector}`, scrapeData);
        }
      })
      .catch(error);
  },

  /**
   * Send a GET request and resolve CORS.
   *
   * @param {string} url The URL to GET from
   * @param {object} req Headers and more request spesific (see the fetch API)
   * @param {function} callback Function that retrieves data from request
   * @param {function} error Error from when request fails
   * @param {boolean} useCache Tell if cache should be used if available
   */
  getTextRequest(
    url,
    req,
    callback = () => {},
    error = () => {},
    useCache = false,
  ) {
    if (useCache) {
      const cacheData = API.getRequestFromCache(url, 'RSS');
      if (cacheData) {
        callback(cacheData);
        return;
      }
    }
    const prefix = req.cors || true ? CORS_PROXY : '';
    delete req.cors;
    return fetch(API.transformURL(prefix + url), req)
      .then(res => res.text())
      .then(data => {
        callback(data);
        if (useCache) API.addRequestToCache(url, 'TEXT', data);
      })
      .catch(error);
  },

  /**
   * Make sure paths are joined properly.
   *
   * @param {...string} paths Paths that should be joined
   */
  joinPath(...paths) {
    return paths.join('/').replace(/\/+/g, '/');
  },

  /**
   * Prefix paths correctly if no host is specified.
   *
   * @param {string} url Any absolute or relative URL
   */
  transformURL(url) {
    return /^https?:\/\//.test(url) ? url : this.joinPath(API_ROOT, url);
  },
};
