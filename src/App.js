import React, { Component } from 'react';
import Style from 'style-it';
import { get, set } from 'object-path';
import * as Sentry from '@sentry/browser';
import { Route, Redirect, Link } from 'react-router-dom';

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
import { DEBUG, DEFAULT_SETTINGS_URL } from './constants';
import { injectValuesIntoString, API, Storage } from './utils';
import { Settings, Icon } from './components';

if (process.env.REACT_APP_SENTRY) {
  Sentry.init({
    dsn: process.env.REACT_APP_SENTRY,
  });
}

class App extends Component {
  constructor(props) {
    super(props);
    this.storage = new Storage();
    if (this.storage.isEmpty()) {
      this.storage.set(
        '',
        {
          affiliations: defaultAffiliationSettings,
          apis: defaultApis,
          settings: defaultSettings,
          translations: defaultTranslations,
        },
        true,
      );
    }

    const { affiliation = '', css: globalCSS = '' } = this.storage.get(
      'settings',
    );

    this.updateData = this.updateData.bind(this);
    this.updateSettings = this.updateSettings.bind(this);

    this.state = this.updateState(affiliation, globalCSS);

    this.APIService = new APIService(
      this.storage.get('apis'),
      this.updateData,
      this.storage.get('settings'),
      this.state.components,
    );

    this.startAPIs();
    this.startCheckForUpdates();
  }

  componentWillMount() {
    this.setTitleFromUrl(this.props.location.pathname);
    this.unlisten = this.props.history.listen(state => {
      this.setTitleFromUrl(state.pathname);
    });
  }

  setTitleFromUrl(url) {
    if (!url || url === '/') {
      window.document.title = `Notiwall`;
    } else {
      const firstLetter = url.charAt(1).toUpperCase();
      window.document.title = `Notiwall - ${firstLetter + url.slice(2)}`;
    }
  }

  componentWillUnmount() {
    this.unlisten();
    if (this.checkForUpdatesInterval) {
      clearInterval(this.checkForUpdatesInterval);
    }
  }

  toggleAutoUpdate() {
    this.setState(({ autoUpdate }) => ({
      ...this.state,
      autoUpdate: !autoUpdate,
    }));
  }

  startCheckForUpdates() {
    if (DEFAULT_SETTINGS_URL) {
      this.checkForUpdates();
      this.checkForUpdatesInterval = setInterval(() => {
        this.checkForUpdates();
      }, 10000);
    }
  }

  checkForUpdates() {
    const validateAndFetchKey = (key, hash) => {
      if (hash && this.storage.get(`hash.${key}`) !== hash) {
        this.storage.set(`hash.${key}`, hash);
        API.getRequest(
          `${DEFAULT_SETTINGS_URL}/${key}.json`,
          { cors: true },
          data => {
            this.storage.set(key, data, true);
            this.setState(
              state =>
                this.updateState(state.affiliation, state.globalCSS, {
                  ...state,
                  [key]: data,
                }),
              () => {
                this.APIService.updateSettings({
                  apis: this.storage.get('apis'),
                  settings: this.state.settings,
                  components: this.state.components,
                });
              },
            );
          },
        );
      }
    };
    API.getRequest(
      `${DEFAULT_SETTINGS_URL}/hash.json`,
      { cors: true },
      ({ affiliations = '', apis = '', translations = '', settings = '' }) => {
        validateAndFetchKey('affiliations', affiliations);
        validateAndFetchKey('apis', apis);
        validateAndFetchKey('translations', translations);
        validateAndFetchKey('settings', settings);
        this.storage.save();
      },
    );
  }

  updateState(affiliation, globalCSS = '', prevState = {}) {
    const affiliations = this.storage.get('affiliations');
    const {
      components = [],
      layouts,
      style = affiliation,
      css = '',
      color = this.storage.get('settings.color'),
    } = affiliations[affiliation];

    const autofilledComponents = this.autofillComponents(
      components,
      affiliation,
    );

    return {
      data: {},
      affiliation,
      affiliations,
      components: autofilledComponents,
      layouts,
      style,
      globalCSS,
      css,
      color,
      settings: this.storage.get('settings'),
      translations: this.storage.get('translations'),
      settingsOpen:
        'settingsOpen' in prevState ? prevState.settingsOpen : false,
    };
  }

  updateData(key, data, useCache = false, scrape = []) {
    const newData = { ...this.state.data, [key]: data };
    this.setState({ ...this.state, data: newData });

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
            const newData = { ...this.state.data, [key]: data };
            this.setState({ ...this.state, data: newData });
          },
          useCache,
        );
      }
    }
  }

  updateSettings(settings) {
    const newState = this.updateState(
      settings.affiliation,
      settings.css,
      this.state,
    );
    this.APIService.updateSettings({
      apis: this.storage.get('apis'),
      settings,
      components: newState.components,
    });
    this.setState({ ...this.state, ...newState, settings });
  }

  closeSettings() {
    this.setState({ ...this.state, settingsOpen: false });
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
      } else if (typeof component === 'object') {
        const type = component.template.split('-')[0];
        const typeToLower = type.toLowerCase();
        return {
          ...component,
          apis: {
            [typeToLower]: `${affiliation}${type}:${typeToLower}`,
            ...component.apis,
          },
        };
      }

      throw new Error(`Cannot create element from a ${typeof component}`);
    });
  }

  translate(word) {
    if (word in this.state.translations) {
      return this.state.translations[word];
    }

    return word;
  }

  startAPIs(time = 0) {
    this.APIService.start(time);
  }
  stopAPIs() {
    return this.APIService.stop();
  }
  updateAPIs() {
    this.APIService.update();
  }

  restartAPIs(time = 0) {
    this.stopAPIs();
    this.startAPIs(time);
  }

  /**
   * Get a CSS grid-template value from layout array.
   * 
   * Examples:
```javascript
getGridTemplateFromLayoutArray(['a b', 'a b']) => '"a b" "a b" / 1fr 1fr'
getGridTemplateFromLayoutArray(['a a', '. b b ']) => '"a a ." ". b b" / 1fr 1fr 1fr'
getGridTemplateFromLayoutArray(['a ', 'a b  b']) => '"a . ." "a b b" / 1fr 1fr 1fr'
getGridTemplateFromLayoutArray(['a / auto', 'a b  b / 2 ']) => '"a . ." auto "a b b" 2fr / 1fr 1fr 1fr'
```
   * See ./App.test.js for more examples.
   * 
   * @param {array} layout Array with placed components.
   * 
   * @returns {string} A string for grid-template.
   */
  getGridTemplateFromLayoutArray(layout) {
    if (typeof layout === 'string') {
      return layout.replace(/[\n\r]/g, ' ');
    }

    const rows = layout
      .filter(row => row.indexOf('/') !== 0)
      .map(row => {
        const [componentPart, sizePart = ''] = row
          .replace(/ +/g, ' ')
          .split('/');
        const trimmedRow = componentPart.trim();
        const trimmedSize = sizePart.trim();
        const sizing = trimmedSize
          ? /^[0-9]+$/.test(trimmedSize)
            ? `${trimmedSize}fr`
            : trimmedSize
          : '';
        return {
          colCount: trimmedRow.split(' ').length,
          components: trimmedRow,
          sizing,
        };
      });
    let maxCols = Math.max(...rows.map(row => row.colCount));
    let generatedRows = rows.map(row => {
      if (/^[. ]*$/.test(row.components)) {
        const sizing = row.sizing ? ` ${row.sizing}` : ' 1fr';
        return {
          components: '. '.repeat(maxCols).slice(0, -1),
          sizing,
        };
      } else {
        const spacesNotUsed = (maxCols - (row.colCount % maxCols)) % maxCols;
        const sizing = row.sizing ? ` ${row.sizing}` : '';
        return {
          components: row.components + ' .'.repeat(spacesNotUsed),
          sizing,
        };
      }
    });
    const colSizingPart = layout.find(row => row.indexOf('/') === 0);
    let cols;
    if (colSizingPart) {
      const trimmedCol = colSizingPart
        .replace(/^\//, '')
        .replace(/ +/g, ' ')
        .replace(/\./g, '1fr')
        .trim();
      if (~trimmedCol.indexOf('|')) {
        let currentCount = 0;
        const splits = trimmedCol
          .split(/\|[^ ]*/)
          .map(split => {
            const trimmedSplit = split.trim();
            const count =
              trimmedSplit === '' ? 0 : trimmedSplit.split(' ').length;
            currentCount += count;
            return currentCount;
          })
          .slice(0, -1);
        maxCols += splits.length;
        generatedRows = generatedRows.map(({ components, sizing }) => {
          const newComponents = components
            .split(' ')
            .reduce(
              (acc, component, i) => {
                const inject = splits.includes(i)
                  ? [acc.prev !== component ? '.' : component, component]
                  : [component];
                return {
                  prev: component,
                  components: acc.components.concat(inject),
                };
              },
              {
                prev: '',
                components: [],
              },
            )
            .components.concat(Array(splits.length).fill('.'))
            .slice(0, maxCols)
            .join(' ');
          return {
            components: newComponents,
            sizing,
          };
        });
      }
      const colCount = trimmedCol === '' ? 0 : trimmedCol.split(' ').length;
      cols = (
        trimmedCol.replace(/\|( |$)/g, '1fr$1').replace(/\|([^ ]*)/, '$1') +
        ' 1fr'.repeat(Math.max(0, maxCols - colCount))
      ).trim();
    } else {
      cols = ' 1fr'.repeat(maxCols).slice(1);
    }
    const wrappedInQuotes = generatedRows.map(row => {
      return `"${row.components}"${row.sizing}`;
    });
    return `${wrappedInQuotes.join(' ')} / ${cols}`;
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

.Components {
  transition: filter .2s;
  ${this.state.settingsOpen ? `filter: blur(5px) brightness(.5);` : ''}
}

${this.state.globalCSS}

${this.state.css}`;

    return (
      <Style>
        {globalCSS}
        <div className="App">
          <Route
            path="/:affiliation(.*)"
            render={props => {
              if (
                !(props.match.params.affiliation in this.state.affiliations)
              ) {
                return <Redirect to="/" />;
              }
              return (
                <>
                  {props.match.params.affiliation !== '' ? (
                    <div className="menu-bar">
                      <div
                        className="open-settings"
                        onClick={() =>
                          this.setState({ ...this.state, settingsOpen: true })
                        }
                        title={this.translate('settings')}
                      >
                        <Icon name="MdSettings" />
                      </div>
                      <div
                        className={`auto-update${
                          this.state.autoUpdate ? ' checked' : ''
                        }`}
                        onClick={() => this.toggleAutoUpdate()}
                        title={this.translate('autoUpdateCheck')}
                      >
                        <span className="extra-small">
                          {this.translate('autoUpdate')}
                        </span>
                      </div>
                      <div
                        className="sync"
                        onClick={() => this.restartAPIs()}
                        title={this.translate('sync')}
                      >
                        <Icon name="GoSync" />
                      </div>
                      <div className="space" />
                      <Link
                        to="/"
                        className="go-home"
                        title={this.translate('routeHome')}
                      >
                        <Icon name="IosArrowBack" />{' '}
                        <span className="extra-small">
                          {this.translate('home')}
                        </span>
                      </Link>
                    </div>
                  ) : null}
                  {this.state.settingsOpen ? (
                    <Style>
                      {`.Settings {
  ${this.state.settingsOpen ? '' : 'display: none;'}
  position: absolute;
  z-index: 999;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.7);
}`}
                      <div className="Settings">
                        <Settings
                          translate={e => this.translate(e)}
                          updateSettings={this.updateSettings}
                          closeSettings={() => this.closeSettings()}
                          settings={this.state.settings}
                          affiliation={props.match.params.affiliation}
                          changeAffiliation={affiliation =>
                            props.history.push(affiliation)
                          }
                        />
                      </div>
                    </Style>
                  ) : null}
                  <div className="Components">
                    <ComponentController
                      {...props}
                      components={this.state.components}
                      translations={this.state.translations}
                      settings={this.state.settings}
                      affiliation={props.match.params.affiliation}
                      affiliations={this.state.affiliations}
                      updateSettings={this.updateSettings}
                      apiService={this.APIService}
                      data={data}
                    />
                  </div>
                </>
              );
            }}
          />
        </div>
      </Style>
    );
  }
}

export default App;
