import React, { Component } from 'react';
import './Logo.css';

export default class Logo extends Component {
  render() {
    return (
      <img
        className="logo-container"
        alt={`Logo for ${this.props.translate(this.props.affiliation)}`}
        src={this.props.url}
      />
    );
  }
}
