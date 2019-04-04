import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { HashRouter, BrowserRouter, withRouter } from 'react-router-dom';
import { IS_CHROME_EXTENSION, DEBUG } from './constants';

if (DEBUG) {
  console.log(
    '%cYou are using the debug mode in Notiwall. To disable, add line: `REACT_APP_DEBUG=false`, to ./.env.local',
    'color: rgba(160, 160, 160, .5)',
  );
}

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
