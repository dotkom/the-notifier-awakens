export const defaultAffiliationSettings = {
  debug: {
    components: [
      {
        template: 'Clock',
        apis: {
          pots: 'coffeePots.org.debug:pots',
          message: 'affiliation.org.debug:servant.message',
          responsible: 'affiliation.org.debug:servant.responsible',
          servants: 'affiliation.org.debug:servant.servants',
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
          servants: 'affiliation.org.debug:servant.servants',
          message: 'affiliation.org.debug:servant.message',
          status: 'affiliation.org.debug:meeting.message',
        },
      },
    ],
  },
  online: {
    components: [
      {
        template: 'Clock',
        apis: {
          pots: 'coffeePots.org.online:pots',
          message: 'affiliation.org.online:servant.message',
          responsible: 'affiliation.org.online:servant.responsible',
          servants: 'affiliation.org.online:servant.servants',
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
