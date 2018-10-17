import React, { Component } from 'react';
import './App.css';

import { APIService } from './services';
import { API } from './utils';
import { defaultApis } from './defaults';

import { Clock } from './components/Clock';
import { Office } from './components/Office';

class App extends Component {
  constructor() {
    super();
    this.APIService = new APIService(API, defaultApis, console.log);

    this.startAPIs();
  }

  startAPIs() {
    this.APIService.start();
  }
  stopAPIs() {
    this.APIService.stop();
  }
  updateAPIs() {
    this.APIService.update();
  }

  render() {
    return (
      <div className="App">
        <div className="component-container">
          <Clock />
          <Office />
        </div>
      </div>
    );
  }
}

export default App;
