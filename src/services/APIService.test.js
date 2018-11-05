import APIService from './APIService';

it('Generates URLs', () => {
  const api = {
    url: 'http://.../{{id.*}}/{{from,to}}',
    id: {
      online: '23',
      abakus: '20',
      delta: '10',
    },
    from: 0,
    to: 1,
  };

  const result = APIService.generateURLs(api, 'bus');
  expect(result).toEqual({
    'bus.id.online.from': 'http://.../23/0',
    'bus.id.online.to': 'http://.../23/1',
    'bus.id.abakus.from': 'http://.../20/0',
    'bus.id.abakus.to': 'http://.../20/1',
    'bus.id.delta.from': 'http://.../10/0',
    'bus.id.delta.to': 'http://.../10/1',
  });
});

it('Generates URLs for POST requests', () => {
  const api = {
    url: 'http://.../{{id.*}}',
    method: 'POST',
    body: '{"somejson":"{{from,to}}"}',
    id: {
      online: '23',
      abakus: '20',
      delta: '10',
    },
    from: 0,
    to: 1,
  };

  const result = APIService.generateURLs(api, 'bus');
  expect(result).toEqual({
    'bus.id.online.from': 'http://.../23#POST#{"somejson":"0"}',
    'bus.id.online.to': 'http://.../23#POST#{"somejson":"1"}',
    'bus.id.abakus.from': 'http://.../20#POST#{"somejson":"0"}',
    'bus.id.abakus.to': 'http://.../20#POST#{"somejson":"1"}',
    'bus.id.delta.from': 'http://.../10#POST#{"somejson":"0"}',
    'bus.id.delta.to': 'http://.../10#POST#{"somejson":"1"}',
  });
});

it('Generates URLs for POST requests inline', () => {
  const api = {
    url: 'http://.../{{id.*}}#POST#{"somejson":"{{from,to}}"}',
    id: {
      online: '23',
      abakus: '20',
      delta: '10',
    },
    from: 0,
    to: 1,
  };

  const result = APIService.generateURLs(api, 'bus');
  expect(result).toEqual({
    'bus.id.online.from': 'http://.../23#POST#{"somejson":"0"}',
    'bus.id.online.to': 'http://.../23#POST#{"somejson":"1"}',
    'bus.id.abakus.from': 'http://.../20#POST#{"somejson":"0"}',
    'bus.id.abakus.to': 'http://.../20#POST#{"somejson":"1"}',
    'bus.id.delta.from': 'http://.../10#POST#{"somejson":"0"}',
    'bus.id.delta.to': 'http://.../10#POST#{"somejson":"1"}',
  });
});
