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
      ['Logo', 'Clock', 'Office', 'Bus'],
      ['Logo Logo', 'Office Clock', 'Bus Bus'],
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
};
