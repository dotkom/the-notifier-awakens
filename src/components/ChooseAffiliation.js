import React, { Component } from 'react';
import { defaultAffiliationSettings } from '../defaults/affiliations';
import './ChooseAffiliation.css';

export default class ChooseAffiliation extends Component {
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
    const affiliations = Object.entries(this.affiliations)
      .filter(([key]) => key && key !== 'debug')
      .sort(([, a], [, b]) => a.name.localeCompare(b.name))
      .sort(([, a], [, b]) => !a.components.length - !b.components.length)
      .map(([key, { name = '', components = [] }], i) => (
        <div
          key={i}
          className={`item${components.length ? '' : ' no-components'}`}
          onClick={() => this.chooseAffiliation(key)}
        >
          {name || key}
          {components.length ? ` (${components.length})` : ''}
        </div>
      ));

    return (
      <>
        <h1>Velg linjeforening</h1>
        <div className="affiliation-list">{affiliations}</div>
      </>
    );
  }
}
