import React, { Component } from 'react';

export default class CustomComponent extends Component {
  shouldComponentUpdate(nextProps) {
    for (const key in nextProps.apis) {
      if (key in this.props.apis) {
        if (nextProps[key] !== this.props[key]) {
          return true;
        }
      } else {
        return true;
      }
    }
    return false;
  }
  render() {
    return <div dangerouslySetInnerHTML={{ __html: this.props.template }} />;
  }
}
