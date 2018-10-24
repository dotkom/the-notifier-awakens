import React, { Component } from 'react';
import { format } from 'date-fns';

export default class Bus extends Component {
  render() {
    return (
      <div>
        <h3>Bus</h3>
        <p>Fra by</p>
        {(this.props.fromCity || []).map((e, i) => (
          <div key={i}>
            {e.line} {format(e.registeredDepartureTime, '(HH:mm)\n')}
          </div>
        ))}
        <p>Til by</p>
        {(this.props.toCity || []).map((e, i) => (
          <div key={i}>
            {e.line} {format(e.registeredDepartureTime, '(HH:mm)\n')}
          </div>
        ))}
      </div>
    );
  }
}
