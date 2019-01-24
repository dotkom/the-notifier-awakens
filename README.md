![NotiStar](https://i.imgur.com/i78hOG1.png)

<!--![Storytime](https://i.imgur.com/ZXXFkQM.png)-->

It has been a dark time for
Notifier, but there is still
hope. A new era has arrived.
The previous Notifier major version
was controlled by Dart jQuery and
Vanilla JavaScript. In an attempt
to rescue Notifier, a few of
dotkom's people went together
and created a React App. This app
was fused with Notifier, giving
it strength and power one could
not even imagine was possible
in 2014...

## Development

```bash
yarn # Install dependencies
yarn start # Start development
```

## How it works

### 1. Fetch data

First the app starts a fetch schedule described by `./src/defaults/apis.js`. A fetch sequence looks like this (more details in `./src/defaults/apis.js`):

```javascript
  ...
  github: {
    interval: 60, // Fetch every 60th second
    url: `https://api.github.com/users/{{users.*}}`, // Create multiple URLs from users. Currently 'dotkom' is the only user
    users: {
      dotkom: 'dotkom',
    },
  },
  ...
```

The fetch call above is not called unless a component asks for it.

### 2. Manage components

To use the data from the API's you need a component to pass the data into. Components for each affiliation (linjeforening) is described in `./src/defaults/affiliations.js`. Each affiliation can have a set of components:

```diff
  ...
  dotkom: { // Select affiliation in `./src/defaults/settings.js`
    name: 'DotKom',
    components: [
+     {
+       template: 'Clock',
+     },
+     {
+       template: 'GitHub',
+       apis: {
+         repos: 'github.user.dotkom',
+       },
+     },
    ],
  },
  ...
```

### 3. Fix layout

Most times you want to specify a layout. This can eighter be fixed using plain CSS or the inbuilt app grid systemᵗᵐ. Here is an example from both:

<details open>
<summary>The app grid systemᵗᵐ (preferred)</summary>

```diff
  ...
  dotkom: {
    name: 'DotKom',
+   layouts: {
+     0: ['Clock', 'GitHub'], // From 0 to 511px
+     512: ['Clock GitHub'], // From 512px and out
+   },
    components: [
      'Clock', // Can shorten components using strings if only defaults are used
      {
        template: 'GitHub',
        ...
      },
    ],
  },
  ...
```

</details>

<details>
<summary>Equivalent example in plain CSS</summary>

```diff
  ...
  dotkom: {
    name: 'DotKom',
+   layouts: {}, // Deactivate layout generator
+   css: `
+   .Components {
+     grid-template: "Clock" "GitHub" / 1fr;
+   }
+   @media (min-width: 512px) {
+     .Components {
+       grid-template: "Clock GitHub" / 1fr 1fr;
+     }
+   }`,
    components: [
      'Clock',
      {
        template: 'GitHub',
        ...
      },
    ],
  },
  ...
```

</details>

If no `layouts` are specified, the layout will be autogenerated based on the component order and screen width.
