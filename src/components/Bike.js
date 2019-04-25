import React, { Component } from 'react';
import { Icon } from './';
import './Bike.css';

export default class Bike extends Component {
  render() {
    const {
      /*bikes = null, docks = null, */ stations = [],
      names = [],
    } = this.props;
    return (
      <>
        {stations.map((station, i) => (
          <div key={i}>
            <p>{names[i]}</p>
            <Icon
              className="icon"
              name="Bicycle"
              style={{ fontSize: '200%' }}
            />
            {station.bikes} / {station.docks}
          </div>
        ))}
      </>
    );
  }
}
