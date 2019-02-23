import React, { Component } from 'react';
import { defaultAffiliationSettings } from '../defaults/affiliations';
import './ChooseAffiliation.css';
import { Link } from 'react-router-dom';

export default class ChooseAffiliation extends Component {
  constructor(props) {
    super(props);
    this.updateSettings = this.updateSettings.bind(this);
    this.affiliations = defaultAffiliationSettings;
    this.state = {
      searchFilter: '',
      isCreateAffiliationOpen: false,
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

  toggleCreateAffiliation() {
    this.setState({
      ...this.state,
      isCreateAffiliationOpen: !this.state.isCreateAffiliationOpen,
    });
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
      .sort(([, a], [, b]) => a.name.localeCompare(b.name));

    const affiliationsAvailable = affiliations
      .filter(([, { components = [] }]) => components.length)
      .map(([key, { name = '' }], i) => (
        <Link to={'/' + key} key={i} className="item">
          {name || key}
        </Link>
      ));

    const affiliationsUnavailable = affiliations
      .filter(([, { components = [] }]) => !components.length)
      .map(([key, { name = '' }], i) => (
        <div key={i} className="item no-components">
          + {name || key}
        </div>
      ));

    return (
      <>
        <h1>{this.props.translate('chooseAffiliation')}</h1>
        <div className="form-group">
          <input
            placeholder={this.props.translate('searchAffiliationPlaceholder')}
            type="text"
            onChange={e => this.filterSearch(e.target.value)}
          />
        </div>
        <div className="form-group">
          <div
            className="toggle-create-affiliation"
            onClick={() => this.toggleCreateAffiliation()}
          >
            {this.state.isCreateAffiliationOpen ? '-' : '+'}{' '}
            {this.props.translate('addAffiliation')}
          </div>
          {this.state.isCreateAffiliationOpen ? (
            <div className="create-affiliation">
              <p
                className="small"
                dangerouslySetInnerHTML={{
                  __html: this.props.translate('addAffiliationInfo'),
                }}
              />
            </div>
          ) : null}
        </div>
        <div className="affiliation-list">{affiliationsAvailable}</div>
        <h3>Mangler komponenter</h3>
        <div className="affiliation-list">{affiliationsUnavailable}</div>
      </>
    );
  }
}
