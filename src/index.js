import React from 'react';

import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import './index.scss';
import { PersistGate } from 'redux-persist/integration/react';

import { setupInterceptors } from 'api/base';
import { MapProvider } from 'components/BaseMap/MapContext';
import reportWebVitals from 'reportWebVitals';
import store, { persistor } from 'store';
import { extendGlobalValidators } from 'Utility/extendGlobalValidators';

import App from './App';

import 'react-tooltip/dist/react-tooltip.css';

setupInterceptors(store);

// adds all shared custom validator methods to global Yup object
extendGlobalValidators();

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <PersistGate persistor={persistor}>
      <BrowserRouter>
        <MapProvider>
          <App />
        </MapProvider>
      </BrowserRouter>
    </PersistGate>
  </Provider>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
