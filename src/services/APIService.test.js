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
