import React, { Component } from 'react';
import { format } from 'date-fns';
import './Clock.css';

export default class Clock extends Component {
  constructor() {
    super();
    this.state = {
      time: new Date(),
    };
  }
  componentDidMount() {
    setInterval(() => {
      this.setState({ time: new Date() });
    }, 10000);
  }
  render() {
    let time = format(new Date(), 'HH:mm');
    return (
      <div>
        <svg width="250" height="200">
         {/*<circle cx="50" cy="50" r="50" fill="#70186f" /> */}
          <text
            x="50%"
            y="50%"
            alignmentBaseline="middle"
            textAnchor="middle"
            fill="white"
            fontFamily="Righteous"
            fontSize="80px"
          >
            {time}
          </text>
        </svg>
      </div>
    );
  }
}
