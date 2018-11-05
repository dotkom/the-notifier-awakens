import React, { Component } from 'react';
import {
  format,
  addMilliseconds,
  differenceInMilliseconds,
  differenceInMinutes,
} from 'date-fns';
import * as locale from 'date-fns/locale/nb';
import { DEBUG } from '../constants';

class Bus extends Component {
  constructor() {
    super();

    this.mounted = false;

    this.state = {
      toCity: [],
      fromCity: [],
      toCity2: [],
      fromCity2: [],
      lastTick: new Date().getTime(),
    };
  }

  componentDidMount() {
    this.mounted = true;
    setInterval(() => this.tick(), 1000);
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  componentWillReceiveProps(nextProps) {
    this.setState(
      Object.assign({}, this.state, {
        toCity: nextProps.toCity || [],
        fromCity: nextProps.fromCity || [],
        toCity2: nextProps.toCity2 || [],
        fromCity2: nextProps.fromCity2 || [],
      }),
    );
  }

  tick() {
    let toCity = this.state.toCity.slice();
    let fromCity = this.state.fromCity.slice();
    let diff = differenceInMilliseconds(new Date(), this.state.lastTick);

    for (let departure of toCity) {
      departure.registeredTime = this.addTime(departure.registeredTime, diff);
      departure.scheduledTime = this.addTime(departure.scheduledTime, diff);
    }

    for (let departure of fromCity) {
      departure.registeredTime = this.addTime(departure.registeredTime, diff);
      departure.scheduledTime = this.addTime(departure.scheduledTime, diff);
    }

    if (this.mounted) {
      this.setState(
        Object.assign({}, this.state, {
          toCity,
          fromCity,
          lastTick: new Date().getTime(),
        }),
      );
    }
  }

  addTime(time, add, strFormat = 'YYYY-MM-DDTHH:mm:ss') {
    let newTime = addMilliseconds(time, add);
    return format(newTime, strFormat);
  }

  getDepartureList(departures) {
    return departures
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
        const isClose = timeLeft <= 11;

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
    const toCity = this.getDepartureList(this.state.toCity);
    const fromCity = this.getDepartureList(this.state.fromCity);
    const toCity2 = this.getDepartureList(this.state.toCity2);
    const fromCity2 = this.getDepartureList(this.state.fromCity2);
    const { translate } = this.props;

    return (
      <>
        <div className="bus-wrapper">
          <h2 className="bus-stop">{translate(this.props.name)}</h2>
          <div className="bus-dir">
            <h3 className="bus-dir-item">Til byen</h3>
            <h3 className="bus-dir-item">Fra byen</h3>
          </div>
          <div className="bus-list-row">
            <div className="bus-list">{fromCity}</div>
            <div className="bus-list">{toCity}</div>
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
              <div className="bus-list">{fromCity2}</div>
              <div className="bus-list">{toCity2}</div>
            </div>
          </div>
        ) : null}
      </>
    );
  }
}

export default Bus;
