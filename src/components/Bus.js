import React, { Component } from 'react';
import { format, differenceInMinutes } from 'date-fns';
import * as locale from 'date-fns/locale/nb';
import { DEBUG } from '../constants';

class Bus extends Component {
  constructor() {
    super();

    this.mounted = false;
    this.interval = null;
  }

  componentDidMount() {
    this.mounted = true;
    this.interval = setInterval(() => this.forceUpdate(), 1000);
  }

  componentWillUnmount() {
    if (this.interval !== null) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.mounted = false;
  }

  getDepartureList(departures) {
    if (!departures) {
      return;
    }
    return (departures || [])
      .map(e => {
        e.time = e.scheduledTime;

        if (e.isRealtime) {
          e.time = e.registeredTime;
        }

        return e;
      })
      .filter(e => !/^FB/.test(e.number))
      .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
      .filter(
        e =>
          new Date(e.time).getTime() >=
          Math.ceil(new Date().getTime() / 60000 - 1) * 60000,
      )
      .slice(0, 4)
      .map((e, i) => {
        const isRealtime = e.isRealtime;
        const timeLeft = differenceInMinutes(e.time, new Date(), { locale });
        let time = isRealtime ? '' : '';
        const isClose = timeLeft <= 9;

        if (timeLeft === 0) {
          time += 'nå';
        } else if (isClose) {
          time += `${timeLeft + 1} min`;
        } else {
          time = format(e.time, 'HH:mm');
        }

        if (DEBUG) time += '; ' + format(e.time, 'HH:mm');

        const style = isClose ? { color: '#ffb800' } : {};

        return (
          <div key={i} title={e.name} className="bus-list-item">
            <div
              className={`bus-list-item-number${isClose ? ' is-close' : ''}${
                isRealtime ? ' is-realtime' : ''
              }`}
            >
              {e.number}
              &nbsp;
            </div>
            <div className="bus-list-item-time" style={style}>
              {time}
            </div>
          </div>
        );
      });
  }

  render() {
    const toCity = this.getDepartureList(this.props.toCity) || [];
    const fromCity = this.getDepartureList(this.props.fromCity) || [];
    const toCity2 = this.getDepartureList(this.props.toCity2) || [];
    const fromCity2 = this.getDepartureList(this.props.fromCity2) || [];
    const { translate, IfPropIsOnline } = this.props;

    return (
      <>
        <div className="bus-wrapper">
          <h2 className="bus-stop">{translate(this.props.name)}</h2>
          <div className="bus-dir">
            <h3 className="bus-dir-item">Til byen</h3>
            <h3 className="bus-dir-item">Fra byen</h3>
          </div>
          <div className="bus-list-row">
            <IfPropIsOnline
              else={apiName => `Klarte ikke å hente data fra ${apiName}`}
              props={this.props}
              prop={['toCity', 'fromCity']}
              loading={(i, j) => `Laster${'.'.repeat(Math.min(i, j) + 1)}`}
            >
              <div className="bus-list">{fromCity}</div>
              <div className="bus-list">{toCity}</div>
            </IfPropIsOnline>
          </div>
        </div>
        {toCity2.length || fromCity2.length ? (
          <div className="bus-wrapper">
            <h2 className="bus-stop">{translate(this.props.name2)}</h2>
            <div className="bus-dir">
              <h3 className="bus-dir-item">Til byen</h3>
              <h3 className="bus-dir-item">Fra byen</h3>
            </div>
            <div className="bus-list-row">
              <IfPropIsOnline
                else={apiName => `Klarte ikke å hente data fra ${apiName}`}
                props={this.props}
                prop={['toCity', 'fromCity']}
                loading={(i, j) => `Laster${'.'.repeat(Math.min(i, j) + 1)}`}
              >
                <div className="bus-list">{fromCity2}</div>
                <div className="bus-list">{toCity2}</div>
              </IfPropIsOnline>
            </div>
          </div>
        ) : null}
      </>
    );
  }
}

export default Bus;
