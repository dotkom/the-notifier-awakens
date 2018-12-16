import React from 'react';

export const IfPropIsOnline = ({
  props,
  else: inValid,
  prop,
  children = null,
  loading = null,
}) => {
  const propsToCheck = typeof prop === 'string' ? [prop] : prop;
  let isAllPropsOnline = true;
  let isAllPropsOffline = true;

  for (let i = 0; i < propsToCheck.length; i++) {
    const propToCheck = propsToCheck[i];
    if (props.isPropOffline(propToCheck)) {
      isAllPropsOnline = false;
    } else {
      isAllPropsOffline = false;
      if (!props.isPropOnline(propToCheck)) {
        isAllPropsOnline = false;
      }
    }
  }

  if (isAllPropsOnline) {
    return <>{children}</>;
  }

  if (isAllPropsOffline) {
    if (typeof inValid === 'function') {
      const apiNames = propsToCheck.map(p => props.getApiName(p));
      return <>{inValid(...apiNames)}</>;
    }
    return <>{inValid}</>;
  }

  if (typeof loading === 'function') {
    const counts = propsToCheck.map(p => props.getPropFailCount(p));
    return <span className="loading">{loading(...counts)}</span>;
  }
  return <span className="loading">{loading}</span>;
};
