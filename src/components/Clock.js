import React, { Component } from 'react';
import { format } from 'date-fns';
import './Clock.css';

export default class Clock extends Component {
  render() {
    return (
      <div {...this.props}>
        Hello
        {(this.props.pots || []).map((p, i) => (
          <div key={i}>{format(p, 'ddd D. MMM YYYY (HH:mm:ss)\n')}</div>
        ))}
      </div>
    );
  }
}
