import React, { Component } from 'react';
import './Settings.css';

import { defaultAffiliationSettings } from '../defaults/affiliations';

export default class Settings extends Component {
  constructor(props) {
    super(props);
    this.updateSettings = this.updateSettings.bind(this);
    this.affiliations = defaultAffiliationSettings;
    this.state = {
      affiliation: props.affiliation,
    };
  }

  updateSettings(key, value) {
    const settings = { ...this.props.settings, [key]: value };
    this.props.updateSettings(settings);
  }

  chooseAffiliation(affiliation) {
    if (affiliation in this.affiliations) {
      this.props.changeAffiliation(affiliation);
      this.props.closeSettings();
    }
  }

  selectAffiliation(affiliation) {
    if (affiliation in this.affiliations) {
      this.setState({ ...this.state, affiliation });
    }
  }

  render() {
    const { affiliation = '' } = this.state;

    const affiliationInput = (
      <div className="input-group">
        <label>
          <h2>{this.props.translate('affiliation')}</h2>
        </label>
        <select
          value={affiliation}
          onChange={e => this.selectAffiliation(e.target.value)}
        >
          <option value="">
            {this.props.translate(this.affiliations[''].name)}
          </option>
          {Object.entries(this.affiliations || {})
            .filter(([key]) => key && key !== 'debug')
            .sort(([, a], [, b]) => a.name.localeCompare(b.name))
            .map(([key, { name = '', components = [] }], i) => (
              <option value={key} key={i}>
                {this.props.translate(name || key)} ({components.length})
              </option>
            ))}
        </select>
      </div>
    );

    return (
      <>
        <h1>Alternativer</h1>
        {this.props.closeSettings && (
          <button onClick={() => this.props.closeSettings()}>Close</button>
        )}
        <div className="section">
          {affiliationInput}
          <button
            onClick={() => this.chooseAffiliation(this.state.affiliation)}
          >
            Lagre
          </button>
          <h2>{this.props.translate('chooseVisibility')}</h2>
          <div className="iframe-wrapper">
            <iframe src={`/${this.state.affiliation}`} title="Mini display" />
          </div>
        </div>
      </>
    );
  }
}
