import React from 'react';
import Style from 'style-it';

import * as Components from '../components';
import { get } from 'object-path';
import { injectValuesIntoString } from '../utils';
import { IfPropIsOnline } from './IfPropIsOnline';

/**
 * The component controller passes data into components and
 * updates them in a proper way.
 *
 * @param {array} componentsData List of component data.
 * @param {array} components List of components that should be rendered.
 */
export default class ComponentController {
  constructor(components, settings = {}, translations = {}) {
    this.components = components;
    this.settings = settings;
    this.translations = translations;
  }

  updateSettings(settings) {
    this.settings = settings;
  }

  updateTranslations(translations) {
    this.translations = translations;
  }

  translate(word) {
    if (word in this.translations) {
      return this.translations[word];
    }

    return word;
  }

  injectSettings(value) {
    return injectValuesIntoString(value, this.settings, '', '{{', '}}');
  }

  update(key, data) {}

  getComponents() {
    return this.components;
  }

  isPropOffline(apiService, component, prop) {
    if ('apis' in component && prop in component.apis) {
      const apiKey = this.injectSettings(component.apis[prop]).split(':')[0];
      return apiService.isOffline(apiKey);
    }

    return false;
  }

  isPropOnline(apiService, component, prop) {
    if ('apis' in component && prop in component.apis) {
      const apiKey = this.injectSettings(component.apis[prop]).split(':')[0];
      return apiService.isOnline(apiKey);
    }

    return false;
  }

  getPropFailCount(apiService, component, prop) {
    if ('apis' in component && prop in component.apis) {
      const apiKey = this.injectSettings(component.apis[prop]).split(':')[0];
      return apiService.getFailCount(apiKey);
    }

    return 0;
  }

  getApiName(component, prop) {
    if ('apis' in component && prop in component.apis) {
      const apiRootKey = this.injectSettings(component.apis[prop]).split(
        '.',
      )[0];
      return this.translate(apiRootKey);
    }

    return prop;
  }

  renderComponents(apiService, data = {}) {
    return this.components.map((component, i) => {
      const template = component.template.split('-')[0];
      const props = Object.entries(component).reduce((acc, [key, val]) => {
        if (typeof val === 'string') {
          return Object.assign({}, acc, {
            [key]: this.injectSettings(val),
          });
        }
        return acc;
      }, component);
      if (!~Object.keys(Components).indexOf(template)) {
        throw new Error(
          `Remember to export the "${template}" component from the components module (in ../components/index.js)`,
        );
      }
      const Component = Components[template];
      const dataProps = Object.entries(component.apis || {}).reduce(
        (acc, [key, path]) => {
          const pathParsed = this.injectSettings(path);
          const [apiPath, pathInRequest] = pathParsed.split(':');
          if (apiPath in data) {
            const dataFromApi = data[apiPath];
            const dataToKey = pathInRequest
              ? get(dataFromApi, pathInRequest, '')
              : dataFromApi;
            return Object.assign({}, acc, {
              [key]: dataToKey,
            });
          }
          return acc;
        },
        props,
      );

      let modularCSS = `
.${component.template} {
  grid-area: ${component.id || component.template};
  padding: ${component.padding || '32px'};
  overflow: ${component.overflow || 'hidden'};
}
`;
      if ('css' in dataProps) {
        modularCSS += dataProps.css;
      }

      return (
        <Style key={i}>
          {modularCSS}
          <div className={`${component.template} component`}>
            <Component
              translate={e => this.translate(e)}
              isPropOffline={prop =>
                this.isPropOffline(apiService, component, prop)
              }
              isPropOnline={prop =>
                this.isPropOnline(apiService, component, prop)
              }
              getPropFailCount={prop =>
                this.getPropFailCount(apiService, component, prop)
              }
              getApiName={prop => this.getApiName(component, prop)}
              IfPropIsOnline={IfPropIsOnline}
              {...dataProps}
            />
          </div>
        </Style>
      );
    });
  }
}
