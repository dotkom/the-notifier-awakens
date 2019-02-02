import { format } from 'date-fns';
import * as locale from 'date-fns/locale/nb';

export const pipes = {
  date: (input, params) => {
    if (params.length > 0) {
      return format(input, params.join(' '), { locale });
    } else {
      return format(input, 'DD MMM YYYY', { locale });
    }
  },
  time: (input, params) => {
    if (params.length > 0) {
      return format(input, params.join(' '), { locale });
    } else {
      return format(input, 'HH:mm', { locale });
    }
  },
  datetime: (input, params) => {
    if (params.length > 0) {
      return format(input, params.join(' '), { locale });
    } else {
      return format(input, 'DD MMM YYYY (HH:mm)', { locale });
    }
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
