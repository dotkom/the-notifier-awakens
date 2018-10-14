import { get, set, has } from 'object-path';
import merge from 'object-merge';

export default class Storage {
  constructor(data) {
    this.storageKey = 'data';

    try {
      if (data) {
        this.data = data;
      } else {
        let savedData = localStorage.getItem(this.storageKey);

        if (savedData) {
          this.data = JSON.parse(savedData);
        } else {
          this.data = {};
        }
      }
    } catch (err) {
      this.data = data || {};
    }
  }

  /**
   * Get the data from the storage object.
   * 
   * @param {string} key The key to get from storage. Specify none if you want the whole storage.
   * @returns {object} The storage at key or the whole storage set.
   */
  get(key = '') {
    if (key === '') {
      return !!Object.keys(this.data);
    }

    return get(this.data, key, undefined);
  }

  /**
   * Check if key exists in the storage object.
   * 
   * @param {string} key The key to get from storage. Specify none if you want the whole storage.
   * @returns {bool} If the storage object has the key.
   */
  has(key = '') {
    if (key === '') {
      return this.data;
    }

    return has(this.data, key);
  }

  /**
   * Update the storage at a key and return the new storage state.
   * 
   * @param {string} key The key to set in the storage object.
   * @param {string} value The value to set the key to.
   * @param {bool} save Save the storage to device storage.
   * @returns {object} The updated storage object state.
   */
  set(key, value, save = false) {
    let oldValue = undefined;

    if (key) {
      oldValue = get(this.data, key, undefined);
      set(this.data, key, value);
    } else {
      oldValue = this.data;
      this.data = value;
    }

    if (save) {
      this.save();
    }

    return oldValue;
  }

  /**
   * Saves the current storage object state to the device storage.
   */
  save() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    } catch (err) {}
  }

  /**
   * Should merge data into current storage as best as it can.
   * 
   * @param {object} data Input data that is merged into the original storage object.
   * @returns {object} Unified data sturcture.
   */
  merge(data, save = false) {
    this.data = merge(this.data, data);

    if (save) {
      this.save();
    }

    return this.data;
  }
}
