import React, { Component } from 'react';
import { Icon } from './';
import './Bike.css'

export default class Bike extends Component {
  render() {
    const { repos = [] } = this.props;
    return (
      <>
        <div>
            <Icon className='icon' name='Bicycle' style={{fontSize:'200%'}}></Icon>
            {this.props.bikes}
        </div>
        <div>
            <Icon className='icon' name='MdLockOpen' style={{fontSize:'200%'}}></Icon>
            {this.props.docks}
        </div>
      </>
    );
  }
}
