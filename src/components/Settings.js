import React, { Component } from 'react';
import './Settings.css';

import { defaultAffiliationSettings } from '../defaults/affiliations';

export default class Settings extends Component {
  constructor(props) {
    super(props);
    this.updateSettings = this.updateSettings.bind(this);
    this.affiliations = defaultAffiliationSettings;
  }

  updateSettings(key, value) {
    const settings = { ...this.props.settings, [key]: value };
    this.props.updateSettings(settings);
  }

  chooseAffiliation(affiliation) {
    if (affiliation in this.affiliations) {
      this.props.changeAffiliation(affiliation);
    }
  }

  render() {
    const { affiliation = '' } = this.props.settings;

    const affiliationInput = (
      <div className="input-group">
        <label>
          <h2>{this.props.translate('affiliation')}</h2>
        </label>
        <select
          value={affiliation}
          onChange={e => this.chooseAffiliation(e.target.value)}
        >
          <option value="">
            {this.props.translate(this.affiliations[''].name)}
          </option>
          {Object.entries(this.affiliations || {})
            .filter(([key]) => key && key !== 'debug')
            .sort(([, a], [, b]) => a.name.localeCompare(b.name))
            .map(([key, { name = '' }], i) => (
              <option value={key} key={i}>
                {this.props.translate(name || key)}
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
          <h2>{this.props.translate('chooseVisibility')}</h2>
          <iframe src="/" width="100%" height="100%" title="Mini display" />
        </div>
      </>
    );
  }
}
