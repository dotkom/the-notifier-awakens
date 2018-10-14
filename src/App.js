import React, { Component } from 'react';
import './App.css';

import { APIController } from './controllers';
import { API } from './utils';

class App extends Component {
  constructor() {
    super();
    this.APIController = new APIController(API);

    this.startAPIs();
  }

  startAPIs() {
    this.APIController.start();
  }
  stopAPIs() {
    this.APIController.stop();
  }
  updateAPIs() {
    this.APIController.update();
  }

  render() {
    return <div className="App" />;
  }
}

export default App;
