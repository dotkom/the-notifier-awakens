import React, { Component } from 'react';
import './Settings.css';

import { defaultGroupSettings } from '../defaults/groups';

export default class Settings extends Component {
  constructor(props) {
    super(props);
    this.updateSettings = this.updateSettings.bind(this);
    this.groups = defaultGroupSettings;
    this.state = {
      group: props.group,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.group === '' && nextProps.group) {
      this.setState({ ...this.state, group: nextProps.group });
    }
  }

  updateSettings(key, value) {
    const settings = { ...this.props.settings, [key]: value };
    this.props.updateSettings(settings);
  }

  chooseGroup(group) {
    if (group in this.groups) {
      this.props.changeGroup(group);
      this.props.closeSettings();
    }
  }

  selectGroup(group) {
    if (group in this.groups) {
      this.setState({ ...this.state, group });
    }
  }

  render() {
    const { group = '' } = this.state;

    const groupInput = (
      <div className="input-group">
        <label>
          <h2>{this.props.translate('group')}</h2>
        </label>
        <select value={group} onChange={e => this.selectGroup(e.target.value)}>
          <option value="">{this.props.translate(this.groups[''].name)}</option>
          {Object.entries(this.groups || {})
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
          {groupInput}
          <button onClick={() => this.chooseGroup(this.state.group)}>
            Lagre
          </button>
          <h2>{this.props.translate('chooseVisibility')}</h2>
          <div className="iframe-wrapper">
            <iframe src={`/${this.state.group}`} title="Mini display" />
          </div>
        </div>
      </>
    );
  }
}
