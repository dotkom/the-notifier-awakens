export const defaultAffiliationSettings = {
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
          fromCity: 'tarbus.stops.${bus}.fromCity:departures',
          toCity: 'tarbus.stops.${bus}.toCity:departures',
        },
      },
      {
        template: 'Office',
        apis: {
          servants: 'affiliation.org.${affiliation}:servant.servants',
          message: 'affiliation.org.${affiliation}:servant.message',
          status: 'affiliation.org.${affiliation}:meeting.message',
        },
      },
    ],
  },
};
