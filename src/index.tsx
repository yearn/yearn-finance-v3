import React from 'react';
import ReactDOM from 'react-dom';

import App from '@client';

import '@yearn-finance/web-lib/build.css';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
