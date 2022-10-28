import * as actionTypes from './types';
import { endpoints } from '../../api/endpoints';
import * as api from '../../api/base';

export const getAllReports = (options, isPolling=false) => async (dispatch) => {
  const response = await api.get(endpoints.chatbot.reports.getReports, options);
  if (response.status === 200) {
    return dispatch(getReportsSuccess(response.data, isPolling));
  }
  else
    return dispatch(getReportsFail(response.error));
};
const getReportsSuccess = (reports, isPolling) => {
  return {
    type: actionTypes.GET_REPORTS_SUCCESS,
    payload: {
      reports,
      isPolling
    }
  };
};
const getReportsFail = (error) => {
  return {
    type: actionTypes.GET_REPORTS_FAIL,
    payload: error
  };
};

export const setFilterdReports = (payload, filterParams) => async (dispatch) => {
  return dispatch(setFilters(payload, filterParams));
};

const setFilters = (payload, filterParams) => {
  return {
    type: actionTypes.SET_REPORT_FILTERS,
    payload,
    filterParams
  };
}

export const setFavorite = (alertId, isFavorite) => async (dispatch) => {
  const response = await api.post(endpoints.eventAlerts.setFavorite, { alert_id: alertId, is_favorite: isFavorite });
  if (response.status === 200) {
    return dispatch(setFavoriteSuccess(response.data));
  }
  else
    return dispatch(setFavoriteFail(response.error));
};
const setFavoriteSuccess = (msg) => {
  return {
    type: actionTypes.SET_FAV_REPORT_SUCCESS,
    msg,
  };
};
const setFavoriteFail = (error) => {
  return {
    type: actionTypes.SET_FAV_REPORT_FAIL,
    payload: error
  };
}

export const resetReportResponseState = () => {
  return {
    type: actionTypes.RESET_REPORT_STATE,
  }
};

export const getReportDetail = (id) => async (dispatch) => {
  const response = await api.get(endpoints.chatbot.reports.getReportInfo.replace(':report_id', id));
  if (response.status === 200) {
    return dispatch(getReportDetailSuccess(response.data));
  }
  else
    return dispatch(getReportDetailFail(response.error));
}

const getReportDetailSuccess = (alerts) => {
  return {
    type: actionTypes.GET_REPORT_DETAIL_SUCCESS,
    payload: alerts
  };
};
const getReportDetailFail = (error) => {
  return {
    type: actionTypes.GET_REPORT_DETAIL_FAIL,
    payload: error
  };
};
export const refreshReports = (payload) => {
  return {
    type: actionTypes.REFRESH_REPORTS,
    payload: payload
  };
}
