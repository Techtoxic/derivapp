import ReactDOM from 'react-dom';
import React from 'react';
import 'promise-polyfill';
import DDTraderIframeApp from './App/ddtrader-iframe-app';

const wrapper = document.getElementById('deriv_app');

if (wrapper) {
    ReactDOM.render(<DDTraderIframeApp />, wrapper);
}
