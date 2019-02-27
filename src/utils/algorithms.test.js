import {
  findObjectPaths,
  getStringParams,
  injectValuesIntoString,
  renderTemplate,
} from './algorithms';

it('Find object paths', () => {
  const obj = {
    a: {
      b: {
        c: 'first',
      },
      c: {
        c: 'second',
      },
    },
    b: {
      b: 1,
    },
  };

  expect(findObjectPaths(obj, 'a.b.c')).toEqual(['a.b.c']);
  expect(findObjectPaths(obj, 'a.*.c')).toEqual(['a.b.c', 'a.c.c']);
  expect(findObjectPaths(obj, '*.b')).toEqual(['a.b', 'b.b']);
  expect(findObjectPaths(obj, '*.*')).toEqual(['a.b', 'a.c', 'b.b']);
  expect(findObjectPaths(obj, '*.*.c')).toEqual(['a.b.c', 'a.c.c']);
  expect(findObjectPaths(obj, '*.*.*')).toEqual(['a.b.c', 'a.c.c']);
  expect(findObjectPaths(obj, '*.*|a.b.c')).toEqual([
    'a.b',
    'a.c',
    'b.b',
    'a.b.c',
  ]);
  expect(findObjectPaths(obj, 'a.b,c')).toEqual(['a.b', 'a.c']);
  expect(findObjectPaths(obj, 'a.b,c.c')).toEqual(['a.b.c', 'a.c.c']);
  expect(findObjectPaths(obj, 'a.b,c.d')).toEqual([]);
  expect(findObjectPaths(obj, '*.*|a.b,c.c')).toEqual([
    'a.b',
    'a.c',
    'b.b',
    'a.b.c',
    'a.c.c',
  ]);
  expect(findObjectPaths(obj, '*')).toEqual(['a', 'b']);
  expect(findObjectPaths(obj, '*.b')).toEqual(['a.b', 'b.b']);
  expect(findObjectPaths(obj, '*.b.*')).toEqual(['a.b.c']);
  expect(findObjectPaths(obj, '*.*.*')).toEqual(['a.b.c', 'a.c.c']);
});

it('Get string params', () => {
  expect(getStringParams('test{{one}}')).toEqual(['one']);
  expect(getStringParams('{{two}}test')).toEqual(['two']);
  expect(getStringParams('{{three}}test{{four}}')).toEqual(['three', 'four']);
  expect(getStringParams('{{five}}{{six}}')).toEqual(['five', 'six']);
  expect(getStringParams('test{{seven}}test{{eight}}test')).toEqual([
    'seven',
    'eight',
  ]);
  expect(getStringParams('test{{nine}}{{ten}}')).toEqual(['nine', 'ten']);
  expect(getStringParams('test{{eleven}}{{twelve')).toEqual(['eleven']);
  expect(getStringParams('te}}st{{13{{14}}')).toEqual(['13{{14']);
  expect(getStringParams('te}}st{{}}')).toEqual(['']);
  expect(getStringParams('test(15)test', '(', ')')).toEqual(['15']);
  expect(getStringParams('test(16))))test', '(', '))))')).toEqual(['16']);
  expect(getStringParams('test(((17)test', '(((', ')')).toEqual(['17']);
  expect(getStringParams('test|18|test', '|', '|')).toEqual(['18']);
  expect(getStringParams('test|19|||20||', '|', '||')).toEqual(['19', '20']);
  expect(getStringParams('test||21|||22||', '|', '|||')).toEqual(['|21']);
});

it('Inject values into placeholders in string', () => {
  const obj = {
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    object: {
      ten: 10,
      eleven: 11,
      array: [1, 2, { tvelve: 12 }],
    },
  };

  expect(injectValuesIntoString('test', obj)).toEqual('test');
  expect(injectValuesIntoString('test{{one}}', obj)).toEqual('test1');
  expect(injectValuesIntoString('{{one}}', obj)).toEqual('1');
  expect(injectValuesIntoString('test{{one}}test', obj)).toEqual('test1test');
  expect(injectValuesIntoString('{{one}}test', obj)).toEqual('1test');
  expect(injectValuesIntoString('{{two}}test{{two}}', obj)).toEqual('2test2');
  expect(injectValuesIntoString('{{three}}test{{four}}', obj)).toEqual(
    '3test4',
  );
  expect(injectValuesIntoString('{{three}}test{{five}}', obj)).toEqual(
    '3test{{five}}',
  );
  expect(injectValuesIntoString('{{three}}test{{five}}', obj, '0')).toEqual(
    '3test0',
  );
  expect(injectValuesIntoString('{{five}}test{{five}}', obj)).toEqual(
    '{{five}}test{{five}}',
  );
  expect(injectValuesIntoString('{{five}}test{{five}}', obj, '0')).toEqual(
    '0test0',
  );
  expect(injectValuesIntoString('{{five}}', obj)).toEqual('{{five}}');
  expect(injectValuesIntoString('{{five:default}} test', obj, '')).toEqual(
    'default test',
  );
  expect(
    injectValuesIntoString('{{five:def}}test{{five:ault}}', obj, ''),
  ).toEqual('deftestault');
  expect(
    injectValuesIntoString('{{five:def}}test{{six:ault}}', obj, ''),
  ).toEqual('deftestault');
  expect(
    injectValuesIntoString('{{five:def}}test{{four:ault}}', obj, ''),
  ).toEqual('deftest4');
  expect(
    injectValuesIntoString(
      '{{five|nottothis}}test{{four|nice|hey}}',
      obj,
      '',
      '{{',
      '}}',
      ':',
      pipe => pipe,
    ),
  ).toEqual('testhey');
  expect(
    injectValuesIntoString(
      '{{five:default|tothis|hey}}test{{four|nice}}',
      obj,
      '',
      '{{',
      '}}',
      ':',
      pipe => pipe,
    ),
  ).toEqual('defaulttestnice');
  expect(
    injectValuesIntoString(
      '{{four:default|tothis|hey}}test{{five|nice}}',
      obj,
      '',
      '{{',
      '}}',
      ':',
      pipe => pipe,
    ),
  ).toEqual('heytest');
  expect(
    injectValuesIntoString(
      '{{four|to:this}}test',
      obj,
      '',
      '{{',
      '}}',
      ':',
      pipe => pipe,
    ),
  ).toEqual('to:thistest');
  expect(injectValuesIntoString('{{object.ten}}test', obj)).toEqual('10test');
  expect(injectValuesIntoString('{{object.tvelve:nope}}test', obj)).toEqual(
    'nopetest',
  );
  expect(injectValuesIntoString('{{object.array.0}}test', obj)).toEqual(
    '1test',
  );
  expect(injectValuesIntoString('{{object.array.2.tvelve}}test', obj)).toEqual(
    '12test',
  );
  expect(
    injectValuesIntoString('{{object.array.2.tvelve:shouldnotfire}}test', obj),
  ).toEqual('12test');
  expect(
    injectValuesIntoString('{{object.array.2.thirteen:fire}}test', obj),
  ).toEqual('firetest');
});

it('Render template', () => {
  const obj = {
    value: 'test',
  };

  expect(renderTemplate(`<span>{{value}}</span>`, obj)).toBe(
    `<span>test</span>`,
  );
});

it('Render template with single loop', () => {
  const obj = {
    value: 'test',
    values: ['test1', 'test2', 'test3'],
    objects: [{ value: 'test1' }, { value: 'test2' }, { value: 'test3' }],
  };

  expect(
    renderTemplate(`<ul>{{#each values}}<li>{{this}}</li>{{#end}}</ul>`, obj),
  ).toBe(`<ul><li>test1</li><li>test2</li><li>test3</li></ul>`);
  expect(renderTemplate(`{{#each values}}<li>{{this}}</li>{{#end}}`, obj)).toBe(
    `<li>test1</li><li>test2</li><li>test3</li>`,
  );
  expect(
    renderTemplate(`{{#each objects}}<li>{{this.value}}</li>{{#end}}`, obj),
  ).toBe(`<li>test1</li><li>test2</li><li>test3</li>`);
  expect(
    renderTemplate(`{{#each objects}}<li>{{value}}</li>{{#end}}`, obj),
  ).toBe(`<li>test1</li><li>test2</li><li>test3</li>`);
  expect(
    renderTemplate(`{{#each objects}}<li>{{$index}}</li>{{#end}}`, obj),
  ).toBe(`<li>0</li><li>1</li><li>2</li>`);
  expect(
    renderTemplate(
      `{{#each objects.slice(0, 2)}}<li>{{$index}}</li>{{#end}}`,
      obj,
    ),
  ).toBe(`<li>0</li><li>1</li>`);
  expect(
    renderTemplate(
      `{{#each ['nice', 1, null]}}<li>{{this}}{{$index}}</li>{{#end}}`,
      obj,
    ),
  ).toBe(`<li>nice0</li><li>11</li><li>null2</li>`);
  expect(
    renderTemplate(
      `{{#each ['nice', 1, null]}}<li>{{this}}{{$root.value}}</li>{{#end}}`,
      obj,
    ),
  ).toBe(`<li>nicetest</li><li>1test</li><li>nulltest</li>`);
}, 1000);

it('Render template with multiple loops', () => {
  const obj = {
    value: 'test',
    values: ['test1', 'test2', 'test3'],
    objects: [{ value: 'test1' }, { value: 'test2' }, { value: 'test3' }],
  };

  expect(
    renderTemplate(
      `<ul>{{#each values}}<li>{{this}}</li>{{#end}}</ul>
<ol>{{#each objects}}<li>{{$index}}</li>{{#end}}</ol>`,
      obj,
    ),
  ).toBe(`<ul><li>test1</li><li>test2</li><li>test3</li></ul>
<ol><li>0</li><li>1</li><li>2</li></ol>`);
  expect(
    renderTemplate(
      `{{#each values}}<li>{{this}}</li>{{#end}}{{#each objects}}
  <li>{{$index}}</li>{{#end}}`,
      obj,
    ),
  ).toBe(`<li>test1</li><li>test2</li><li>test3</li>
  <li>0</li>
  <li>1</li>
  <li>2</li>`);
}, 1000);

it('Render template with loop and pipes', () => {
  const obj = {
    value: 'test',
    values: ['test1', 'test2', 'test3'],
    objects: [{ value: 'test1' }, { value: 'test2' }, { value: 'test3' }],
  };

  expect(
    renderTemplate(
      `<ul>{{#each values}}<li>{{this|apipe}}</li>{{#end}}</ul>
<ol>{{#each objects}}<li>{{$index|double}}</li>{{#end}}</ol>`,
      obj,
      {
        pipeFunction: (pipeName, _, input) =>
          pipeName === 'apipe' ? pipeName : parseInt(input) * 2,
      },
    ),
  ).toBe(`<ul><li>apipe</li><li>apipe</li><li>apipe</li></ul>
<ol><li>0</li><li>2</li><li>4</li></ol>`);
}, 1000);
