import React, { Component } from 'react';
import { get } from 'object-path';
import { format } from 'date-fns';

export default class Events extends Component {
  render() {
    const EventsUI = EventsFromSplash;
    const { events = [], eventMapping } = this.props;
    const eventsMapped = events.map(e => {
      const startDateTime = get(e, eventMapping.startDate, '');
      const startDate = format(startDateTime, 'dddd D. MMM');
      const startTime = format(startDateTime, 'HH:MM');
      const title = get(e, eventMapping.title, '');
      const image = get(e, eventMapping.image, '');
      const companyImage = get(e, eventMapping.companyImage, '');

      return {
        startDate,
        startTime,
        title,
        image: image || companyImage,
      };
    });
    return <EventsUI {...this.props} events={eventsMapped} />;
  }
}

class EventsFromSplash extends Component {
  render() {
    const {
      events = [],
      lineColor = '#ddd',
      dateColor = '#f80',
      timeColor = 'rgba(160, 160, 160, .8)',
    } = this.props;
    const eventList = events.slice(1).map((e, i) => {
      const { startDate, startTime, title } = e;
      const style = {};

      return (
        <div key={i} className="event event-splash" style={style}>
          <span className="title">{title}</span>
          <span className="start-date">{startDate}</span>
          <span className="start-time">{startTime}</span>
        </div>
      );
    });

    const firstEvent = events[0] || {};

    return (
      <>
        <style scoped>
          {`
          .event-list {
            display: flex;
            flex-direction: column;
            max-width: 800px;
            margin: auto;
          }
          .main-event {
            max-width: 800px;
            margin: auto;
            display: flex;
            flex-direction: column;
            height: 160px;
            padding: 32px 24px;
            box-sizing: border-box;
          }
          .main-title {
            font-size: 2em;
            color: #fff;
          }
          .main-start-datetime {
            margin: 10px 0 0 50px;
          }
          .main-start-datetime::before {
            content: '- ';
          }
          .event {
            display: flex;
          }
          .title {
            order: 3;
            flex: 1 0 auto;
            position: relative;
            border-left: 3px solid ${lineColor};
            padding: 10px 0 10px 42px;
          }
          .title::before {
            content: '';
            position: absolute;
            right: calc(100% - 5px);
            top: 18px;
            background-color: ${lineColor};
            width: 14px;
            height: 14px;
            border-radius: 7px;
          }
          .event:last-child .title {
            padding-bottom: 32px;
          }
          .start-date {
            order: 1;
            flex: 0 0 240px;
            text-align: right;
            color: ${dateColor};
            padding: 10px 0;
          }
          .start-time {
            order: 2;
            flex: 0 0 80px;
            text-align: center;
            font-size: .75em;
            color: ${timeColor};
            padding: 14px 10px 10px 0;
          }
          `}
        </style>
        <div className="main-event">
          <span className="main-title">{firstEvent.title}</span>
          <span className="main-start-datetime">
            {firstEvent.startDate}
            &nbsp;&nbsp;
            {firstEvent.startTime}
          </span>
        </div>
        <div className="event-list">{eventList}</div>
      </>
    );
  }
}

class EventsCarousel extends Component {
  render() {
    const {
      events = [],
      lineColor = '#ddd',
      dateColor = '#f80',
      timeColor = 'rgba(160, 160, 160, .8)',
    } = this.props;
    const eventList = events.slice(1).map((e, i) => {
      const { startDate, startTime, title } = e;
      const style = {};

      return (
        <div key={i} className="event event-splash" style={style}>
          <span className="title">{title}</span>
          <span className="start-date">{startDate}</span>
          <span className="start-time">{startTime}</span>
        </div>
      );
    });

    const firstEvent = events[0] || {};

    return (
      <>
        <style scoped>
          {`
          .event-list {
            display: flex;
            flex-direction: column;
            max-width: 800px;
            margin: auto;
          }
          .main-event {
            max-width: 800px;
            margin: auto;
            display: flex;
            flex-direction: column;
            height: 160px;
            padding: 32px 24px;
            box-sizing: border-box;
          }
          .main-title {
            font-size: 2em;
            color: #fff;
          }
          .main-start-datetime {
            margin: 10px 0 0 50px;
          }
          .main-start-datetime::before {
            content: '- ';
          }
          .event {
            display: flex;
          }
          .title {
            order: 3;
            flex: 1 0 auto;
            position: relative;
            border-left: 3px solid ${lineColor};
            padding: 10px 0 10px 42px;
          }
          .title::before {
            content: '';
            position: absolute;
            right: calc(100% - 5px);
            top: 18px;
            background-color: ${lineColor};
            width: 14px;
            height: 14px;
            border-radius: 7px;
          }
          .event:last-child .title {
            padding-bottom: 32px;
          }
          .start-date {
            order: 1;
            flex: 0 0 240px;
            text-align: right;
            color: ${dateColor};
            padding: 10px 0;
          }
          .start-time {
            order: 2;
            flex: 0 0 80px;
            text-align: center;
            font-size: .75em;
            color: ${timeColor};
            padding: 14px 10px 10px 0;
          }
          `}
        </style>
        <div className="main-event">
          <span className="main-title">{firstEvent.title}</span>
          <span className="main-start-datetime">
            {firstEvent.startDate}
            &nbsp;&nbsp;
            {firstEvent.startTime}
          </span>
        </div>
        <div className="event-list">{eventList}</div>
      </>
    );
  }
}
