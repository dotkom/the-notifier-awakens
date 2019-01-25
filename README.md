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
    print: true, // Print results into the browser console
    url: `https://api.github.com/users/{{users.*}}/repos`, // Create multiple URLs from users. Currently 'dotkom' is the only user
    users: {
      dotkom: 'dotkom',
    },
  },
  ...
```

The code above will generate a URL that can be accessed using `github.users.dotkom`.

The fetch call above is not called unless a component asks for it. (More on that in the next section about components.)

More examples:

<details>
<summary>Plain REST example</summary>

```javascript
  ...
  githubDotKom: {
    interval: 60,
    url: `https://api.github.com/users/dotkom`,
  },
  ...
```

Available through: `githubDotkom`

</details>

<details>
<summary>Transform the API output before it is passed to components</summary>

We use STJS to transform the input from the API data. This is for example useful when using multiple event APIs and you want a spesific structure on the data passed to the components.

You can read about STJS transforms here: https://selecttransform.github.io/site/transform.html

```diff
  ...
  githubDotKom: {
    interval: 60,
    url: `https://api.github.com/users/dotkom`,
+   transform: {
+     image: '{{avatar_url}}',
+     description: '{{bio}}',
+     url: '{{html_url}}',
+   }
  },
  ...
```

Output:

```javascript
{
  image: 'https://avatars0.githubusercontent.com/u/693951?v=4',
  description: 'Drifts- og utviklingskomiteen i Online, linjeforeningen for Informatikk ved NTNU.',
  url: 'https://github.com/dotkom',
}
```

</details>

<details>
<summary>Dealing with RSS feeds</summary>

When dealing with other formats than JSON, you can specify this by appending these to the URL:

- `{URL}#GET (JSON => JSON)`
- `{URL}#POST[#body] (JSON => JSON)`
- `{URL}#RSS (XML => JSON)`
- `{URL}#HTML[:query-selector[(at)attribute]] (HTML => HTML)`
- `{URL}#TEXT (Plain text => Plain text)`
- More info on this in `./src/defaults/apis.js`.

```javascript
  ...
  redditArticles: {
    interval: 86400,
    url: `https://www.reddit.com/.rss#RSS`, // <-- Appended #RSS
    transform: {
      articles: {
        '{{#each feed.entry}}': {
          title: '{{title[0]}}',
          date: '{{updated[0]}}',
          link: '{{link[0].$.href}}',
          author: '{{author[0].name}}',
          image: 'https://www.redditstatic.com/new-icon.png',
        },
      },
    },
  },
  ...
```

Output:

```javascript
{
  articles: [
    {
      title: 'Witcher III (My last comic)',
      date: '1970-01-01T23:41:07+00:00',
      link: 'https://www.reddit.com/r/gaming/comments/ajdml1/witcher_iii_my_last_comic/',
      author: '/u/SrGrafo',
      image: 'https://www.redditstatic.com/new-icon.png',
    },
    ...
  ]
}
```

</details>

<details>
<summary>Dealing with RSS feeds (And scraping images from each feed element)</summary>

```diff
  ...
  vgArticles: {
    interval: 86400,
    url: `https://www.vg.no/rss/feed/?categories=1068&limit=10#RSS`,
+   cache: true,
+   scrape: ['articles.*.author'],
    transform: {
      articles: {
        '{{#each rss.channel[0].item}}': {
          title: '{{title[0]}}',
          date: '{{pubDate[0]}}',
          link: '{{link[0]}}',
+         author: '[[{{link[0]}}#HTML:article > div > ul > li]]',
          image: '{{image[0]}}',
        },
      },
    },
  },
  ...
```

Output:

```javascript
{
  articles: [
    {
      title: 'Tittel på artikkel',
      date: 'Thu, 01 Jan 1970 23:01:00 +0100',
      link: 'http://www.vg.no/nyheter/innenriks/...',
      author: 'Ola Normann',
      image: 'https://imbo.vgc.no/users/vgno/images/451f60dc338...',
    },
    ...
  ]
}
```

</details>

<details>
<summary>Scrape HTML content from any website</summary>

A lot of websites does not have a JSON API and it is therefore handy to be able to fetch spesific data from an element in a HTML document.

The syntax for retrieving HTML is like this:

- `{URL}#HTML[:query-selector[(at)attribute]] (HTML => HTML)`

```diff
  ...
  komplett: {
    interval: 60,
+    url: `https://www.komplett.no/product/823822/tv-lyd-bilde/hodetelefoner/hodetelefoner/bose-qc-25-hodetelefon-apple#HTML:.product-main-info-stockstatus > div > div > span`,
+    cors: true,
  },
  ...
```

Output:

```javascript
{
  state: '20+ stk. på lager.',
}
```

</details>

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
