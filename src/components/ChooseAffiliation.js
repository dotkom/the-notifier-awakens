import React, { Component } from 'react';
import { defaultAffiliationSettings } from '../defaults/affiliations';
import './ChooseAffiliation.css';

export default class ChooseAffiliation extends Component {
  constructor(props) {
    super(props);
    this.updateSettings = this.updateSettings.bind(this);
    this.affiliations = defaultAffiliationSettings;
    this.state = {
      searchFilter: '',
    };
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

  filterSearch(searchFilter) {
    this.setState({ ...this.state, searchFilter });
  }

  render() {
    const affiliations = Object.entries(this.affiliations)
      .filter(
        ([key, { name }]) =>
          key &&
          key !== 'debug' &&
          new RegExp(`(^| )${this.state.searchFilter.toLowerCase()}`).test(
            name.toLowerCase(),
          ),
      )
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
        <div className="form-group">
          <input
            placeholder="Søk i linjeforeninger..."
            type="text"
            onChange={e => this.filterSearch(e.target.value)}
          />
        </div>
        <div className="affiliation-list">{affiliations}</div>
      </>
    );
  }
}
