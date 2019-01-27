import React, { Component } from 'react';

export default class CustomComponent extends Component {
  render() {
    return <div dangerouslySetInnerHTML={{ __html: this.props.template }} />;
  }
}
