import React, { Component } from 'react';
import './Office.css';
import { isBefore, isAfter } from 'date-fns';

export default class Office extends Component {
  constructor() {
    super();
    this.state = {
      servants: [],
    };
  }

  render() {
    let list = null;
    if (this.props.servants) {
      const timeNow = new Date();
      list = this.props.servants.map((e, i) => {
        let style = {
          whiteSpace: 'nowrap',
          display: 'flex',
          flexFlow: 'row nowrap',
        };
        let nameStyle = {
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          padding: '0 .2em',
        };
        let arrow = '';
        if (isAfter(timeNow, e.start.date) && isBefore(timeNow, e.end.date)) {
          style = { ...style, color: 'white' };
          arrow = '◀';
        }

        return (
          <div key={i} style={style}>
            {e.pretty} - <span style={nameStyle}>{e.summary + ' '}</span>{' '}
            {arrow}
          </div>
        );
      });
    } else {
      list = (
        <span style={{ fontStyle: 'italic' }}>
          {this.props.message ? `- ${this.props.message}` : ''}
        </span>
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
