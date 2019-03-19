import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { HashRouter, BrowserRouter, withRouter } from 'react-router-dom';
import { IS_CHROME_EXTENSION } from './constants';

const Root = withRouter(App);
const Router = IS_CHROME_EXTENSION ? HashRouter : BrowserRouter;

ReactDOM.render(
  <Router>
    <Root />
  </Router>,
  document.getElementById('root'),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
