export const defaultAffiliationSettings = {
  debug: {
    layouts: [
      ['Office', 'Clock', 'Bus'], // Mobile
      ['Office Clock', 'Bus Bus'], // Tablet / Desktop portrait
      ['Office Clock Bus'], // Desktop
    ],
    components: [
      {
        template: 'Clock',
        apis: {
          pots: 'coffeePots.org.debug:pots',
          message: 'affiliation.org.{{affiliation}}:servant.message',
          responsible: 'affiliation.org.{{affiliation}}:servant.responsible',
          servants: 'affiliation.org.{{affiliation}}:servant.servants',
        },
      },
      {
        template: 'Bus',
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
      ['Clock', 'Office', 'Bus'],
      ['Office Clock', 'Bus Bus'],
      ['Office Clock', 'Bus Bus'],
    ],
    components: [
      {
        template: 'Clock',
        apis: {
          pots: 'coffeePots.org.online:pots',
          message: 'affiliation.org.{{affiliation}}:servant.message',
          responsible: 'affiliation.org.{{affiliation}}:servant.responsible',
          servants: 'affiliation.org.{{affiliation}}:servant.servants',
        },
      },
      {
        template: 'Bus',
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
