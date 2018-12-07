import { API_ROOT } from '../constants';
import { parseString } from 'xml2js';
import Storage from './storage';

const cache = new Storage(null, 'cache');

export const API = {
  getRequestFromCache(url, type) {
    return cache.get(API.removeDotsFromUrl(`${url}#${type}`));
  },
  addRequestToCache(url, type, data) {
    cache.set(API.removeDotsFromUrl(`${url}#${type}`), data, true);
    API.getRequestFromCache(url, type);
  },
  removeDotsFromUrl(url) {
    return url.replace(/\./g, '(dot)');
  },
  addDotsFromUrl(url) {
    return url.replace(/\(dot\)/g, '.');
  },

  /**
   * Send a POST request.
   *
   * @param {string} url The URL to POST to
   * @param {object} req Headers and more request spesific (see the fetch API)
   * @param {function} callback Function that retrieves data from request
   * @param {function} error Error from when request fails
   */
  postRequest(url, req, callback = () => {}, error = () => {}) {
    req.method = 'POST';
    req.headers = Object.assign(
      {
        'Content-Type': 'application/json',
      },
      req.headers,
    );
    req.body =
      typeof req.body === 'object' ? JSON.stringify(req.body || {}) : req.body;

    return fetch(API.transformURL(url), req)
      .then(res => res.json())
      .then(data => {
        callback(data);
        API.addRequestToCache(url, 'POST', data);
      })
      .catch(error);
  },

  /**
   * Send a GET request.
   *
   * @param {string} url The URL to GET from
   * @param {object} req Headers and more request spesific (see the fetch API)
   * @param {function} callback Function that retrieves data from request
   * @param {function} error Error from when request fails
   */
  getRequest(url, req, callback = () => {}, error = () => {}) {
    const cacheData = API.getRequestFromCache(url, 'GET');
    if (cacheData) {
      callback(cacheData);
      return;
    }
    return fetch(API.transformURL(url), req)
      .then(res => res.json())
      .then(data => {
        callback(data);
        API.addRequestToCache(url, 'GET', data);
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
   */
  getRSSRequest(url, req, callback = () => {}, error = () => {}) {
    const cacheData = API.getRequestFromCache(url, 'RSS');
    if (cacheData) {
      callback(cacheData);
      return;
    }
    const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/';
    return fetch(API.transformURL(CORS_PROXY + url), req)
      .then(res => res.text())
      .then(res => {
        parseString(res, (_, parsedResult) => {
          callback(parsedResult);
          API.addRequestToCache(url, 'RSS', parsedResult);
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
   */
  getHTMLRequest(url, selector, req, callback = () => {}, error = () => {}) {
    const cacheData = API.getRequestFromCache(url, `HTML:${selector}`);
    if (cacheData) {
      callback(cacheData);
      return;
    }
    const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/';
    return fetch(API.transformURL(CORS_PROXY + url), req)
      .then(res => res.text())
      .then(html => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const [querySelector = ':root', attribute = ''] = selector.split('@');
        const element = doc.querySelector(querySelector);
        const scrapeData =
          element === null
            ? ''
            : attribute
            ? element.getAttribute(attribute)
            : element.innerHTML;
        callback(scrapeData);
        API.addRequestToCache(url, `HTML:${selector}`, scrapeData);
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
   */
  getTextRequest(url, req, callback = () => {}, error = () => {}) {
    const cacheData = API.getRequestFromCache(url, 'RSS');
    if (cacheData) {
      callback(cacheData);
      return;
    }
    const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/';
    return fetch(API.transformURL(CORS_PROXY + url), req)
      .then(res => res.text())
      .then(data => {
        callback(data);
        API.addRequestToCache(url, 'TEXT', data);
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
