import React, { Component } from 'react';
import './App.css';

import { APIService } from './services';
import { API } from './utils';

class App extends Component {
  constructor() {
    super();
    this.APIService = new APIService(API);

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
    return <div className="App" />;
  }
}

export default App;
