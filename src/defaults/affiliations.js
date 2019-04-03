/**
 * List of default settings for each affiliation.
 * 
 * Each affiliation consists of a set of components, but can also contain
 * other properties:

  @param {string?} [name=nameofkey]
    Name of the affiliation. Of not specified, the key is used as name.

  @param {array|object?} layouts
    Describing how the components are placed. This can be done using a single
    array of arrays, or an object with min-widths as keys, each containing an array
    describing the layout at the different stages. If the layout is not specified,
    it is auto calculated, but this may result in unwanted behaviour.
    Let us look at two examples using array-of-arrays and object-with-arrays:

  @example
```javascript
// Use of object keys to specify min-width
layout: {

  // Screen width from 0 to 511px. Key "0" must exist.
  0: [
    'Component1', // Each array element is a row in the layout.
    'Component2',
    'Component3'
  ],

   // Screen width from 512px to 1023px
  512: [
    'Component1 Component2',
    'Component3 Component3'
  ],

  // Screen width from 1024px to infinite
  1024: [
    'Component1 Component2 Component3'
  ],
}
```

  @example
```javascript
// Use of array to auto specify min-width (using 0-720px-1400px-(1400+360*i)px)
layout: [

  // Screen width from 0 to 719px.
  [
    'Component1', // Each array element is a row in the layout.
    'Component2',
    'Component3'
  ],

   // Screen width from 720px to 1399px
  [
    'Component1 Component2',
    'Component3 Component3'
  ],

  // Screen width from 1400px to infinite
  [
    'Component1 Component2 Component3'
  ],
]
```

  @param {component[]} components
    Array of components. The structure of a component is described below:

```javascript
// Structure of a component
{
  template: string,
  apis?: object,
  color?: string,
  css?: string,
}

// With descriptions
{
  // The component to use. Complete list is found in the '../components' file
  template: string,

  // Key-value list where keys are input to each component, and value is pointing
  // to data from an API from the APIs list in './apis.js'.
  apis: object,

  // Background color. Can also be specified through the css property.
  color: string,

  // Style for each component. Overrides all other styles.
  css: string,
}
```

  @param {string?} style
    Choose a style to use from the './styles.js' file. If not specified, the
    affiliation key determines what style which is used. The style property
    in the settings can override the style from affiliation. If no key exists,
    the CSS remain empty.

  @param {string?} css
    Global CSS for the whole application. If you really want to change the grid
    system, you will be allowed to do so. This will be appended after global CSS
    declared in the settings.

  @example
```javascript
// Most of the components has the same pattern. Therefore
// it is possible to just write the names and let the
// application figure it out.
affiliationkey: {
  name: 'Name of Affiliation',
  layouts: [
    ['Events', 'Events-2'], // 0 to 719px
    ['Events Events-2'], // 720px to infinite
  ],
  components: ['Events', 'Events-2'] // Much shorter!
},
```

  @example
```javascript
// If you want to do more, then just specify more properties.
affiliationkey: {
  name: 'Name of Affiliation',
  layouts: {
    0: ['Articles', 'Articles-someotherfeed'], // 0 to 511px
    512: ['Articles Articles-someotherfeed'], // 512px to infinite
  },
  components: [
    {
      template: 'Articles',
      apis: {
        // affiliationkeyArticles should exist in './apis.js'
        articles: 'affiliationkeyArticles:articles',
      },
    },
    {
      // Using 'Template-id' to make it unique for the layout.
      template: 'Articles-someotherfeed',
      apis: {
        // '{{affiliation}}Articles' results in the same as 'affiliationkeyArticles'
        articles: '{{affiliation}}Articles:articles',
      },
    }
  ]
},
```
 */
export const defaultAffiliationSettings = {
  debug: {
    layouts: {
      0: ['Clock', 'Door', 'Infoscreens'],
    },
    components: [
      {
        template: 'Clock',
      },
      {
        template: `
            {{status.result.office-door.value|upper|ifeq OPEN The office is open!|else The office is not open}}
        `,
        id: 'Door',
        apis: {
          status: 'infoscreens.sensors.online-door',
        },
      },
      {
        template: `
          {{#each ['online', 'online-kontoret']}}
            <img src="https://notiwall.online.ntnu.no/api/v1/{{this|base64}}/screenshot.png" />
          {{#end}}
        `,
        id: 'Infoscreens',
        css: 'img { height: 420px; }',
      },
    ],
  },
  '': {
    name: 'Velg linjeforening',
    color: '#002c7c',
    layouts: {
      0: ['ChooseAffiliation'],
      600: ['/ | minmax(600px,1fr) |', 'ChooseAffiliation / 1fr'],
    },
    components: ['ChooseAffiliation'],
  },
  aarhonen: {
    name: 'H.M. Aarhønen',
    color: 'purple',
    layouts: ['"Events"'],
    components: ['Events'],
  },
  abakus: {
    name: 'Abakus',
    color: 'darkred',
    dark: false,
    layouts: {
      0: ['Logo', 'Clock', '.', 'Events'],
      800: ['/ 1fr 300px', 'Logo Clock / 200px', '.', 'Events Events'],
    },
    css: ', {background: linear-gradient(0deg, #f4f4f4, #eae9e8);}',
    components: [
      {
        template: 'Logo',
        url: 'https://abakus.no/7df72c5a291dc020b1d5d191ba50d871.png',
      },
      { template: 'Clock', apis: { time: 'seconds' } },
      {
        template: 'Events',
        dark: false,
        count: '{{eventCount:5}}',
        apis: { events: '{{affiliation}}Events:events' },
      },
    ],
  },
  berg: {
    name: 'Bergstuderendes Forening',
    color: 'grey',
    components: [],
  },
  broderskabet: {
    name: 'Broderskabet',
    color: 'grey',
    components: [],
  },
  caf: {
    name: 'CAF',
    color: 'blue',
    components: [],
  },
  communitas: {
    name: 'Communitas',
    color: 'cyan',
    components: [],
  },
  delta: {
    name: 'Delta',
    color: 'green',
    layouts: {
      0: ['Logo / calc(200px + 10vw)', 'Clock', 'Events', 'Articles'],
      512: [
        'Logo Clock / calc(200px + 10vw)',
        'Events Events',
        'Articles Articles',
      ],
      1024: [
        '/ . . 320px',
        'Logo Clock Clock / 300px',
        'Events Events Articles',
      ],
    },
    components: [
      {
        template: 'Logo',
        filter: 'grayscale(1) brightness(100)',
        url:
          'https://www.deltahouse.no/wp-content/themes/delta/dist/images/logo.svg',
      },
      'Events',
      'Clock',
      {
        template: 'Articles',
        css: '.Articles .article { background-size: contain; }',
      },
    ],
  },
  dhs: {
    name: 'Det Historiske Selskab',
    color: 'purple',
    components: [],
  },
  dion: {
    name: 'DION',
    color: 'cyan',
    components: [],
  },
  dionysos: {
    name: 'Dionysos',
    color: 'purple',
    components: [],
  },
  dmmh: {
    name: 'DMMH',
    color: 'red',
    components: [],
  },
  dusken: {
    name: 'Dusken.no',
    color: 'grey',
    layouts: ['"Articles"'],
    components: ['Articles'],
  },
  emil: {
    name: 'EMIL',
    color: 'green',
    components: [],
  },
  erudio: {
    name: 'Erudio',
    color: 'red',
    components: [],
  },
  esn: {
    name: 'ESN',
    color: 'cyan',
    components: [],
  },
  eureka: {
    name: 'Eureka',
    color: 'blue',
    components: [],
  },
  gemini: {
    name: 'Gemini',
    color: 'cyan',
    components: [],
  },
  gengangere: {
    name: 'Gengangere',
    color: 'grey',
    components: [],
  },
  geolf: {
    name: 'Geolf',
    color: 'blue',
    components: [],
  },
  hc: {
    name: 'Høiskolens Chemikerforening',
    color: '#003d54',
    components: ['Events'],
  },
  hybrida: {
    name: 'Hybrida',
    color: 'blue',
    components: [],
  },
  iaeste: {
    name: 'IAESTE',
    color: 'blue',
    components: [],
  },
  industrivinduet: {
    name: 'Industrivinduet',
    color: 'blue',
    components: [],
  },
  isu: {
    name: 'International Student Union',
    color: 'blue',
    components: [],
  },
  janus: {
    name: 'Janus',
    color: 'blue',
    components: [],
  },
  jump_cut: {
    name: 'Jump Cut',
    color: 'grey',
    components: [],
  },
  kom: {
    name: 'KOM',
    color: 'cyan',
    components: [],
  },
  leonardo: {
    name: 'Leonardo',
    color: 'cyan',
    components: [],
  },
  logistikkstudentene: {
    name: 'Logistikkstudentene',
    color: 'cyan',
    components: [],
  },
  mannhullet: {
    name: 'Mannhullet',
    color: 'deepblue',
    layouts: {
      0: ['Logo / 200px', 'Clock', 'Events', 'Bus'],
      768: ['Logo Clock / 240px', 'Events Events', 'Bus Bus'],
      1400: ['Logo Clock / 240px', '. .', 'Events Bus'],
    },
    components: [
      { template: 'Logo', url: 'https://www.mannhullet.no/img/logo2.png' },
      'Clock',
      'Events',
      {
        template: 'Bus',
        name: '{{bus:magn}}',
        count: '{{busCount:4}}',
        apis: {
          fromCity: '{{busApi:tarbus}}.stops.{{bus:magn}}.fromCity:departures',
          toCity: '{{busApi:tarbus}}.stops.{{bus:magn}}.toCity:departures',
        },
      },
    ],
  },
  nabla: {
    name: 'Nabla',
    color: 'red',
    components: [],
  },
  ntnu: {
    name: 'NTNU',
    color: 'blue',
    components: [],
  },
  nutrix: {
    name: 'Nutrix',
    color: 'green',
    components: [],
  },
  omega: {
    name: 'Omega',
    color: 'grey',
    components: [],
  },
  omegav: {
    name: 'Omega Verksted',
    color: 'grey',
    components: [],
  },
  dotkom: {
    name: 'DotKom',
    components: [
      //{
      //  template: 'GitHub',
      //  user: '{{affiliation}}',
      //  apis: {
      //    repos: 'github.users.{{affiliation}}',
      //  },
      //},
      //{
      //  template: 'Articles',
      //  apis: {
      //    articles: 'vgArticles:articles',
      //  },
      //},
      //{
      //  template: 'Office',
      //  apis: {
      //    status: 'komplett',
      //  },
      //},
      //{
      //  template: 'Bus',
      //  name: '{{bus:glos}}', // The bus name displayed on the screen. If none have been chosen, then bus name will be set to 'glos' as default
      //  count: '{{busCount}}', // Control amount of departures from settings
      //  apis: {
      //    fromCity: 'tarbus.stops.{{bus:glos}}.fromCity:departures',
      //    toCity: 'tarbus.stops.{{bus:glos}}.toCity:departures',
      //  },
      //},
      {
        template: '<h1>Klokke: {{time|time HH:mm:ss}}</h1>',
        apis: { time: 'time' },
      },
      {
        template: `
          <h1>Neste buss til {{bus:Gløshaugen|translate}}:
          <div class="bustable">
              <div class="bus">
                {{departures.0.number:Laster inn...}} {{departures.0.name|front - (|back )}} {{departures.0.registeredTime|time HH:mm}}
              </div>
              {{#each departures.slice(0, 5)}}
                <div>{{number}} - ({{name}}) {{registeredTime|time HH:mm}}</div>
              {{#end}}
            </div>
            <style>.bustable {color: orange;}</style>
          </h1>`,
        id: 'Bus',
        css: '.bus { color: red; }',
        apis: {
          departures: 'enturbus.stops.{{bus:glos}}.fromCity:departures',
        },
      },
      'Clock',
    ],
  },
  online: {
    name: 'Online',
    layouts: {
      0: ['Logo', 'Date', 'Bike', 'Office', 'Bus', 'Bus2', 'Events'],
      720: [
        '/ 200px . . 200px',
        'Logo Logo Logo',
        'Office Office Date Date',
        'Office Office Bike Bike',
        'Bus Bus Bus2 Bus2',
        '. . . .',
        'Events Events Events .',
      ],
      1400: [
        'Logo Logo Office Date',
        'Logo Logo Office Bike',
        '. . Events Events / 1',
        'Bus Bus Events Events',
        'Bus2 Bus2 Events Events',
        '. . Events Events / 1',
        '. . . .',
      ],
      2000: [
        'Logo Logo Office Date',
        'Logo Logo Office Bike',
        'Bike Bike .',
        'Bus Bus2 Events Events',
        '. . .',
      ],
    },
    components: [
      {
        template: 'Logo',
        url: 'https://online.ntnu.no/static/img/online_logo.svg',
      },
      {
        template: 'Date',
        apis: { time: 'seconds' },
      },
      {
        template: 'Bus',
        name: '{{bus:glos}}',
        count: '{{busCount:6}}',
        apis: {
          fromCity:
            '{{busApi:enturbus}}.stops.{{bus:glos}}.fromCity:departures',
          toCity: '{{busApi:enturbus}}.stops.{{bus:glos}}.toCity:departures',
        },
      },
      {
        template: 'Bus',
        id: 'Bus2',
        name: '{{bus2:prof}}',
        count: '{{busCount:6}}',
        apis: {
          fromCity:
            '{{busApi:enturbus}}.stops.{{bus2:prof}}.fromCity:departures',
          toCity: '{{busApi:enturbus}}.stops.{{bus2:prof}}.toCity:departures',
        },
      },
      {
        template: 'Bike',
        id: 'Bike',
        name: 'Gløshaugen Sykkelstativ',
        apis: {
          bikes: 'trondheimCityBike:stations.0.bikes',
          docks: 'trondheimCityBike:stations.0.docks',
        },
      },
      {
        template: 'Office',
        hasServants: true,
        apis: {
          servants: 'affiliation.org.{{affiliation}}:servant.servants',
          message: 'affiliation.org.{{affiliation}}:servant.message',
          status: 'affiliation.org.{{affiliation}}:meeting.message',
        },
      },
      {
        template: 'Events',
        type: '{{eventType}}',
        count: '{{eventCount}}',
      },
    ],
  },
  'online-kontoret': {
    name: 'Online Kontoret',
    layouts: {
      0: ['Logo', 'Date', 'Bike', 'Office', 'Bus', 'Bus2', 'Events'],
      720: [
        '/ 200px . . 200px',
        'Logo Logo Logo',
        'Office Office Date Date',
        'Office Office Bike Bike',
        'Bus Bus Bus2 Bus2',
        '. . . .',
        'Events Events Events .',
      ],
      1400: [
        'Logo Logo Office Date',
        'Logo Logo Office Bike',
        '. . Events Events / 1',
        'Bus Bus Events Events',
        'Bus2 Bus2 Events Events',
        '. . Events Events / 1',
        '. . . .',
      ],
      2000: [
        'Logo Logo Office Date',
        'Logo Logo Office Bike',
        'Bike Bike .',
        'Bus Bus2 Events Events',
        '. . .',
      ],
    },
    components: [
      {
        template: 'Logo',
        url: 'https://online.ntnu.no/static/img/online_logo.svg',
      },
      {
        template: 'Date',
        apis: { time: 'seconds' },
      },
      {
        template: 'Bus',
        name: '{{bus:glos}}',
        count: '{{busCount:6}}',
        apis: {
          fromCity:
            '{{busApi:enturbus}}.stops.{{bus:glos}}.fromCity:departures',
          toCity: '{{busApi:enturbus}}.stops.{{bus:glos}}.toCity:departures',
        },
      },
      {
        template: 'Bus',
        id: 'Bus2',
        name: '{{bus2:prof}}',
        count: '{{busCount:6}}',
        apis: {
          fromCity:
            '{{busApi:enturbus}}.stops.{{bus2:prof}}.fromCity:departures',
          toCity: '{{busApi:enturbus}}.stops.{{bus2:prof}}.toCity:departures',
        },
      },
      {
        template: 'Bike',
        id: 'Bike',
        name: 'Gløshaugen Sykkelstativ',
        apis: {
          bikes: 'trondheimCityBike:stations.0.bikes',
          docks: 'trondheimCityBike:stations.0.docks',
        },
      },
      {
        template: 'Office',
        hasServants: true,
        //title: 'Onlinekontoret',
        apis: {
          servants:
            'affiliation.org.{{affiliationGroup:online}}:servant.servants',
          message:
            'affiliation.org.{{affiliationGroup:online}}:servant.message',
          status: 'affiliation.org.{{affiliationGroup:online}}:meeting.message',
          doorStatus:
            'infoscreens.sensors.online-door:result.office-door.value',
        },
      },
      {
        template: 'Events',
        type: '{{eventType}}',
        count: '{{eventCount}}',
      },
    ],
  },
  paideia: {
    name: 'Paideia',
    color: 'blue',
    components: [],
  },
  panoptikon: {
    name: 'Panoptikon',
    color: 'blue',
    components: [],
  },
  pareto: {
    name: 'Pareto',
    color: 'blue',
    components: [],
  },
  placebo: {
    name: 'MF Placebo',
    color: 'red',
    components: [],
  },
  primetime: {
    name: 'Primetime',
    color: 'cyan',
    components: [],
  },
  psi: {
    name: 'PSI',
    color: 'red',
    components: [],
  },
  psykolosjen: {
    name: 'Psykolosjen',
    color: 'blue',
    components: [],
  },
  'rektoratet-ntnu': {
    name: 'Rektoratet NTNU',
    color: 'blue',
    components: [],
  },
  samfundet: {
    name: 'Studentersamfundet',
    color: 'red',
    components: [],
  },
  sftoh: {
    name: 'STØH',
    color: 'blue',
    components: [],
  },
  signifikant: {
    name: 'Signifikant',
    color: 'cyan',
    components: [],
  },
  smorekoppen: {
    name: 'A/F Smørekoppen',
    color: '#9c0018',
    layouts: {
      0: ['Logo', 'Clock', 'Events'],
      1000: ['Logo Clock', 'Events Events'],
    },
    components: [
      {
        template: 'Logo',
        url:
          'https://static1.squarespace.com/static/5996ea333e00be99ded8ae9f/t/5a6f7744ec212d5a20ab91d7/1551098977088/?format=1500w',
      },
      'Clock',
      'Events',
    ],
  },
  solan: {
    name: 'Solan',
    color: 'blue',
    components: [],
  },
  soma: {
    name: 'SOMA',
    color: 'cyan',
    components: [],
  },
  spanskroeret: {
    name: 'Spanskrøret',
    color: 'green',
    components: [],
  },
  'studenttinget-ntnu': {
    name: 'Studenttinget NTNU',
    color: 'purple',
    components: [],
  },
  sturm_und_drang: {
    name: 'Sturm Und Drang',
    color: 'red',
    components: [],
  },
  symbiosis: {
    name: 'Symbiosis',
    color: 'green',
    components: [],
  },
  teaterlosjen: {
    name: 'Teaterlosjen',
    color: 'red',
    components: [],
  },
  tihlde: {
    name: 'TIHLDE',
    color: 'blue',
    components: [],
  },
  'tim-og-shaenko': {
    name: 'Tim & Shænko',
    color: 'blue',
    components: [],
  },
  timini: {
    name: 'Timini',
    color: 'cyan',
    components: [],
  },
  tjsf: {
    name: 'TJSF',
    color: 'grey',
    components: [],
  },
  universitetsavisa: {
    name: 'Universitetsavisa',
    color: 'cyan',
    components: [],
  },
  universitetsteatret: {
    name: 'Universitetsteatret',
    color: 'blue',
    components: [],
  },
  velferdstinget: {
    name: 'Velferdstinget',
    color: 'cyan',
    components: [],
  },
  vivas: {
    name: 'Vivas',
    color: 'cyan',
    components: [],
  },
  volvox: {
    name: 'Volvox & Alkymisten',
    color: 'green',
    components: [],
  },
};
