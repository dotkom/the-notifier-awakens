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
    console.log(time);
    Object.keys(this.apis).forEach(apiName => {
      if (time % this.apis[apiName].interval === 0) {
        this.callback(apiName);
      }
    });
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
