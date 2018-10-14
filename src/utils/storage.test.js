import Storage from './storage';

it('Stores device data', () => {
  let data = {
    apis: {
      key: 'value',
    },
    components: [
      {
        template: 'Bus',
        props: {},
      },
      {
        template: 'Bus',
        props: {},
      },
    ],
  };

  let storage = new Storage(data);

  expect(storage.get('apis')).toEqual({ key: 'value' });
  expect(storage.get('apis.key')).toEqual('value');
  expect(storage.set('apis.key', 'new value')).toEqual('value');
  expect(storage.get('apis.key')).toEqual('new value');

  expect(storage.get('components.0.template')).toEqual('Bus');
  expect(storage.set('components.0.template')).toEqual('Bus');
  expect(storage.get('components.0.template')).toBeUndefined();

  expect(storage.merge({ apis2: 'value' })).toEqual({
    apis2: 'value',
    apis: {
      key: 'new value',
    },
    components: [
      {
        template: undefined,
        props: {},
      },
      {
        template: 'Bus',
        props: {},
      },
    ],
  });

  expect(storage.has('components.1.template')).toBeTruthy();
  expect(storage.has('components.1.nokey')).toBeFalsy();
  expect(storage.has('components.1.nokey.key')).toBeFalsy();
});
