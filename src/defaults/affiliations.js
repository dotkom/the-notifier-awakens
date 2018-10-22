export const defaultAffiliationSettings = {
  online: {
    settings: ['bus', 'bus2', 'coffee', 'events', 'officestatus'],
    components: [
      {
        template: 'Clock',
        apis: {
          pots: 'coffeePots:pots',
          message: 'affiliation.org.online:servant.message',
          responsible: 'affiliation.org.online:servant.responsible',
          servants: 'affiliation.org.online:servant.servants',
        },
        props: {},
      },
    ],
  },
};
