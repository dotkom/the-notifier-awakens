import React, { Component } from 'react';
import './CIStatus.css';

export default class CIStatus extends Component {
  render() {
    return (
      <>
        {(this.props.builds || []).slice(0, 5).map((e, i) => (
          <div key={i}>
            <img src={e.image} alt={e.user} />
            <span style={{ color: e.status === 'success' ? 'lime' : 'red' }}>
              {e.message}
            </span>
          </div>
        ))}
      </>
    );
  }
}
