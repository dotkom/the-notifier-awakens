import React, { Component } from 'react';
import { defaultGroupSettings } from '../defaults/groups';
import './ChooseGroup.css';
import { Link } from 'react-router-dom';
import { Icon } from './';

export default class ChooseGroup extends Component {
  constructor(props) {
    super(props);
    this.updateSettings = this.updateSettings.bind(this);
    this.groups = defaultGroupSettings;
    this.state = {
      searchFilter: '',
      isCreateGroupOpen: false,
      addGroupName: '',
      addGroupId: '',
      addGroupIdDirty: false,
      formIsValid: false,
      formIsEmpty: true,
    };
    this.searchField = null;
  }

  updateSettings(key, value) {
    const settings = { ...this.props.settings, [key]: value };
    this.props.updateSettings(settings);
  }

  chooseGroup(group) {
    if (group in this.groups) {
      this.props.changeGroup(group);
    }
  }

  filterSearch(searchFilter) {
    this.setState({ ...this.state, searchFilter });
  }

  toggleCreateGroup() {
    if (this.state.isCreateGroupOpen) {
      this.setState(state => ({
        ...state,
        searchFilter: this.searchField.value,
        isCreateGroupOpen: false,
      }));
    } else {
      const addGroupName = this.state.addGroupName || this.state.searchFilter;
      const addGroupId =
        this.state.addGroupId || this.transformToSlug(addGroupName);
      this.setState(state => ({
        ...state,
        formIsEmpty: this.checkIfFormIsEmpty(addGroupName, addGroupId),
        formIsValid: this.checkIfFormIsValid(addGroupName, addGroupId),
        searchFilter: state.addGroupName,
        addGroupName,
        addGroupId,
        isCreateGroupOpen: true,
      }));
    }
  }

  changeAddGroupName(value) {
    const addGroupName = value;
    if (!this.state.addGroupIdDirty) {
      const addGroupId = this.transformToSlug(value);
      this.setState({
        ...this.state,
        formIsEmpty: this.checkIfFormIsEmpty(addGroupName, addGroupId),
        formIsValid: this.checkIfFormIsValid(addGroupName, addGroupId),
        addGroupName,
        searchFilter: addGroupName,
        addGroupId,
      });
    } else {
      this.setState({
        ...this.state,
        formIsEmpty: this.checkIfFormIsEmpty(
          addGroupName,
          this.state.addGroupId,
        ),
        formIsValid: this.checkIfFormIsValid(
          addGroupName,
          this.state.addGroupId,
        ),
        addGroupName,
        searchFilter: addGroupName,
      });
    }
  }

  changeAddGroupId(value) {
    const addGroupId = this.transformToSlug(value);
    this.setState({
      ...this.state,
      formIsEmpty: this.checkIfFormIsEmpty(this.state.addGroupName, addGroupId),
      formIsValid: this.checkIfFormIsValid(this.state.addGroupName, addGroupId),
      addGroupId,
      addGroupIdDirty: !!value,
    });
  }

  transformToSlug(value) {
    return value
      .toLowerCase()
      .replace(/[^0-9a-zæøå]+/g, '-')
      .replace(/å/g, 'a')
      .replace(/æ/g, 'ae')
      .replace(/ø/g, 'o')
      .replace(/^-|-$/g, '');
  }

  setCreateGroupForm(addGroupName, addGroupId) {
    document.documentElement.scrollTop = 0;

    this.setState({
      ...this.state,
      formIsEmpty: this.checkIfFormIsEmpty(addGroupName, addGroupId),
      formIsValid: this.checkIfFormIsValid(addGroupName, addGroupId),
      addGroupName,
      searchFilter: addGroupName,
      addGroupId,
      addGroupIdDirty: true,
      isCreateGroupOpen: true,
    });
  }

  emptyForm() {
    this.setState({
      ...this.state,
      formIsEmpty: true,
      formIsValid: false,
      addGroupName: '',
      addGroupId: '',
      searchFilter: '',
      addGroupIdDirty: false,
    });
  }

  checkIfNameIsTaken(name) {
    if (name) {
      const lowerName = name.toLowerCase();
      return Object.values(this.groups).some(
        ({ name = '' }) => name.toLowerCase() === lowerName,
      );
    }
    return false;
  }

  checkIfIdIsTaken(id) {
    return id && id in this.groups;
  }

  checkIfFormIsValid(name, id) {
    // return !this.checkIfNameIsTaken(name) && !this.checkIfIdIsTaken(id);
    return !this.checkIfIdIsTaken(id);
  }

  checkIfFormIsEmpty(name, id) {
    return !name && !id;
  }

  render() {
    const groups = Object.entries(this.groups)
      .filter(
        ([key, { name }]) =>
          key &&
          key !== 'debug' &&
          new RegExp(`(^| )${this.state.searchFilter.toLowerCase()}`).test(
            name.toLowerCase(),
          ),
      )
      .sort(([, a], [, b]) => a.name.localeCompare(b.name));

    const chooseTranslation = this.props.translate('choose');
    const groupsAvailable = groups
      .filter(([, { components = [] }]) => components.length)
      .map(([key, { name = '' }], i) => (
        <Link
          to={'/' + key}
          key={i}
          className="item"
          title={`${chooseTranslation} ${name || key}`}
        >
          {name || key}
        </Link>
      ));

    const changeTranslation = this.props.translate('change');
    const groupsUnavailable = groups
      .filter(([, { components = [] }]) => !components.length)
      .map(([key, { name = '' }], i) => (
        <Link
          to={'/' + key}
          key={i}
          className="item no-components"
          title={`${changeTranslation} ${name || key}`}
        >
          + {name || key}
        </Link>
      ));

    return (
      <>
        <h1>{this.props.translate('chooseGroup')}</h1>
        <div className="form-group">
          <input
            placeholder={this.props.translate('searchGroupPlaceholder')}
            type="text"
            ref={element => (this.searchField = element)}
            onChange={e => this.filterSearch(e.target.value)}
          />
        </div>
        <div className="form-group">
          <div
            className="toggle-create-group"
            onClick={() => this.toggleCreateGroup()}
          >
            {this.state.isCreateGroupOpen ? '-' : '+'}{' '}
            {this.props.translate('addGroup')}
          </div>
          {this.state.isCreateGroupOpen ? (
            <div className="create-group">
              <p
                className="small darken"
                dangerouslySetInnerHTML={{
                  __html: this.props.translate('addGroupInfo'),
                }}
              />
              <div className="form-group">
                <label htmlFor="group-name">
                  {this.props.translate('name')}
                </label>
                <input
                  id="group-name"
                  value={this.state.addGroupName}
                  onChange={e => this.changeAddGroupName(e.target.value)}
                  type="text"
                  placeholder={this.props.translate('groupNameExample')}
                />
              </div>
              <div className="form-group">
                <label htmlFor="group-name">
                  {this.props.translate('urlPath')}
                </label>
                <input
                  id="group-id"
                  value={this.state.addGroupId}
                  onChange={e => this.changeAddGroupId(e.target.value)}
                  type="text"
                  placeholder={
                    this.transformToSlug(this.state.addGroupName) ||
                    this.props.translate('groupIdExample')
                  }
                />
                <div className="small center grow">
                  <span className="darken">{window.location.origin}/</span>
                  <span className="glow">
                    {this.state.addGroupId ||
                      this.transformToSlug(this.state.addGroupName) ||
                      '{URL}'}
                  </span>
                </div>
              </div>
              <div className="form-group">
                {!this.state.formIsEmpty ? (
                  <button onClick={() => this.emptyForm()} tabIndex={-1}>
                    {this.props.translate('resetForm')} <Icon name="Trash" />
                  </button>
                ) : null}
                <div className="space" />
                {!this.state.formIsEmpty && this.state.formIsValid ? (
                  <button
                    disabled={this.state.formIsEmpty || !this.state.formIsValid}
                  >
                    {this.props.translate('create')} "{this.state.addGroupName}"{' '}
                    <Icon name="IosArrowForward" />
                  </button>
                ) : null}

                {!this.state.formIsEmpty && !this.state.formIsValid ? (
                  <button
                    disabled={this.state.formIsEmpty || this.state.formIsValid}
                  >
                    {this.props.translate('change')} "{this.state.addGroupName}"{' '}
                    <Icon name="IosArrowForward" />
                  </button>
                ) : null}
              </div>
              <p
                warning={
                  this.checkIfIdIsTaken(this.state.addGroupId)
                    ? this.props.translate('idTakenError')
                    : ''
                }
              >
                <Icon name="MdInfoOutline" />
              </p>
            </div>
          ) : null}
        </div>
        <div className="group-list">{groupsAvailable}</div>
        <h2>{this.props.translate('unavailableComponents')}</h2>
        <p className="small darken">
          ({this.props.translate('unavailableComponentsSubComment')}.)
        </p>
        <div className="group-list">{groupsUnavailable}</div>
      </>
    );
  }
}
