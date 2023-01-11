import { combineReducers } from 'redux';
import authReducer from './authentication/reducer';
import userReducer from './user/reducer';
import * as actionTypes from './authentication/types';
import commonReducer from './common/reducer';
import dashboardReducer from './dashboard/reducer';
import alertReducer from './alerts/reducer';
import dataLayerReducer from './datalayer/reducer';
import eventAlertReducer from './events/reducer';
import notificationsReducer from './notifications/reducer';
import inSituAlertReducer from './insitu/reducer';
import reportReducer from './reports/reducer';
import commsReducer from './comms/reducer';
import missionReducer from './missions/reducer';
import peopleReducer from './people/reducer';
import mapReducer from './map/map.slice';

import storage from 'redux-persist/lib/storage/session';//or session

const appReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
  common: commonReducer,
  dashboard: dashboardReducer,
  alerts: alertReducer,
  dataLayer: dataLayerReducer,
  eventAlerts: eventAlertReducer,
  inSituAlerts: inSituAlertReducer,
  notifications: notificationsReducer,
  reports: reportReducer,
  comms: commsReducer,
  missions: missionReducer,
  people: peopleReducer,
  map: mapReducer,
});

const rootReducer = (state, action) => {
  if (action.type === actionTypes.SIGN_OUT) {
    storage.removeItem('persist:root')
    // storage.removeItem('persist:otherKey')

    return appReducer(undefined, action);
  }
  return appReducer(state, action);
}
export default rootReducer;
