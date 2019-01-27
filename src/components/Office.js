import React, { Component } from 'react';
import './Office.css';
import { isBefore, isAfter } from 'date-fns';

export default class Office extends Component {
  constructor() {
    super();
    this.state = { servants: ['Anne', 'Malin', 'Emilie', 'Gunvor'] };
  }

  render() {
    let list = null;
    if (this.props.servants) {
      const timeNow = new Date();
      list = this.props.servants.map((e, i) => {
        let style = { opacity: 0.5 };
        let arrow = '';
        if (isAfter(timeNow, e.start.date) && isBefore(timeNow, e.end.date)) {
          style = { color: 'white' };
          arrow = '◀';
        }

        return (
          <div key={i} style={style}>
            {e.pretty} - {e.summary} {arrow}
          </div>
        );
      });
    } else {
      list = (
        <span style={{ fontStyle: 'italic' }}>- {this.props.message}</span>
      );
    }

    return (
      <>
        <h1>{this.props.title || 'Kontoret'}</h1>
        <div className="kontor">
          <h2 className="kontor-heading">Kontoransvarlig</h2>
          <div className="kontor-liste">{list}</div>
          {this.props.status}
        </div>
      </>
    );
  }
}
