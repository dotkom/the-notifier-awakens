import React from 'react';

import * as Components from '../components';
import { get } from 'object-path';
import { injectValuesIntoString } from '../utils';

/**
 * The component controller passes data into components and
 * updates them in a proper way.
 *
 * @param {array} componentsData List of component data.
 * @param {array} components List of components that should be rendered.
 */
export default class ComponentController {
  constructor(components, settings = {}) {
    this.components = components;
    this.settings = settings;
  }

  updateSettings(settings) {
    this.settings = settings;
  }

  injectSettings(value) {
    return injectValuesIntoString(value, this.settings, '', '${', '}');
  }

  update(key, data) {}

  getComponents() {
    return this.components;
  }

  renderComponents(data = {}) {
    return this.components.map((component, i) => {
      const Component = Components[component.template];
      const dataProps = Object.entries(component.apis).reduce(
        (acc, [key, path]) => {
          const [apiPath, pathInRequest] = path.split(':');
          const apiPathParsed = this.injectSettings(apiPath);
          if (apiPathParsed in data) {
            const dataFromApi = data[apiPathParsed];
            const dataToKey = pathInRequest
              ? get(dataFromApi, pathInRequest, '')
              : dataFromApi;
            return Object.assign({}, acc, {
              [key]: dataToKey,
            });
          }
          return acc;
        },
        {},
      );

      return <Component key={i} {...dataProps} />;
    });
  }
}
