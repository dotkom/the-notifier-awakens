import React from 'react';
import Style from 'style-it';

import * as Components from '../components';
import { get } from 'object-path';
import { injectValuesIntoString } from '../utils';
import { IfPropIsOnline } from './IfPropIsOnline';
import { format } from 'date-fns';
import * as locale from 'date-fns/locale/nb';

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
    this.pipes = this.pipes.bind(this);
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

  injectSettings(value, fallbackValue = null, defaultMatch = ':') {
    return injectValuesIntoString(
      value,
      this.settings,
      fallbackValue,
      '{{',
      '}}',
      defaultMatch,
    );
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
      const apiRootKey = this.injectSettings(component.apis[prop])
        .split(':')[0]
        .split('.')[0];
      return this.translate(apiRootKey);
    }

    return prop;
  }

  pipes(pipe, params = [], input) {
    switch (pipe) {
      case 'date':
        if (params.length > 0) {
          return format(input, params.join(' '), { locale });
        } else {
          return format(input, 'DD MMM YYYY', { locale });
        }
      case 'time':
        if (params.length > 0) {
          return format(input, params.join(' '), { locale });
        } else {
          return format(input, 'HH:mm', { locale });
        }
      case 'datetime':
        if (params.length > 0) {
          return format(input, params.join(' '), { locale });
        } else {
          return format(input, 'DD MMM YYYY (HH:mm)', { locale });
        }
      case 'translate':
        return this.translate(input);
      case 'lower':
        return input.toLowerCase();
      case 'upper':
        return input.toUpperCase();
      case 'front':
        return params.join(' ') + input;
      case 'back':
        return input + params.join(' ');
      case 'count':
        if (params.length > 0) {
          if (params.length > 1) {
            return input.slice(parseInt(params[0]), parseInt(params[1])).length;
          }
          return input.slice(parseInt(params[0])).length;
        }
        return input.length;
      case 'slice':
        if (params.length > 0) {
          if (params.length > 1) {
            return input.slice(parseInt(params[0]), parseInt(params[1]));
          }
          return input.slice(parseInt(params[0]));
        }
        return input;
      case 'ifeq':
        if (params.length > 0 && input === params[0]) {
          return params.length > 1 ? params.slice(1).join(' ') : input;
        }
        return '';
      case 'ifcontains':
        if (params.length > 0 && ~input.indexOf(params[0])) {
          return params.length > 1 ? params.slice(1).join(' ') : input;
        }
        return '';
      case 'ifmatches':
        if (params.length > 0 && new RegExp(input).test(params[0])) {
          return params.length > 1 ? params.slice(1).join(' ') : input;
        }
        return '';
      case 'ifeqelse':
        if (params.length > 0) {
          if (input === params[0]) {
            return params.length > 1 ? params[1] : '';
          } else {
            return params.length > 2 ? params[2] : '';
          }
        }
        return '';
      case 'ifnoteq':
        if (params.length > 0 && input !== params[0]) {
          return params.length > 1 ? params.slice(1).join(' ') : input;
        }
        return '';
      default:
        return input;
    }
  }

  renderComponents(apiService, data = {}) {
    return this.components.map((component, i) => {
      const directTemplate = component.template.indexOf('<') === 0;
      let template = directTemplate
        ? 'CustomComponent'
        : component.template.split('-')[0];
      const props = Object.entries(component).reduce((acc, [key, val]) => {
        if (typeof val === 'string') {
          return Object.assign({}, acc, {
            [key]: this.injectSettings(
              val,
              null,
              key !== 'template' ? ':' : '',
            ),
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
          const pathParsed = this.injectSettings(path, '');
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

      if (directTemplate) {
        dataProps.template = injectValuesIntoString(
          dataProps.template,
          Object.assign({}, this.settings, dataProps),
          '',
          '{{',
          '}}',
          ':',
          this.pipes,
        );
      }

      let modularCSS = `
.${directTemplate ? template : component.template} {
  grid-area: ${component.id ||
    (directTemplate ? template : component.template)};
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
          <div
            className={`${component.id ||
              (directTemplate ? template : component.template)} component`}
          >
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
