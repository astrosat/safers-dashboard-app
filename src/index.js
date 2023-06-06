import React from 'react';

import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { PersistGate } from 'redux-persist/integration/react';

import { setupInterceptors } from 'api/base';
import { MapProvider } from 'components/BaseMap/MapContext';
import reportWebVitals from 'reportWebVitals';
import store, { persistor } from 'store';
import { extendGlobalValidators } from 'Utility/extendGlobalValidators';

import App from './App';

import 'flatpickr/dist/themes/material_blue.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import 'react-datepicker/dist/react-datepicker.css';
import 'react-image-lightbox/style.css';
import 'react-rangeslider/lib/index.css';
import 'react-tooltip/dist/react-tooltip.css';
import 'rc-pagination/assets/index.css';
import 'toastr/build/toastr.min.css';

import 'assets/scss/theme.scss';
import './index.scss';

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
