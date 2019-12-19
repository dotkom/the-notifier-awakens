import React from 'react';
import './Logo.css';

const Logo = props => {
  return (
    <img
      style={{ filter: props.filter || '' }}
      className="logo-container"
      alt={`Logo for ${props.translate(props.group)}`}
      src={props.url}
    />
  );
};

export default Logo;
