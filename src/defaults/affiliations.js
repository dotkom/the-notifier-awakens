export const defaultAffiliationSettings = {
  online: {
    settings: ['bus', 'bus2', 'coffee', 'events', 'officestatus'],
    components: [
      {
        template: 'Vakter',
        apis: {
          message: 'affiliation.org.online:servant.message',
          responsible: 'affiliation.org.online:servant.responsible',
          servants: 'affiliation.org.online:servant.servants',
        },
        props: {},
      },
      {
        template: 'Coffee',
        apis: {
          coffeeTime: 'affiliation.org.online:coffee.date',
          pots: 'coffeePots:pots',
        },
        showCoffeePots: '{{showCoffeePots}}',
        injectInto: ['showCoffeePots'],
        props: {},
      },
      /*{
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
          'fromCity': 'tarbus.stops.{{bus}}.fromCity:departures',
          'toCity': 'tarbus.stops.{{bus}}.toCity:departures',
        },
        injectInto: [ 'name', 'apis.fromCity', 'apis.toCity' ],
        props: {},
      },*/
      {
        template: 'Bus',
        name: '{{bus}}',
        name2: '{{bus2}}',
        departureSchema: {
          name: 'destinationDisplay.frontText',
          number: 'serviceJourney.line.publicCode',
          registredTime: 'aimedArrivalTime',
          scheduledTime: 'expectedArrivalTime',
          isRealtime: 'realtime',
        },
        apis: {
          fromCity: 'enturbus.stops.{{bus}}.fromCity:data.quay.estimatedCalls',
          toCity: 'enturbus.stops.{{bus}}.toCity:data.quay.estimatedCalls',
          fromCity2:
            'enturbus.stops.{{bus2}}.fromCity:data.quay.estimatedCalls',
          toCity2: 'enturbus.stops.{{bus2}}.toCity:data.quay.estimatedCalls',
        },
        injectInto: [
          'name',
          'apis.fromCity',
          'apis.toCity',
          'name2',
          'apis.fromCity2',
          'apis.toCity2',
        ],
        size: '4',
        props: {},
      },
    ],
  },
};
