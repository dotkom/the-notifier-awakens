import { API_ROOT } from '../constants';

export const API = {
  postRequest(url, req, callback = () => {}, error = () => { /*console.error*/ }) {
    req.headers = Object.assign({}, req.headers, {
      'Content-Type': 'application/json',
    });
    req.method = 'POST';
    req.headers = new Headers(req.headers);
      req.body = typeof req.body === 'object'
        ? JSON.stringify(req.body || {})
        : req.body;

    return fetch(new Request(API.transformURL(url), req))
      .then(res => res.json())
      .then(callback)
      .catch(error);
  },

  getRequest(url, callback = () => {}, error = () => { /*console.error*/ }) {
    let req = {
      headers: new Headers({
        //'Content-Type': 'application/json',
      }),
    };

    return fetch(new Request(API.transformURL(url), req))
      .then(res => res.json())
      .then(callback)
      .catch(error);
  },

  joinPath(...paths) {
    return paths.join('/').replace(/\/+/g, '/');
  },

  transformURL(url) {
    return /^https?:\/\//.test(url)
      ? url
      : this.joinPath(API_ROOT, url);
  },
};
