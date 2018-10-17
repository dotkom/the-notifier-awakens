import React, { Component } from 'react';
import './Office.css';

export class Office extends Component {
  constructor(){
    super();
    this.state = {servants:["Anne", "Malin", "Emilie", "Gunvor"]};
  }
  render() {
    let list = this.state.servants.map((e, i) => <li key={i}>{e}</li>)
    return (<>
      <h2>Kontorvakt</h2>
      <ul>
        {list}
      </ul>
    </>);
  }
}
