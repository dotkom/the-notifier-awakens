import {
  format,
  addMinutes,
  addHours,
  addDays,
  addMonths,
  addYears,
} from 'date-fns';
import * as locale from 'date-fns/locale/nb';

export const pipes = {
  date: (input, params) => {
    if (params.length > 0) {
      return format(input, params.join(' '), { locale });
    } else {
      return format(input, 'YYYY-MM-DD', { locale });
    }
  },
  time: (input, params) => {
    if (params.length > 0) {
      return format(input, params.join(' '), { locale });
    } else {
      return format(input, 'HH:mm:ss', { locale });
    }
  },
  datetime: (input, params) => {
    if (params.length > 0) {
      return format(input, params.join(' '), { locale });
    } else {
      return format(input, 'YYYY-MM-DD HH:mm:ss', { locale });
    }
  },
  addminutes: (input, params) => {
    if (params.length > 0) {
      return addMinutes(input, parseInt(params[0]));
    } else {
      return addMinutes(input, 1);
    }
  },
  addhours: (input, params) => {
    if (params.length > 0) {
      return addHours(input, parseInt(params[0]));
    } else {
      return addHours(input, 1);
    }
  },
  adddays: (input, params) => {
    if (params.length > 0) {
      return addDays(input, parseInt(params[0]));
    } else {
      return addDays(input, 1);
    }
  },
  addmonths: (input, params) => {
    if (params.length > 0) {
      return addMonths(input, parseInt(params[0]));
    } else {
      return addMonths(input, 1);
    }
  },
  addyears: (input, params) => {
    if (params.length > 0) {
      return addYears(input, parseInt(params[0]));
    } else {
      return addYears(input, 1);
    }
  },
  '+': (input, params) => {
    if (params.length > 0) {
      return parseInt(input) + parseInt(params[0]) + '';
    }
    return parseInt(input) + 1 + '';
  },
  '-': (input, params) => {
    if (params.length > 0) {
      return parseInt(input) - parseInt(params[0]) + '';
    }
    return parseInt(input) - 1 + '';
  },
  '*': (input, params) => {
    if (params.length > 0) {
      return parseInt(input) * parseInt(params[0]) + '';
    }
    return input;
  },
  '/': (input, params) => {
    if (params.length > 0) {
      return parseInt(input) / parseInt(params[0]) + '';
    }
    return input;
  },
  lower: (input, params) => {
    return input.toLowerCase();
  },
  upper: (input, params) => {
    return input.toUpperCase();
  },
  front: (input, params) => {
    return params.join(' ') + input;
  },
  back: (input, params) => {
    return input + params.join(' ');
  },
  count: (input, params) => {
    if (params.length > 0) {
      if (params.length > 1) {
        return input.slice(parseInt(params[0]), parseInt(params[1])).length;
      }
      return input.slice(parseInt(params[0])).length;
    }
    return input.length;
  },
  slice: (input, params) => {
    if (params.length > 0) {
      if (params.length > 1) {
        return input.slice(parseInt(params[0]), parseInt(params[1]));
      }
      return input.slice(parseInt(params[0]));
    }
    return input;
  },
  ifeq: (input, params) => {
    if (params.length > 0 && input === params[0]) {
      return params.length > 1 ? params.slice(1).join(' ') : input;
    }
    return '';
  },
  ifcontains: (input, params) => {
    if (params.length > 0) {
      if (~input.indexOf(params[0])) {
        return params.length > 1 ? params[1] : input;
      } else if (params.length > 2) {
        return params[2];
      }
    }
    return '';
  },
  ifmatches: (input, params) => {
    if (params.length > 0) {
      if (new RegExp(params[0]).test(input)) {
        return params.length > 1 ? params[1] : input;
      } else if (params.length > 2) {
        return params[2];
      }
    }
    return '';
  },
  ifeqelse: (input, params) => {
    if (params.length > 0) {
      if (input === params[0]) {
        return params.length > 1 ? params[1] : '';
      } else {
        return params.length > 2 ? params[2] : '';
      }
    }
    return '';
  },
  ifnoteq: (input, params) => {
    if (params.length > 0 && input !== params[0]) {
      return params.length > 1 ? params.slice(1).join(' ') : input;
    }
    return '';
  },
  then: (input, params) => {
    if (input && params.length > 0) {
      return params[0];
    }
    return '';
  },
};

export const pipeAliases = {
  addminute: 'addminutes',
  addhour: 'addhours',
  addday: 'adddays',
  addmonth: 'addmonths',
  addyear: 'addyears',
  plus: '+',
  add: '+',
  minus: '-',
  sub: '-',
  subtract: '-',
  div: '/',
  divBy: '/',
  divide: '/',
  divideBy: '/',
  mult: '*',
  multBy: '*',
  multiply: '*',
  multiplyBy: '*',
  prefix: 'front',
  postfix: 'back',
  addstr: 'back',
  chop: 'slice',
  eq: 'ifeq',
  equals: 'ifeq',
  '=?': 'ifeq',
  '=?:': 'ifeqelse',
  ifcontain: 'ifcontains',
  contains: 'ifcontains',
  contain: 'ifcontains',
  ifmatch: 'ifmatches',
  matches: 'ifmatches',
  match: 'ifmatches',
  '=>': 'then',
};

export const pipeTransform = (pipe, params, input, _pipes = pipes) => {
  const lowerPipe = pipe.toLowerCase();
  if (lowerPipe in _pipes) {
    return _pipes[lowerPipe](input, params);
  } else if (lowerPipe in pipeAliases) {
    return _pipes[pipeAliases[lowerPipe]](input, params);
  }

  throw new Error(`Pipe: ${pipe}, does not exist`);
};
