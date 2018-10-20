import React, { Component } from 'react';
import './App.css';

import { APIService } from './services';
import { ComponentController } from './controllers';
import { API } from './utils';
import { defaultApis, defaultAffiliationSettings } from './defaults';

class App extends Component {
  constructor() {
    super();
    this.APIService = new APIService(API, defaultApis, console.log);
    this.ComponentController = new ComponentController(
      defaultAffiliationSettings.components,
    );

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
        <div className="component-container" />
      </div>
    );
  }
}

export default App;
