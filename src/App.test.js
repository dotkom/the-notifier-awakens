import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, withRouter } from 'react-router-dom';
import App from './App';

it('renders without crashing', () => {
  const div = document.createElement('div');
  const Root = withRouter(App);
  ReactDOM.render(
    <Router>
      <Root />
    </Router>,
    div,
  );
  ReactDOM.unmountComponentAtNode(div);
});

it('get correct grid-template value', () => {
  const app = new App();
  expect(app.getGridTemplateFromLayoutArray(['a b', 'a b'])).toEqual(
    '"a b" "a b" / 1fr 1fr',
  );
  expect(app.getGridTemplateFromLayoutArray(['a a', '. b b '])).toEqual(
    '"a a ." ". b b" / 1fr 1fr 1fr',
  );
  expect(app.getGridTemplateFromLayoutArray(['a ', 'a b  b'])).toEqual(
    '"a . ." "a b b" / 1fr 1fr 1fr',
  );
  expect(app.getGridTemplateFromLayoutArray(['a b', '. .  .'])).toEqual(
    '"a b ." ". . ." 1fr / 1fr 1fr 1fr',
  );
});

it('get correct grid-template value (using "/" as row sizing)', () => {
  const app = new App();
  expect(
    app.getGridTemplateFromLayoutArray(['a / auto', 'a b  b / 2 ']),
  ).toEqual('"a . ." auto "a b b" 2fr / 1fr 1fr 1fr');
  expect(app.getGridTemplateFromLayoutArray(['a b', '. .  . / 3'])).toEqual(
    '"a b ." ". . ." 3fr / 1fr 1fr 1fr',
  );
  expect(app.getGridTemplateFromLayoutArray(['a b c', ' .  . / auto'])).toEqual(
    '"a b c" ". . ." auto / 1fr 1fr 1fr',
  );
});

it('get correct grid-template value (using plain strings)', () => {
  const app = new App();
  expect(
    app.getGridTemplateFromLayoutArray('"a b c" "a . ." 1fr / repeat(3, 1fr)"'),
  ).toEqual('"a b c" "a . ." 1fr / repeat(3, 1fr)"');
});

it('get correct grid-template value (using "/" as column sizing)', () => {
  const app = new App();
  expect(app.getGridTemplateFromLayoutArray(['a b c', '.', '/'])).toEqual(
    '"a b c" ". . ." 1fr / 1fr 1fr 1fr',
  );
  expect(
    app.getGridTemplateFromLayoutArray(['a b c', '.', '/ 100px 1fr auto']),
  ).toEqual('"a b c" ". . ." 1fr / 100px 1fr auto');
  expect(app.getGridTemplateFromLayoutArray(['/ 100px', 'a b c', '.'])).toEqual(
    '"a b c" ". . ." 1fr / 100px 1fr 1fr',
  );
  expect(
    app.getGridTemplateFromLayoutArray(['/ . 100px .', 'a b c d', '.']),
  ).toEqual('"a b c d" ". . . ." 1fr / 1fr 100px 1fr 1fr');
});

it('get correct grid-template value (using "|" as column splitter)', () => {
  const app = new App();
  expect(
    app.getGridTemplateFromLayoutArray(['a b', '.', 'c d', '/ 100px . |']),
  ).toEqual('"a b ." ". . ." 1fr "c d ." / 100px 1fr 1fr');
  expect(
    app.getGridTemplateFromLayoutArray(['a b', '.', 'c d', '/ | 100px .']),
  ).toEqual('". a b" ". . ." 1fr ". c d" / 1fr 100px 1fr');
  expect(
    app.getGridTemplateFromLayoutArray(['a b', '.', 'c d', '/ | 100px . |']),
  ).toEqual('". a b ." ". . . ." 1fr ". c d ." / 1fr 100px 1fr 1fr');
  expect(
    app.getGridTemplateFromLayoutArray(['a b', '.', 'c d', '/ 100px | 1fr']),
  ).toEqual('"a . b" ". . ." 1fr "c . d" / 100px 1fr 1fr');
  expect(
    app.getGridTemplateFromLayoutArray([
      'a a b',
      '.',
      'c d d',
      '/ 100px | 1fr',
    ]),
  ).toEqual('"a a a b" ". . . ." 1fr "c . d d" / 100px 1fr 1fr 1fr');
  expect(
    app.getGridTemplateFromLayoutArray([
      'a a a a b',
      '.',
      'c c . d d',
      '/ 100px | 1fr 100px',
    ]),
  ).toEqual(
    '"a a a a a b" ". . . . . ." 1fr "c c c . d d" / 100px 1fr 1fr 100px 1fr 1fr',
  );
});

it('get correct grid-template value (using "|value" as column splitter)', () => {
  const app = new App();
  expect(
    app.getGridTemplateFromLayoutArray(['a b', '.', 'c d', '/ 100px . |100px']),
  ).toEqual('"a b ." ". . ." 1fr "c d ." / 100px 1fr 100px');
  expect(
    app.getGridTemplateFromLayoutArray(['a b', '.', 'c d', '/ |1em 100px .']),
  ).toEqual('". a b" ". . ." 1fr ". c d" / 1em 100px 1fr');
  expect(
    app.getGridTemplateFromLayoutArray([
      'a b',
      '.',
      'c d',
      '/ |100px 100px . |',
    ]),
  ).toEqual('". a b ." ". . . ." 1fr ". c d ." / 100px 100px 1fr 1fr');
  expect(
    app.getGridTemplateFromLayoutArray(['a b', '.', 'c d', '/ 100px |2fr 1fr']),
  ).toEqual('"a . b" ". . ." 1fr "c . d" / 100px 2fr 1fr');
});

it('get correct default grid-template from components', () => {
  const app = new App();

  const components = [
    { template: 'Bus' },
    { template: 'Clock' },
    { template: 'Office' },
  ];

  expect(app.generateDefaultGridTemplateFromComponents(components, 1)).toEqual([
    'Bus',
    'Clock',
    'Office',
  ]);
  expect(app.generateDefaultGridTemplateFromComponents(components, 2)).toEqual([
    'Bus Clock',
    'Office .',
  ]);
  expect(app.generateDefaultGridTemplateFromComponents(components, 3)).toEqual([
    'Bus Clock Office',
  ]);
});
