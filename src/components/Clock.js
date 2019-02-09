import React, { Component } from 'react';
import { format } from 'date-fns';
import './Clock.css';

export default class Clock extends Component {
  constructor() {
    super();
    this.state = {
      time: format(new Date(), 'HH:mm'),
    };
  }

  shouldComponentUpdate(_, nextState) {
    if (nextState.time !== this.state.time) {
      return true;
    }

    return false;
  }

  componentDidMount() {
    if (!this.props.time) {
      this.interval = setInterval(() => {
        this.setState({ time: format(new Date(), 'HH:mm') });
      }, 10000);
    }
  }

  componentWillUnmount() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.time !== nextProps.time) {
      this.setState({ time: format(nextProps.time, 'HH:mm') });
    }
  }

  render() {
    return (
      <div>
        <svg width="250" height="200">
          <text
            x="50%"
            y="50%"
            alignmentBaseline="middle"
            textAnchor="middle"
            fill="white"
            fontFamily="Righteous"
            fontSize="80px"
          >
            {this.state.time}
          </text>
        </svg>
      </div>
    );
  }
}
