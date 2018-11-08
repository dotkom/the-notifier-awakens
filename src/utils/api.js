import { API_ROOT } from '../constants';
import { parseString } from 'xml2js';

export const API = {
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
      .then(callback)
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
    return fetch(API.transformURL(url), req)
      .then(res => res.json())
      .then(callback)
      .catch(error);
  },

  /**
   * Send a GET request and parse RSS.
   *
   * @param {string} url The URL to GET from
   * @param {object} req Headers and more request spesific (see the fetch API)
   * @param {function} callback Function that retrieves data from request
   * @param {function} error Error from when request fails
   */
  getRSSRequest(url, req, callback = () => {}, error = () => {}) {
    const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/';
    return fetch(API.transformURL(CORS_PROXY + url), req)
      .then(res => res.text())
      .then(res => {
        parseString(res, (_, parsedResult) => {
          callback(parsedResult);
        });
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
