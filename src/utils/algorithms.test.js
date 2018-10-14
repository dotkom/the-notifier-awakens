import { findObjectPaths, getStringParams, injectValuesIntoString } from './algorithms';

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

  expect(findObjectPaths(obj, 'a.b.c')).toEqual([ 'a.b.c' ]);
  expect(findObjectPaths(obj, 'a.*.c')).toEqual([ 'a.b.c', 'a.c.c' ]);
  expect(findObjectPaths(obj, '*.b')).toEqual([ 'a.b', 'b.b' ]);
  expect(findObjectPaths(obj, '*.*')).toEqual([ 'a.b', 'a.c', 'b.b' ]);
  expect(findObjectPaths(obj, '*.*.c')).toEqual([ 'a.b.c', 'a.c.c' ]);
  expect(findObjectPaths(obj, '*.*.*')).toEqual([ 'a.b.c', 'a.c.c' ]);
  expect(findObjectPaths(obj, '*.*|a.b.c')).toEqual([ 'a.b', 'a.c', 'b.b', 'a.b.c' ]);
  expect(findObjectPaths(obj, 'a.b,c')).toEqual([ 'a.b', 'a.c' ]);
  expect(findObjectPaths(obj, 'a.b,c.c')).toEqual([ 'a.b.c', 'a.c.c' ]);
  expect(findObjectPaths(obj, 'a.b,c.d')).toEqual([]);
  expect(findObjectPaths(obj, '*.*|a.b,c.c')).toEqual([ 'a.b', 'a.c', 'b.b', 'a.b.c', 'a.c.c' ]);
});

it('Get string params', () => {
  expect(getStringParams('test{{one}}')).toEqual([ 'one' ]);
  expect(getStringParams('{{two}}test')).toEqual([ 'two' ]);
  expect(getStringParams('{{three}}test{{four}}')).toEqual([ 'three', 'four' ]);
  expect(getStringParams('{{five}}{{six}}')).toEqual([ 'five', 'six' ]);
  expect(getStringParams('test{{seven}}test{{eight}}test')).toEqual([ 'seven', 'eight' ]);
  expect(getStringParams('test{{nine}}{{ten}}')).toEqual([ 'nine', 'ten' ]);
  expect(getStringParams('test{{eleven}}{{twelve')).toEqual([ 'eleven' ]);
  expect(getStringParams('te}}st{{13{{14}}')).toEqual([ '13{{14' ]);
  expect(getStringParams('te}}st{{}}')).toEqual([ '' ]);
  expect(getStringParams('test(15)test', '(', ')')).toEqual([ '15' ]);
  expect(getStringParams('test(16))))test', '(', '))))')).toEqual([ '16' ]);
  expect(getStringParams('test(((17)test', '(((', ')')).toEqual([ '17' ]);
  expect(getStringParams('test|18|test', '|', '|')).toEqual([ '18' ]);
  expect(getStringParams('test|19|||20||', '|', '||')).toEqual([ '19', '20' ]);
  expect(getStringParams('test||21|||22||', '|', '|||')).toEqual([ '|21' ]);
});

it('Inject values into placeholders in string', () => {
  const obj = {
    one: 1,
    two: 2,
    three: 3,
    four: 4,
  };

  expect(injectValuesIntoString('test', obj)).toEqual('test');
  expect(injectValuesIntoString('test{{one}}', obj)).toEqual('test1');
  expect(injectValuesIntoString('{{one}}', obj)).toEqual('1');
  expect(injectValuesIntoString('test{{one}}test', obj)).toEqual('test1test');
  expect(injectValuesIntoString('{{one}}test', obj)).toEqual('1test');
  expect(injectValuesIntoString('{{two}}test{{two}}', obj)).toEqual('2test2');
  expect(injectValuesIntoString('{{three}}test{{four}}', obj)).toEqual('3test4');
  expect(injectValuesIntoString('{{three}}test{{five}}', obj)).toEqual('3test{{five}}');
  expect(injectValuesIntoString('{{three}}test{{five}}', obj, '0')).toEqual('3test0');
  expect(injectValuesIntoString('{{five}}test{{five}}', obj)).toEqual('{{five}}test{{five}}');
  expect(injectValuesIntoString('{{five}}test{{five}}', obj, '0')).toEqual('0test0');
  expect(injectValuesIntoString('{{five}}', obj)).toEqual('{{five}}');
});
