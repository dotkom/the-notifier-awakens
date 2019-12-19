import React, { Component } from 'react';
import Style from 'style-it';

import * as Components from '../components';
import { get } from 'object-path';
import {
  injectValuesIntoString,
  pipes,
  pipeTransform,
  renderTemplate,
} from '../utils';
import { IfPropIsOnline } from './IfPropIsOnline';

/**
 * The component controller passes data into components and
 * updates them in a proper way.
 *
 * @param {array} componentsData List of component data.
 * @param {array} components List of components that should be rendered.
 */
export default class ComponentController extends Component {
  constructor(props) {
    super(props);
    this.pipes = Object.assign({}, pipes, {
      translate: (input, params) => {
        return this.translate(input);
      },
    });

    props.updateSettings({
      ...props.settings,
      group: props.match.params.group,
    });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.location.pathname !== this.props.location.pathname) {
      this.props.updateSettings({
        ...this.props.settings,
        group: nextProps.match.params.group,
      });
    }
  }

  changeGroup(group) {
    this.props.history.push(group);
  }

  translate(word) {
    if (word in this.props.translations) {
      return this.props.translations[word];
    }

    return word;
  }

  injectSettings(value, fallbackValue = null, defaultMatch = ':') {
    return injectValuesIntoString(
      value,
      {
        ...this.props.settings,
        groupGroup: this.props.settings.group.split('-')[0],
      },
      fallbackValue,
      '{{',
      '}}',
      defaultMatch,
    );
  }

  update(key, data) {}

  getComponents() {
    return this.props.components;
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

  render() {
    return (this.props.components || []).map((component, i) => {
      const directTemplate =
        !!~component.template.indexOf('<') ||
        !!~component.template.indexOf('{');
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
          if (apiPath in this.props.data) {
            const dataFromApi = this.props.data[apiPath];
            let dataToKey = pathInRequest
              ? get(dataFromApi, pathInRequest, '')
              : dataFromApi;
            if (key === pathInRequest && dataToKey === '') {
              dataToKey = dataFromApi;
            }
            return Object.assign({}, acc, {
              [key]: dataToKey,
            });
          }
          return acc;
        },
        props,
      );

      const { secrets = {}, componentSecrets = {} } = this.props.settings;
      const settings = {
        ...this.props.settings,
        secrets: {
          ...secrets,
          ...(template in componentSecrets && componentSecrets[template]),
        },
      };

      if (directTemplate) {
        dataProps.template = renderTemplate(
          dataProps.template,
          { ...settings, ...dataProps },
          {
            fallbackValue: '',
            pipeFunction: (pipe, params, input) =>
              pipeTransform(pipe, params, input, this.pipes),
          },
        );
      }

      const templateName = directTemplate ? template : component.template;

      let modularCSS = `
.${templateName} {
  grid-area: ${component.id || templateName};
  padding: ${component.padding || '32px'};
  overflow: ${component.overflow || 'hidden'};
  box-sizing: border-box;
}
.${templateName}:hover {
  /*overflow: auto;*/
}
`;
      if ('css' in dataProps) {
        modularCSS += dataProps.css;
      }

      let className = `Component ${templateName}`;
      if (component.id) {
        className += ` ${component.id}`;
      }

      const { dark = true } = this.props.groups[this.props.group];

      return (
        <Style key={i}>
          {modularCSS}
          <div className={className}>
            <Component
              {...this.props.groups[this.props.group]}
              dark={dark}
              translate={e => this.translate(e)}
              updateSettings={this.props.updateSettings}
              settings={settings}
              isPropOffline={prop =>
                this.isPropOffline(this.props.apiService, component, prop)
              }
              isPropOnline={prop =>
                this.isPropOnline(this.props.apiService, component, prop)
              }
              getPropFailCount={prop =>
                this.getPropFailCount(this.props.apiService, component, prop)
              }
              getApiName={prop => this.getApiName(component, prop)}
              IfPropIsOnline={IfPropIsOnline}
              group={this.props.group}
              groups={this.props.groups}
              changeGroup={group => this.changeGroup(group)}
              {...dataProps}
            />
          </div>
        </Style>
      );
    });
  }
}
