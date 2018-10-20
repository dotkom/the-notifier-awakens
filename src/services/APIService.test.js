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
  expect(result.urls).toEqual([
    'http://.../23/0',
    'http://.../23/1',
    'http://.../20/0',
    'http://.../20/1',
    'http://.../10/0',
    'http://.../10/1',
  ]);
  expect(result.urls.length).toBe(6);
});
