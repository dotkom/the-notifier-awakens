export const defaultAffiliationSettings = {
  debug: {
    layouts: {
      0: ['Clock', 'Clock2', 'Office', 'Bus'], // Mobile
      512: ['Clock Clock2 Office Office', 'Bus Bus'], // Tablet / Desktop portrait
      1024: ['Office Clock Clock2', 'Bus Bus Bus'], // Desktop
    },
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
      ['Logo', 'Clock', 'Office', 'Bus', 'Bus2', 'Events'],
      ['Logo Logo', 'Office Clock', 'Bus Bus', 'Bus2 Bus2', 'Events Events'],
      [
        'Logo Logo Office Clock',
        'Bus Bus Events Events',
        'Bus2 Bus2 Events Events',
      ],
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
        template: 'Bus',
        id: 'Bus2',
        name: '{{bus2}}',
        departureSchema: {
          name: 'destinationDisplay.frontText',
          number: 'serviceJourney.line.publicCode',
          registredTime: 'aimedArrivalTime',
          scheduledTime: 'expectedArrivalTime',
          isRealtime: 'realtime',
        },
        apis: {
          fromCity:
            'enturbus.stops.{{bus2:prof}}.fromCity:data.quay.estimatedCalls',
          toCity:
            'enturbus.stops.{{bus2:prof}}.toCity:data.quay.estimatedCalls',
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
