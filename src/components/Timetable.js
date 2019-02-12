import React, { Component } from 'react';

export default class Timetable extends Component {
  render() {
    return <div dangerouslySetInnerHTML={{ __html: this.props.timetable }} />;
  }
}
