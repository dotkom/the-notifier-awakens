import { getStringParams, findObjectPaths } from '../utils';
import { get } from 'object-path';

/**
 * The API service schedules API requests and passes the
 * data from the requests to a callback function.
 *
 * @param {object} APIProvider API request handler.
 * @param {function} callback Function that recieves data from the API calls.
 */
export default class APIService {
  constructor(APIProvider, apis, callback) {
    this.apis = apis;
    this.callback = callback;
    this.elapsedClockTime = 0;
    this.oldClockTime = 0;
    this.time = 0;
    this.interval = null;
  }

  /**
   * Starts the scheduling of requests.
   *
   * @param {number} time Start time (in seconds) of the scheduler.
   */
  start(time = 0) {
    this.oldClockTime = new Date().getTime();
    this.time = 0;

    this.interval = setInterval(() => {
      const newClockTime = new Date().getTime();
      this.elapsedClockTime = newClockTime - this.oldClockTime;

      if (this.elapsedClockTime >= 1000) {
        this.oldClockTime = newClockTime;
        this.elapsedClockTime = 0;
        this.tick(this.time++);
      }
    }, 100);
  }

  /**
   * Stops sending requests.
   *
   * @returns {number} Time (in seconds) when the API was stopped.
   */
  stop() {
    clearInterval(this.interval);
  }

  /**
   * Decides what to do on each tick.
   *
   * @param {number} time Time (in seconds) of the tick.
   */
  tick(time = 0) {
    Object.keys(this.apis).forEach(apiName => {
      const api = this.apis[apiName];
      const { url, interval, delay = 0, offline = false } = api;
      if (!offline && (time - delay) % interval === 0) {
        const urls = this.generateURLs(api, apiName);
        console.log(urls);
      }
    });
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
[
  'http://.../23/0',
  'http://.../23/1',
  'http://.../20/0',
  'http://.../20/1',
  'http://.../10/0',
  'http://.../10/1'
]
```
   *
   * @param {object} api An API object.
   * @param {string} apiName Pointer to which API object.
   *
   * @returns {array} Array with URLs packed with context data.
   */
  static generateURLs(api, apiName) {
    const { url } = api;
    const firstSliceIndex = url.indexOf('{{');
    const params = getStringParams(url);
    const fragments = url.split(/{{[^}]+}}/g);
    const urls = fragments.slice(1).reduce(
      (acc, fragment, i) => {
        const newUrls = [];
        const nextParam = params[i] || '';
        const apiObjPaths = findObjectPaths(api, nextParam);
        acc.urls.forEach(oldURL => {
          apiObjPaths.forEach(path => {
            const value = get(api, path, '');
            newUrls.push(oldURL + value + fragment);
          });
        });

        return {
          urls: newUrls,
        };
      },
      {
        urls: [fragments[0]],
      },
    );

    return urls;
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

    if (restart) this.start(stopTime);
  }
}
