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
        name: '{{bus}}',
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
        apis: {
          fromCity: 'tarbus.stops.{{bus:glossyd}}.fromCity:departures',
          toCity: 'tarbus.stops.{{bus:glossyd}}.toCity:departures',
        },
      },
      {
        template: 'Bus',
        id: 'Bus2',
        name: '{{bus2}}',
        apis: {
          fromCity: 'enturbus.stops.{{bus2:prof}}.fromCity:departures',
          toCity: 'enturbus.stops.{{bus2:prof}}.toCity:departures',
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
        imageHost: 'https://online.ntnu.no',
        apis: {
          events: 'onlineEvents:events',
        },
        css: '.Events { padding-bottom: 0; }',
      },
    ],
  },
};
