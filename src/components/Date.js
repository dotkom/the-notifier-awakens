import React, { Component } from 'react';
import { format } from 'date-fns';
import * as locale from 'date-fns/locale/nb';
import './Date.css';

export default class Clock extends Component {
  constructor() {
    super();
    const now = new Date();
    this.timeFormat = 'HH:mm';
    this.dateFormat = 'D. MMM';
    this.weekDayFormat = 'dddd';
    this.state = {
      time: this.format(now, this.timeFormat),
      date: this.format(now, this.dateFormat),
      weekDay: this.format(now, this.weekDayFormat),
    };
  }

  format(date, dateFormat) {
    return format(date, dateFormat, { locale });
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
        this.setState({
          time: this.format(new Date(), this.timeFormat),
          date: this.format(new Date(), this.dateFormat),
          weekDay: this.format(new Date(), this.weekDayFormat),
        });
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
      this.setState({
        time: this.format(nextProps.time, this.timeFormat),
        date: this.format(nextProps.time, this.dateFormat),
        weekDay: this.format(nextProps.time, this.weekDayFormat),
      });
    }
  }

  render() {
    return (
      <>
        <svg width="250" height="200">
          <text
            x="50%"
            y="20%"
            alignmentBaseline="middle"
            textAnchor="middle"
            fill={this.props.dark ? '#999' : '#222'}
            fontFamily="Righteous"
            fontSize="30px"
            className="cap"
          >
            {this.state.weekDay}
          </text>
          <text
            x="50%"
            y="50%"
            alignmentBaseline="middle"
            textAnchor="middle"
            fill={this.props.dark ? 'white' : '#222'}
            fontFamily="Righteous"
            fontSize="80px"
          >
            {this.state.time}
          </text>
          <text
            x="50%"
            y="75%"
            alignmentBaseline="middle"
            textAnchor="middle"
            fill={this.props.dark ? '#999' : '#222'}
            fontFamily="Righteous"
            fontSize="30px"
          >
            {this.state.date}
          </text>
        </svg>
      </>
    );
  }
}
