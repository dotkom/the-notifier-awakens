import React, { Component } from 'react';
import './Office.css';
//import { Icon } from './';
import {
  isBefore,
  isAfter,
  isWeekend,
  getHours,
  distanceInWordsToNow,
  format,
} from 'date-fns';
import * as locale from 'date-fns/locale/nb';

export default class Office extends Component {
  constructor() {
    super();
    this.state = {
      servants: [],
    };
  }

  render() {
    let list = null;
    const timeNow = new Date();
    if (this.props.servants) {
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
            {e.pretty} -{' '}
            <span style={nameStyle}>{e.summary || 'ingen :/'} </span> {arrow}
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

    let officeIsOpen = true;
    const hour = getHours(timeNow);
    if (isWeekend(timeNow)) {
      officeIsOpen = false;
    } else if (hour < 10 || hour >= 16) {
      officeIsOpen = false;
    }

    let isDoorOpen = null;
    if (
      'doorStatus' in this.props &&
      /^OPEN$|^CLOSED$/.test(this.props.doorStatus)
    ) {
      isDoorOpen = this.props.doorStatus === 'OPEN';
    }

    const isOpen = !!isDoorOpen || officeIsOpen;
    const isOpenText =
      isDoorOpen === null ? '' : isOpen ? ' er åpent' : ' er stengt!';

    const title = (this.props.title || 'Kontoret') + isOpenText;
    const titleClass =
      isDoorOpen === null ? '' : isOpen ? 'is-open' : 'is-closed';

    return (
      <>
        <h1 className={titleClass}>{title}</h1>
        {/*this.props.coffee && this.props.coffee.eta ? (
          <p>
            <Icon
              name="Coffee"
              color="white"
              size="32px"
              style={{ verticalAlign: 'middle' }}
            />
            {` Kaffe ${
              isBefore(Date.now(), this.props.coffee.eta)
                ? 'klar om ' +
                  distanceInWordsToNow(this.props.coffee.eta, {
                    locale,
                  })
                : 'var klar for ' +
                  distanceInWordsToNow(this.props.coffee.eta, {
                    locale,
                  }) +
                  ' siden'
            }.`}
          </p>
          ) : null*/}
        {isDoorOpen === null ? null : (
          <p className="small">
            {isOpen ? 'Åpnet' : 'Stengte'} for{' '}
            {distanceInWordsToNow(this.props.lastDoorStatus, { locale })} siden
            ({format(this.props.lastDoorStatus, 'HH:mm', { locale })})
          </p>
        )}
        {isOpen && this.props.hasServants ? (
          <div className="kontor">
            <h2 className="kontor-heading">Kontoransvarlig</h2>
            <div className="kontor-liste">{list}</div>
          </div>
        ) : null}
        {this.props.status}
      </>
    );
  }
}
