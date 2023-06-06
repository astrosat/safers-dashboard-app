import React, { useEffect } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { Routes, Route } from 'react-router-dom';

import PreLoader from 'components/PreLoader';
import { publicRoutes, privateRoutes } from 'routes/allRoutes';
import Authmiddleware from 'routes/middleware/Authmiddleware';
import {
  fetchConfig,
  isLoadingSelector,
  loadingMessageSelector,
  configSelector,
} from 'store/common.slice';

const App = () => {
  const isLoading = useSelector(isLoadingSelector);
  const loadingMsg = useSelector(loadingMessageSelector);
  const config = useSelector(configSelector);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchConfig());
  }, [dispatch]);

  return config ? (
    <React.Fragment>
      <PreLoader isLoading={isLoading} loadingMsg={loadingMsg} />
      <Routes>
        {publicRoutes.map(route => (
          <Route
            key={route.path}
            path={route.path}
            element={<route.component />}
          />
        ))}
        {privateRoutes.map(route => (
          <Route
            key={route.path}
            path={route.path}
            element={
              <Authmiddleware
                path={route.path}
                component={route.component}
                isAuthProtected={true}
                exact
              />
            }
          />
        ))}
      </Routes>
    </React.Fragment>
  ) : null;
};

export default App;
