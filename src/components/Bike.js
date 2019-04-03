import React, { Component } from 'react';
import { Icon } from './';
import './Bike.css';

export default class Bike extends Component {
  render() {
    const { bikes = null, docks = null } = this.props;
    return (
      <>
        <div>
          <Icon className="icon" name="Bicycle" style={{ fontSize: '200%' }} />
          {bikes}
        </div>
        <div>
          <Icon
            className="icon"
            name="MdLockOpen"
            style={{ fontSize: '200%' }}
          />
          {docks}
        </div>
      </>
    );
  }
}
