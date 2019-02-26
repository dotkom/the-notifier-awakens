/**
 * This file is intended to create useful and testable functions for the project.
 */
import { get, has } from 'object-path';

/**
 * List all matching object paths by using a simple string.
 *
 * Examples:
 * ```
object = {
  a: {
    b: {
      c: 'first'
    },
    c: {
      c: 'second'
    }
  }
}

findObjectPaths(object, 'a.b.c') => [ 'a.b.c' ]
findObjectPaths(object, 'a.*.c') => [ 'a.b.c', 'a.c.c' ]
findObjectPaths(object, 'a.b,c|a.c.*') => [ 'a.b', 'a.c', 'a.c.c' ]
 * ```
 * @param {object} object Object to search through
 * @param {string} schema Filter to select what to return from object
 *
 * @returns {array} Array of matching paths
 */
export const findObjectPaths = (object, schema = '') => {
  // Check if a "|" is in the schema. If found, then split by "|"
  // and run findObjectPaths function over them again and avoid
  // duplicates.
  if (schema.indexOf('|') !== -1) {
    let results = [];
    for (let part of schema.split('|')) {
      let result = findObjectPaths(object, part);
      for (let path of result) {
        if (results.indexOf(path) === -1) {
          results.push(path);
        }
      }
    }

    return results;
  }

  // If no splits, "|", are occurring, do a search
  let keys = schema.split('.');
  let results = [[]];

  // Go through each key
  for (let key of keys) {
    let newResults = [];

    // Search through all matches in object at current depth
    if (key === '*') {
      for (let index in results) {
        let path = results[index];
        if (has(object, path)) {
          for (let next in get(object, path)) {
            newResults.push(path.concat(next));
          }
        }
      }
    }

    // If there are finite possibilities we know the
    // paths to search through.
    else {
      for (let option of key.split(',')) {
        for (let index in results) {
          let path = results[index].concat([option]);
          if (has(object, path)) {
            newResults.push(path);
          }
        }
      }
    }

    results = newResults;
  }

  return results.map(result => result.join('.'));
};

/**
 * Return all matches found in a string encapsulated by substrings.
 *
 * Examples:
 * ```
getStringParams('test{{one}}') => [ 'one' ]
getStringParams('{{two}}test') => [ 'two' ]
getStringParams('{{three}}test{{four}}') => [ 'three', 'four' ]
 * ```
 * @param {string} string The String to search through
 * @param {string} start Start of match
 * @param {string} end End of match
 *
 * @returns {array} Array of matches
 */
export const getStringParams = (string, start = '{{', end = '}}') => {
  const offsetStart = start.length;
  const offsetEnd = end.length;

  let indexStart = string.indexOf(start);
  let index = indexStart;
  let result = [];

  while (indexStart !== -1) {
    let indexEnd = string.slice(index + offsetStart).indexOf(end);

    if (indexEnd === -1) {
      break;
    }

    result.push(
      string.slice(index + offsetStart, index + offsetStart + indexEnd),
    );
    indexStart = string
      .slice(index + offsetStart + indexEnd + offsetEnd)
      .indexOf(start);
    index += indexEnd + offsetEnd + indexStart + offsetStart;
  }

  return result;
};

/**
 * Inject values from object into string at marked locations.
 *
 * Examples:
 * ```
const obj = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
};

injectValuesIntoString('test{{one}}', obj) => 'test1'
injectValuesIntoString('{{one}}test', obj) => '1test'
injectValuesIntoString('test{{one}}test', obj) => 'test1test'
injectValuesIntoString('{{two}}test{{two}}', obj) => '2test2'
injectValuesIntoString('{{three}}test{{four}}', obj) => '3test4'
injectValuesIntoString('{{three}}test{{five}}', obj) => '3test{{five}}'
injectValuesIntoString('{{three}}test{{five}}', obj, '0') => '3test0'
injectValuesIntoString('{{five:default}} test', obj, '', '{{', '}}') => 'default test'
injectValuesIntoString('{{five:def}}test{{five:ault}}', obj, '', '{{', '}}') => 'deftestault'
injectValuesIntoString('{{five:def}}test{{six:ault}}', obj, '', '{{', '}}') => 'deftestault'
injectValuesIntoString('{{five:def}}test{{four:ault}}', obj, '', '{{', '}}') => 'deftest4'
 * ```
 * @param {string} string The String to search through
 * @param {object} values An object with all values that can fit the keys
 * @param {string} fallbackValue Default value if no keys in values matches
 * @param {string} start Start of match
 * @param {string} end End of match
 * @param {string} defaultMatch How to split default values
 * @param {function} pipeFunction Pipe functions
 * @param {string} pipeMatch How to split into pipes
 * @param {string} pipeParamMatch How to split into pipe parameters
 *
 * @returns {string} Generated string
 */
export const injectValuesIntoString = (
  string,
  values,
  fallbackValue = null,
  start = '{{',
  end = '}}',
  defaultMatch = ':',
  pipeFunction = null,
  pipeMatch = '|',
  pipeParamMatch = ' ',
) => {
  const params = getStringParams(string, start, end);

  if (!params.length) {
    return string;
  }

  let result = '';
  let prevPosition = -1;
  let prevFormattedParam = '';

  for (let param of params) {
    let value = '';

    if (has(values, param)) {
      if (typeof get(values, param) === 'function') {
        value = get(values, param)();
      } else {
        value = get(values, param);
      }
    } else if (
      defaultMatch &&
      ~param.indexOf(defaultMatch) &&
      (param.indexOf(defaultMatch) < param.indexOf(pipeMatch) ||
        !~param.indexOf(pipeMatch))
    ) {
      const [extractedParam, defaultVal] = param.split(defaultMatch);
      if (extractedParam in values) {
        const valueContent = get(values, extractedParam);
        value =
          typeof valueContent === 'function' ? valueContent() : valueContent;
        if (pipeFunction !== null && pipeMatch && ~param.indexOf(pipeMatch)) {
          const [, ...pipes] = param.split(pipeMatch);
          value = pipes.reduce((acc, pipe) => {
            const [pipeName, ...pipeParams] = pipe.split(pipeParamMatch);
            return pipeFunction(pipeName, pipeParams, acc);
          }, value);
        }
      } else {
        if (pipeFunction !== null && pipeMatch && ~param.indexOf(pipeMatch)) {
          value = defaultVal.split(pipeMatch)[0];
        } else {
          value = defaultVal;
        }
      }
    } else if (
      pipeFunction !== null &&
      pipeMatch &&
      ~param.indexOf(pipeMatch)
    ) {
      const [extractedParam, ...pipes] = param.split(pipeMatch);
      if (extractedParam in values) {
        const valueContent = get(values, extractedParam);
        value =
          typeof valueContent === 'function' ? valueContent() : valueContent;
        value = pipes.reduce((acc, pipe) => {
          const [pipeName, ...pipeParams] = pipe.split(pipeParamMatch);
          return pipeFunction(pipeName, pipeParams, acc);
        }, value);
      } else {
        value = fallbackValue;
      }
    } else if (fallbackValue !== null) {
      value = fallbackValue;
    } else {
      if (prevPosition === -1) {
        prevPosition = 0;
      }

      continue;
    }

    const formattedParam = start + param + end;
    const position = string.indexOf(formattedParam, prevPosition + 1);
    result +=
      string.slice(
        (prevPosition === -1 ? 0 : prevPosition) + prevFormattedParam.length,
        position,
      ) + value;
    prevPosition = position;
    prevFormattedParam = formattedParam;
  }

  result += string.slice(prevPosition + prevFormattedParam.length);

  return result;
};

/**
 *
 *
 * @param {string} template
 * @param {object} object
 * @param {object} options
 *
 * @returns {string} A string with values injected properly
 */
export const renderTemplate = (template, object = {}, options = {}) => {
  const {
    loop = 'each',
    operation = '#',
    endOperation = 'end',
    fallbackValue = null,
    startDelimiter = '{{',
    endDelimiter = '}}',
    defaultMatch = ':',
    pipeFunction = null,
    pipeMatch = '|',
    pipeParamMatch = ' ',
  } = options;

  let result = template;
  const loopDelimiter = startDelimiter + operation + loop + ' ';
  const endLoopDelimiter =
    startDelimiter + operation + endOperation + endDelimiter;
  const endLoopDelimiterLength = endLoopDelimiter.length;
  const startDelimiterLength = startDelimiter.length;
  const endDelimiterLength = endDelimiter.length;
  if (~result.indexOf(loopDelimiter)) {
    const scopes = [];
    result = result.split(loopDelimiter).reduce((acc, next) => {
      const loopVariableEndIndex = next.indexOf(endDelimiter);
      if (loopVariableEndIndex === -1) {
        return acc + next;
      }
      const loopVariable = next.slice(0, loopVariableEndIndex).trim();
      const loopVariableValue = new Function(
        'return this.' + loopVariable,
      ).bind(object)();
      scopes.push(loopVariable);

      const endLoopIndex = next.indexOf(endLoopDelimiter);
      if (~endLoopIndex) {
        const loopContent = next.slice(
          loopVariableEndIndex + endDelimiterLength,
          endLoopIndex,
        );
        const loopContentRepeated = loopVariableValue
          .map((value, i) => {
            const values =
              typeof value === 'string'
                ? { this: value, $root: object, $index: i }
                : { ...value, this: value, $root: object, $index: i };
            return injectValuesIntoString(
              loopContent,
              values,
              fallbackValue,
              startDelimiter,
              endDelimiter,
              false,
              null,
              false,
              false,
            );
          })
          .join('');
        return (
          acc +
          loopContentRepeated +
          next.slice(endLoopIndex + endLoopDelimiterLength)
        );
      }
      return acc + loopDelimiter + next;
    }, '');
  }
  result = injectValuesIntoString(
    result,
    object,
    fallbackValue,
    startDelimiter,
    endDelimiter,
    defaultMatch,
    pipeFunction,
    pipeMatch,
    pipeParamMatch,
  );
  return result;
};
