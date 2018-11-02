export const defaultAffiliationSettings = {
  debug: {
    layouts: [
      ['Clock', 'Clock2', 'Office', 'Bus'], // Mobile
      ['Clock Clock2 Office Office', 'Bus Bus'], // Tablet / Desktop portrait
      ['Office Clock Clock2', 'Bus Bus Bus'], // Desktop
    ],
    components: [
      {
        template: 'Clock',
      },
      {
        template: 'Clock',
        id: 'Clock2',
      },
      {
        template: 'Bus',
        departureSchema: {
          name: 'destination',
          number: 'line',
          registredTime: 'registeredDepartureTime',
          scheduledTime: 'scheduledDepartureTime',
          isRealtime: 'isRealtimeData',
        },
        apis: {
          fromCity: 'tarbus.stops.{{bus:glossyd}}.fromCity:departures',
          toCity: 'tarbus.stops.{{bus:glossyd}}.toCity:departures',
        },
      },
      {
        template: 'Office',
        apis: {
          servants: 'affiliation.org.{{affiliation}}:servant.servants',
          message: 'affiliation.org.{{affiliation}}:servant.message',
          status: 'affiliation.org.{{affiliation}}:meeting.message',
        },
      },
    ],
  },
  online: {
    layouts: [
      ['Logo', 'Clock', 'Office', 'Bus', 'Events'],
      ['Logo Logo', 'Office Clock', 'Bus Bus', 'Events Events'],
      ['Logo Logo Office Clock', 'Bus Bus Events Events'],
    ],
    components: [
      {
        template: 'Logo',
        url: 'https://online.ntnu.no/static/img/online_logo.svg',
      },
      {
        template: 'Clock',
      },
      {
        template: 'Bus',
        name: '{{bus}}',
        name2: '{{bus2}}',
        departureSchema: {
          name: 'destination',
          number: 'line',
          registredTime: 'registeredDepartureTime',
          scheduledTime: 'scheduledDepartureTime',
          isRealtime: 'isRealtimeData',
        },
        apis: {
          fromCity: 'tarbus.stops.{{bus:glossyd}}.fromCity:departures',
          toCity: 'tarbus.stops.{{bus:glossyd}}.toCity:departures',
          fromCity2: 'tarbus.stops.{{bus2:glossyd}}.fromCity:departures',
          toCity2: 'tarbus.stops.{{bus2:glossyd}}.toCity:departures',
        },
      },
      {
        template: 'Office',
        apis: {
          servants: 'affiliation.org.{{affiliation}}:servant.servants',
          message: 'affiliation.org.{{affiliation}}:servant.message',
          status: 'affiliation.org.{{affiliation}}:meeting.message',
        },
      },
      {
        template: 'Events',
        type: '{{eventType}}',
        eventMapping: {
          startDate: 'event_start',
          endDate: 'event_end',
          title: 'title',
          image: 'image.wide',
          companyImage: 'company_event.0.company.image.wide',
        },
        imageHost: 'https://online.ntnu.no',
        apis: {
          events: 'onlineEvents:results',
        },
        css: '.Events { padding-bottom: 0; }',
      },
    ],
  },
};
