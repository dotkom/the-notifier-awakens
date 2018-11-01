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
    const { events = [], eventMapping, imageHost = '' } = this.props;
    const eventList = events.slice(1).map((e, i) => {
      const startDateTime = get(e, eventMapping.startDate, '');
      const startDate = format(startDateTime, 'dddd D. MMM');
      const startTime = format(startDateTime, 'HH:MM');
      const title = get(e, eventMapping.title, '');
      const image = ''; // get(e, eventMapping.image, '');
      const companyImage = get(e, eventMapping.companyImage, '');

      const style = {
        backgroundColor: companyImage ? 'white' : '',
        backgroundImage: `url(${imageHost + (companyImage || image)})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
      };

      return (
        <div key={i} className="event event-splash" style={style}>
          <div className="title">{title}</div>
          <div className="start-date">{startDate}</div>
          <div className="start-time">{startTime}</div>
        </div>
      );
    });

    const firstEvent = events[0] || {};

    return (
      <>
        <div>{firstEvent.title}</div>
        <div>{eventList}</div>
      </>
    );
  }
}
