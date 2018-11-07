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
    // Using STJS for object mapping (https://www.npmjs.com/package/stjs#2-transform)
    transform: {
      departures: {
        '{{#each departures}}': {
          name: '{{destination}}',
          number: '{{line}}',
          registeredTime: '{{registeredDepartureTime}}',
          scheduledTime: '{{scheduledDepartureTime}}',
          isRealtime: '{{isRealtimeData}}',
        },
      },
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
    body: {
      query: `{
        quay(id: "NSR:Quay:{{stops.*.fromCity,toCity}}") {
          name
          estimatedCalls(numberOfDepartures: 20) {
            aimedDepartureTime
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
    },
    stops: {
      glossyd: { fromCity: '75707', toCity: '75708' },
      samf: { fromCity: '73103', toCity: '73101' },
      prof: { fromCity: '71204', toCity: '71195' },
    },
    transform: {
      departures: {
        '{{#each data.quay.estimatedCalls}}': [
          {
            '{{#if forBoarding}}': {
              name: '{{destinationDisplay.frontText}}',
              number: '{{serviceJourney.line.publicCode}}',
              registeredTime: '{{expectedDepartureTime}}',
              scheduledTime: '{{aimedDepartureTime}}',
              isRealtime: '{{realtime}}',
            },
          },
        ],
      },
    },
  },
  onlineEvents: {
    interval: 100,
    url:
      'https://online.ntnu.no/api/v1/events/?ordering=event_start&event_start__gte=[[now.date]]',
    transform: {
      events: {
        '{{#each results}}': {
          startDate: '{{event_start}}',
          endDate: '{{event_end}}',
          title: '{{title}}',
          image: '{{image.wide}}',
          companyImage: '{{company_event.0.company.image.wide}}',
        },
      },
    },
  },
};
