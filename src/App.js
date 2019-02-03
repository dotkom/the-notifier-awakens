import React, { Component } from 'react';
import Style from 'style-it';
import { get, set } from 'object-path';
import * as Sentry from '@sentry/browser';

import './App.css';

import { APIService } from './services';
import { ComponentController } from './controllers';
import {
  defaultApis,
  defaultAffiliationSettings,
  defaultSettings,
  defaultTranslations,
  styles,
} from './defaults';
import { DEBUG } from './constants';
import { injectValuesIntoString } from './utils';

if (process.env.REACT_APP_SENTRY) {
  Sentry.init({
    dsn: process.env.REACT_APP_SENTRY,
  });
}

class App extends Component {
  constructor() {
    super();
    const { affiliation = 'debug', css: globalCSS = '' } = defaultSettings;
    const {
      components = [],
      layouts,
      style = affiliation,
      css = '',
      color = defaultSettings.color || '',
    } = defaultAffiliationSettings[affiliation];

    const autofilledComponents = this.autofillComponents(
      components,
      affiliation,
    );

    this.updateData = this.updateData.bind(this);

    this.APIService = new APIService(
      defaultApis,
      this.updateData,
      defaultSettings,
      autofilledComponents,
    );
    this.ComponentController = new ComponentController(
      autofilledComponents,
      defaultSettings,
      defaultTranslations,
    );

    this.state = {
      data: {},
      components: autofilledComponents,
      layouts,
      style,
      globalCSS,
      css,
      color,
      settings: defaultSettings,
    };

    this.startAPIs();
  }

  updateData(key, data, useCache = false, scrape = []) {
    this.ComponentController.update(key, data);
    const newData = Object.assign({}, this.state.data, {
      [key]: data,
    });
    this.setState(
      Object.assign({}, this.state, {
        data: newData,
      }),
    );

    if (scrape.length) {
      for (const path of scrape) {
        this.APIService.scrape(
          path,
          data,
          (scrapeData, selector, innerValue) => {
            const oldValue = get(data, selector);
            const newValue = injectValuesIntoString(
              oldValue,
              {
                [innerValue]: scrapeData,
              },
              '',
              '[[',
              ']]',
              null,
            );
            set(data, selector, newValue);
            const newData = Object.assign({}, this.state.data, {
              [key]: data,
            });
            this.setState(
              Object.assign({}, this.state, {
                data: newData,
              }),
            );
          },
          useCache,
        );
      }
    }
  }

  updateSettings(settings) {
    this.APIService.updateSettings(settings);
    this.ComponentController.updateSettings(settings);
    this.setState(
      Object.assign({}, this.state, {
        settings,
      }),
    );
  }

  autofillComponents(components, affiliation) {
    return components.map(component => {
      if (typeof component === 'string') {
        const type = component.split('-')[0];
        const typeToLower = type.toLowerCase();
        return {
          template: component,
          apis: {
            [typeToLower]: `${affiliation}${type}:${typeToLower}`,
          },
        };
      }
      return component;
    });
  }

  startAPIs() {
    this.APIService.start();
  }
  stopAPIs() {
    this.APIService.stop();
  }
  updateAPIs() {
    this.APIService.update();
  }

  /**
   * Get a CSS grid-template value from layout array.
   * 
   * Examples:
```javascript
getGridTemplateFromLayoutArray(['a b', 'a b']) => '"a b" "a b" / 1fr 1fr'
getGridTemplateFromLayoutArray(['a a', '. b b']) => '"a a ." ". b b" / 1fr 1fr 1fr'
getGridTemplateFromLayoutArray(['a', 'a b b']) => '"a . ." "a b b" / 1fr 1fr 1fr'
```
   * 
   * @param {array} layout Array with placed components.
   * 
   * @returns {string} A string for grid-template.
   */
  getGridTemplateFromLayoutArray(layout) {
    const cols = layout.reduce(
      (acc, row) => Math.max(acc, row.split(' ').length),
      0,
    );
    const wrappedInQuotes = layout
      .map(
        e =>
          `"${e + ' .'.repeat((cols - (e.split(' ').length % cols)) % cols)}"` +
          (/^[. ]+$/.test(e) ? ' 1fr' : ''),
      )
      .join(' ');

    return `${wrappedInQuotes} /${' 1fr'.repeat(cols)}`;
  }

  /**
   * Make it possible to input a list of components and get
   * a grid-template which wraps to correct size.
   * 
   * Examples:
```javascript
const components = [
  { template: 'Bus' },
  { template: 'Clock' },
  { template: 'Office' },
]

generateDefaultGridTemplateFromComponents(components, 1) => ['Bus', 'Clock', 'Office']
generateDefaultGridTemplateFromComponents(components, 2) => ['Bus Clock', 'Office .']
generateDefaultGridTemplateFromComponents(components, 3) => ['Bus Clock Office']
```
   * @param {array} components List of components in view.
   * @param {number} width When to wrap.
   * 
   * @returns {array} A grid-template value.
   */
  generateDefaultGridTemplateFromComponents(components, width = 1) {
    let gridTemplate = [];
    const count = components.length;
    let lastIndex = -1;
    for (let i = 0; i < count; i += width) {
      gridTemplate.push(
        components
          .slice(i, i + width)
          .map(component => `${component.id || component.template}`)
          .join(' '),
      );
      lastIndex++;
    }
    gridTemplate[lastIndex] += ' .'.repeat((width - (count % width)) % width);

    return gridTemplate;
  }

  /**
   * Generate layout CSS from a layout object.
   * 
   * Examples:
```javascript
layouts = {
  0: ['Clock', 'Clock2', 'Office', 'Bus'],
  400: ['Clock Clock2 Office Office', 'Bus Bus'],
  800: ['Office Clock Clock2', 'Bus Bus Bus'],
}

generateLayoutCSS(layouts) => `
.Components {
  grid-template: "Clock" "Clock2" "Office" "Bus" / 1fr;
}
@media (min-width: 400px) {
  .Components {
    grid-template:"Clock Clock2 Office Office" "Bus Bus . ." / 1fr 1fr 1fr 1fr;
  }
}
@media (min-width: 800px) {
  .Components {
    grid-template:"Office Clock Clock2" "Bus Bus Bus" / 1fr 1fr 1fr;
  }
}
`
```
   * @param {{[size]: string[]|string[][]}} layouts Description of grid layout
   * @param {string} [containerClass=Components] Which class to create layout for
   * 
   * @returns {string} CSS generated for containerClass
   */
  generateLayoutCSS(layouts, containerClass = 'Components') {
    if (typeof layouts === 'undefined') {
      return `
.${containerClass} {
  grid-template-columns: repeat(auto-fill, minmax(420px, 1fr));
}

.${containerClass} > div {
  grid-area: unset;
}
`;
    }
    if (Array.isArray(layouts)) {
      return layouts.reduce((acc, grid, index) => {
        let size = 0;
        switch (index) {
          case 0:
            size = 0;
            break;
          case 1:
            size = 720;
            break;
          case 2:
            size = 1400;
            break;
          default:
            size = 1400 + 360 * Math.max(0, index - 2);
            break;
        }
        if (size === 0) {
          return `${acc}
.${containerClass} {
  grid-template: ${this.getGridTemplateFromLayoutArray(grid)};
}`;
        }

        return `${acc}
@media (min-width: ${size}px) {
  .${containerClass} {
    grid-template:${this.getGridTemplateFromLayoutArray(grid)};
  }
}`;
      }, '');
    }
    return Object.entries(layouts).reduce((acc, [size, grid]) => {
      if (size === '0') {
        return `${acc}
.${containerClass} {
  grid-template: ${this.getGridTemplateFromLayoutArray(grid)};
}`;
      }

      return `${acc}
@media (min-width: ${size}px) {
  .${containerClass} {
    grid-template:${this.getGridTemplateFromLayoutArray(grid)};
  }
}`;
    }, '');
  }

  render() {
    const { data, layouts, color } = this.state;
    const componentsRendered = this.ComponentController.renderComponents(
      this.APIService,
      data,
    );

    let globalCSS = `
${this.generateLayoutCSS(layouts)}
`;
    if (this.state.settings.style in styles) {
      globalCSS += styles[this.state.settings.style];
    } else {
      if (this.state.style in styles) {
        globalCSS += styles[this.state.style];
      } else {
        if (this.state.settings.affiliation in styles) {
          globalCSS += styles[this.state.settings.affiliation];
        }
      }
    }

    globalCSS += `
.App {
  ${color ? `background-color: ${color};` : ''}
}

.Component {
  ${DEBUG ? 'border: 1px solid rgba(255, 0, 0, .5);' : ''}
}

${this.state.globalCSS}

${this.state.css}`;

    return (
      <Style>
        {globalCSS}
        <div className="App">
          <div className="Components">{componentsRendered}</div>
        </div>
      </Style>
    );
  }
}

export default App;
