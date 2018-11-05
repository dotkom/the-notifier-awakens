import { API_URL } from '../constants';

export const defaultApis = {
  affiliation: {
    interval: 60,
    url: `${API_URL}/affiliation/{{org.*}}`,
    org: {
      debug: 'DEBUG',
      online: 'online',
      abakus: 'abakus',
      delta: 'delta',
    },
  },
  coffeePots: {
    interval: 60,
    url: `${API_URL}/coffee/{{org.*}}`,
    org: {
      debug: 'DEBUG',
      online: 'online',
      abakus: 'abakus',
      delta: 'delta',
    },
  },
  tarbus: {
    interval: 10,
    url: 'https://atbapi.tar.io/api/v1/departures/{{stops.*.fromCity,toCity}}',
    stops: {
      glossyd: { fromCity: '16010265', toCity: '16011265' },
      samf: { fromCity: '16010476', toCity: '16011476' },
      prof: { fromCity: '16010376', toCity: '16011376' },
    },
  },
  bartebuss: {
    interval: 10,
    offline: true,
    url: 'https://bartebuss.no/api/unified/{{stops.*.fromCity,toCity}}',
    stops: {
      glossyd: { fromCity: '16010265', toCity: '16011265' },
      samf: { fromCity: '16010476', toCity: '16011476' },
    },
  },
  enturbus: {
    interval: 10,
    method: 'POST',
    url: `https://api.entur.org/journeyplanner/2.0/index/graphql`,
    request: {
      headers: {
        'ET-Client-Name': 'onlinentnu-notifier-dev',
      },
      mode: 'cors',
    },
    body: JSON.stringify({
      query: `{
        quay(id: "NSR:Quay:{{stops.*.fromCity,toCity}}") {
          id
          name
          estimatedCalls(numberOfDepartures: 10) {
            aimedArrivalTime
            aimedDepartureTime
            expectedArrivalTime
            expectedDepartureTime
            realtime
            forBoarding
            destinationDisplay {
              frontText
            }
            serviceJourney {
              line {
                publicCode
              }
            }
          }
        }
      }`,
    }),
    stops: {
      glossyd: { fromCity: '75707', toCity: '75708' },
      samf: { fromCity: '73103', toCity: '73101' },
      prof: { fromCity: '73103', toCity: '73101' },
    },
  },
  onlineEvents: {
    interval: 100,
    url: 'https://online.ntnu.no/api/v1/events/',
  },
};
