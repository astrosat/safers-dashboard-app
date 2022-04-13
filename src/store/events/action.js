import * as actionTypes from './types';
import { endpoints } from '../../api/endpoints';
import * as api from '../../api/base';

export const getAllEventAlerts = (options) => async (dispatch) => {
  const response = await api.post(endpoints.eventAlerts.getAll, options);
  if (response.status === 200) {
    return dispatch(getEventAlertsSuccess(response.data));
  }
  else
    return dispatch(getEventAlertsFail(response.error));
};
const getEventAlertsSuccess = (alerts) => {
  return {
    type: actionTypes.GET_EVENT_ALERTS_SUCCESS,
    payload: alerts
  };
};
const getEventAlertsFail = (error) => {
  return {
    type: actionTypes.GET_EVENT_ALERTS_FAIL,
    payload: error
  };
};

export const setEventFavoriteAlert = (alertId, isFavorite) => async (dispatch) => {
  console.log('set favorite')
  const response = await api.post(endpoints.eventAlerts.setFavorite, { alert_id: alertId, is_favorite: isFavorite });
  if (response.status === 200) {
    return dispatch(setEventFavoriteAlertSuccess(response.data));
  }
  else
    return dispatch(setEventFavoriteAlertFail(response.error));
};
const setEventFavoriteAlertSuccess = (msg) => {
  return {
    type: actionTypes.SET_FAV_EVENT_ALERT_SUCCESS,
    msg,
  };
};
const setEventFavoriteAlertFail = (error) => {
  return {
    type: actionTypes.SET_FAV_EVENT_ALERT_FAIL,
    payload: error
  };
}

export const validateEventAlert = (alertId) => async (dispatch) => {
  const response = await api.post(endpoints.eventAlerts.validate, { alert_id: alertId });
  if (response.status === 200) {
    return dispatch(validateEventAlertSuccess(response.data));
  }
  else
    return dispatch(validateEventAlertFail(response.error));
};
const validateEventAlertSuccess = (msg) => {
  return {
    type: actionTypes.EVENTS_CREATE_EVENT_ALERT_FAIL,
    msg,
  };
};
const validateEventAlertFail = (error) => {
  return {
    type: actionTypes.EVENTS_CREATE_EVENT_ALERT_FAIL,
    payload: error
  };
};

export const editEventAlertInfo = (alertId, desc) => async (dispatch) => {
  const response = await api.patch(endpoints.eventAlerts.edit, { alert_id: alertId, description: desc });
  if (response.status === 200) {
    return dispatch(editEventAlertInfoSuccess(response.data));
  }
  else
    return dispatch(editEventAlertInfoFail(response.error));
};
const editEventAlertInfoSuccess = (msg) => {
  return {
    type: actionTypes.EDIT_EVENT_ALERT_INFO_SUCCESS,
    msg,
  };
};
const editEventAlertInfoFail = (error) => {
  return {
    type: actionTypes.EDIT_EVENT_ALERT_INFO_FAIL,
    payload: error
  };
};

export const resetEventAlertsResponseState = () => {
  return {
    type: actionTypes.RESET_EVENT_ALERT_STATE,
  }
};

export const setFilterdAlerts = (payload) => {
  return {
    type: actionTypes.SET_FILTERED_ALERTS,
    payload,
  };
};
export const setPaginatedAlerts = (payload) => {
  return {
    type: actionTypes.SET_PAGINATED_ALERTS,
    payload,
  };
};
export const setCurrentPage = (payload) => {
  return {
    type: actionTypes.SET_CURRENT_PAGE,
    payload,
  };
};
export const setAlertId = (payload) => {
  return {
    type: actionTypes.SET_ALERT_ID,
    payload,
  };
};
export const setHoverInfo = (payload) => {
  return {
    type: actionTypes.SET_HOVER_INFO,
    payload,
  };
};
export const setIconLayer = (payload) => {
  return {
    type: actionTypes.SET_ICON_LAYER,
    payload,
  };
};
export const setMidpoint = (payload) => {
  return {
    type: actionTypes.SET_MIDPOINT,
    payload,
  };
};
export const setZoomLevel = (payload) => {
  return {
    type: actionTypes.SET_ZOOM_LEVEL,
    payload,
  };
};
export const setSortByDate = (payload) => {
  return {
    type: actionTypes.SET_SORT_BY_DATE,
    payload,
  };
};
export const setAlertSource = (payload) => {
  return {
    type: actionTypes.SET_ALERT_SOURCE,
    payload,
  };
};
export const setDateRange = (payload) => {
  return {
    type: actionTypes.SET_DATE_RANGE,
    payload,
  };
};

export const getInSituMedia = (params) => async (dispatch) => {
  const response = await api.get(endpoints.dashboard.getInSitu, params);
  if (response.status === 200) {
    return dispatch(getInSituMediaSuccess(response.data));
  }
  else
    return dispatch(getInSituMediaFail(response.error));
};
const getInSituMediaSuccess = (data) => {
  return {
    type: actionTypes.EVENTS_IN_SITU_MEDIA_GET_SUCCESS,
    payload: data
  };
};
const getInSituMediaFail = (error) => {
  return {
    type: actionTypes.EVENTS_IN_SITU_MEDIA_GET_FAIL,
    payload: error
  };
};

export const getTweets = (params) => async (dispatch) => {
  const response = await api.get(endpoints.dashboard.getTweets, params);
  if (response.status === 200) {
    return dispatch(getTweetsSuccess(response.data));
  }
  else
    return dispatch(getTweetsFail(response.error));
};
const getTweetsSuccess = (data) => {
  return {
    type: actionTypes.EVENTS_TWEETS_GET_SUCCESS,
    payload: data
  };
};
const getTweetsFail = (error) => {
  return {
    type: actionTypes.EVENTS_TWEETS_GET_FAIL,
    payload: error
  };
};