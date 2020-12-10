import React from 'react';
import ReactDOM from 'react-dom';
import { OceanProvider } from '@oceanprotocol/react'
import './assets/main.css';
import App from './App';
import { ConfigHelper } from '@oceanprotocol/lib'


const configRinkeby = new ConfigHelper().getConfig('rinkeby')

const providerOptions = {}

export const web3ModalOpts = {
  cacheProvider: true,
  providerOptions
}


ReactDOM.render(
  <React.StrictMode>
    <OceanProvider initialConfig={configRinkeby} web3ModalOpts={web3ModalOpts}>
    <App />
    </OceanProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
