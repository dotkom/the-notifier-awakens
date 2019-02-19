import React, { Component } from 'react';

export default class HTML extends Component {
  render() {
    return <div dangerouslySetInnerHTML={{ __html: this.props.html }} />;
  }
}
