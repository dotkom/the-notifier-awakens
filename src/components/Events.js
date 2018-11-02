import React, { Component } from 'react';
import { get } from 'object-path';
import { format } from 'date-fns';

export default class Events extends Component {
  render() {
    const EventsUI = EventsFromSplash;
    return <EventsUI {...this.props} />;
  }
}

class EventsFromSplash extends Component {
  render() {
    const { events = [], eventMapping } = this.props;
    const eventList = events.slice(1).map((e, i) => {
      const startDateTime = get(e, eventMapping.startDate, '');
      const startDate = format(startDateTime, 'dddd D. MMM');
      const startTime = format(startDateTime, 'HH:MM');
      const title = get(e, eventMapping.title, '');
      const style = {};

      return (
        <div key={i} className="event event-splash" style={style}>
          <span className="title">{title}</span>
          <span className="start-date">{startDate}</span>
          <span className="start-time">{startTime}</span>
        </div>
      );
    });

    const lineColor = this.props.lineColor || '#ddd';
    const dateColor = this.props.dateColor || '#f80';
    const timeColor = this.props.timeColor || 'rgba(160, 160, 160, .8)';

    const firstEvent = events[0] || {};
    const firstEventStartDateTime = get(firstEvent, eventMapping.startDate, '');
    const firstEventStartDate = format(firstEventStartDateTime, 'dddd D. MMM');
    const firstEventStartTime = format(firstEventStartDateTime, 'HH:MM');

    return (
      <>
        <style scoped>
          {`
          .event-list {
            display: flex;
            flex-direction: column;
          }
          .main-event {
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
            top: calc(50% - 7px);
            background-color: ${lineColor};
            width: 14px;
            height: 14px;
            border-radius: 7px;
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
            {firstEventStartDate}
            &nbsp;&nbsp;
            {firstEventStartTime}
          </span>
        </div>
        <div className="event-list">{eventList}</div>
      </>
    );
  }
}
