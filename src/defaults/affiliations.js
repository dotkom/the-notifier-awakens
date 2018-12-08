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
    components: [
      {
        template: 'Clock',
      },
      {
        template: 'Clock-2',
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
          fromCity: 'enturbus.stops.{{bus:glossyd}}.fromCity:departures',
          toCity: 'enturbus.stops.{{bus:glossyd}}.toCity:departures',
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
  delta: {
    color: '#030',
    components: [
      {
        template: 'Articles',
        apis: {
          articles: 'deltaArticles:articles',
        },
        css: '.Articles .article { background-size: contain; }',
      },
    ],
  },
};
