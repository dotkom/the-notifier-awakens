import React, { Component } from 'react';
import * as Fa from 'react-icons/fa';
import * as Io from 'react-icons/io';
import * as Md from 'react-icons/md';
import * as Ti from 'react-icons/ti';
import * as Go from 'react-icons/go';
import * as Fi from 'react-icons/fi';
import * as Gi from 'react-icons/gi';
import { IconContext } from 'react-icons';

export default class Icon extends Component {
  render() {
    const { name, color, className, style, size } = this.props;
    if (name) {
      let IconFound = null;
      if (`Fa${name}` in Fa) IconFound = Fa[`Fa${name}`];
      else if (`Io${name}` in Io) IconFound = Io[`Io${name}`];
      else if (`Md${name}` in Md) IconFound = Md[`Md${name}`];
      else if (`Ti${name}` in Ti) IconFound = Ti[`Ti${name}`];
      else if (`Go${name}` in Go) IconFound = Go[`Go${name}`];
      else if (`Fi${name}` in Fi) IconFound = Fi[`Fi${name}`];
      else if (`Gi${name}` in Gi) IconFound = Gi[`Gi${name}`];
      else if (name in Fa) IconFound = Fa[name];
      else if (name in Io) IconFound = Io[name];
      else if (name in Md) IconFound = Md[name];
      else if (name in Ti) IconFound = Ti[name];
      else if (name in Go) IconFound = Go[name];
      else if (name in Fi) IconFound = Fi[name];
      else if (name in Gi) IconFound = Gi[name];

      if (IconFound !== null) {
        return (
          <IconContext.Provider
            value={{
              color,
              className,
              style: { ...style, ...(size && { fontSize: size }) },
            }}
          >
            <IconFound />
          </IconContext.Provider>
        );
      }

      throw new Error(`Cannot find any Icon named "${name}"`);
    } else {
      throw new Error('Missing "name" prop on Icon');
    }
  }
}
