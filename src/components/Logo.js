import React, { Component } from 'react';
import './Logo.css';

export default class Logo extends Component {
  render() {
    return (
      <div
        className="logo-container"
        style={{ backgroundImage: `url(${this.props.url})` }}
      />
    );
  }
}
