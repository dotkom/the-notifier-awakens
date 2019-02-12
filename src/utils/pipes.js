import { format, addDays, addHours, addYears } from 'date-fns';
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
  addday: (input, params) => {
    if (params.length > 0) {
      return addDays(input, parseInt(params[0]));
    } else {
      return addDays(input, 1);
    }
  },
  addhour: (input, params) => {
    if (params.length > 0) {
      return addHours(input, parseInt(params[0]));
    } else {
      return addHours(input, 1);
    }
  },
  addyear: (input, params) => {
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
    if (params.length > 0 && ~input.indexOf(params[0])) {
      return params.length > 1 ? params.slice(1).join(' ') : input;
    }
    return '';
  },
  ifmatches: (input, params) => {
    if (params.length > 0 && new RegExp(input).test(params[0])) {
      return params.length > 1 ? params.slice(1).join(' ') : input;
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
};

export const pipeTransform = (pipe, params, input, _pipes = pipes) => {
  if (pipe in _pipes) {
    return _pipes[pipe](
      input,
      params,
    );
  }

  throw new Error(`Pipe: ${pipe}, does not exist`);
};