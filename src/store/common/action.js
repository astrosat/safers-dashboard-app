import * as actionTypes from './types';
import { endpoints } from '../../api/endpoints';
import * as api from '../../api/base';

export const generalInProgress = (msg) => async (dispatch) => {
  dispatch(InProgress(msg));
}
const InProgress = (msg) => {
  return {
    type: actionTypes.CM_WIP,
    payload: msg,
    isLoading: true
  };
};

export const getConfig = () => async (dispatch) => {
  const response = await api.get(endpoints.common.config);
  if (response.status === 200) {
    return dispatch(getConfigSuccess(response.data));
  }
  else
    return dispatch(getConfigFail(response.data));
};

export const getOrgList = () => async (dispatch) => {
  const response = await api.get(endpoints.common.organizations);
  if (response.status === 200) {
    return dispatch(getOrgListSuccess(response.data));
  }
  else
    return dispatch(getOrgListFail(response.data));
};

export const getRoleList = () => async (dispatch) => {
  const response = await api.get(endpoints.common.roles);
  if (response.status === 200) {
    return dispatch(getRoleListSuccess(response.data));
  }
  else
    return dispatch(getRoleListFail(response.data));
};

export const getTeamList = () => async (dispatch) => {
  const response = await api.get(endpoints.common.teams);
  if (api.isSuccessResp(response.status)) {
    return dispatch(getTeamListSuccess(response.data));
  }
  return dispatch(getTeamListFail(response.data));
};

const getConfigSuccess = (config) => {
  return {
    type: actionTypes.GET_CONFIG_SUCCESS,
    payload: config
  };
};
const getConfigFail = (error) => {
  return {
    type: actionTypes.GET_CONFIG_FAIL,
    payload: error
  };
};
const getTeamListSuccess = (roles) => {
  return {
    type: actionTypes.CM_GET_TEAMLIST_SUCCESS,
    payload: roles
  };
};
const getTeamListFail = (error) => {
  return {
    type: actionTypes.CM_GET_TEAMLIST_FAIL,
    payload: error
  };
};
const getRoleListSuccess = (roles) => {
  return {
    type: actionTypes.CM_GET_ROLELIST_SUCCESS,
    payload: roles
  };
};
const getRoleListFail = (error) => {
  return {
    type: actionTypes.CM_GET_ROLELIST_FAIL,
    payload: error
  };
};
const getOrgListSuccess = (user) => {
  return {
    type: actionTypes.CM_GET_ORGLIST_SUCCESS,
    payload: user
  };
};
const getOrgListFail = (error) => {
  return {
    type: actionTypes.CM_GET_ORGLIST_FAIL,
    payload: error
  };
};

export const getAllAreas = () => async (dispatch) => {
  const response = await api.get(endpoints.aoi.getAll);
  if (response.status === 200)
    return dispatch(getAoiSuccess(response.data));
  return dispatch(getAoiFail(response.data));
};

const getAoiSuccess = (aoi) => {
  return {
    type: actionTypes.GET_AOI_SUCCESS,
    payload: aoi
  };
};

const getAoiFail = (error) => {
  return {
    type: actionTypes.GET_AOI_FAIL,
    payload: error
  };
};

//SELECT AOI
export const setSelectedAoi = (aoi) => {
  return {
    type: actionTypes.SET_SELECTED_AOI,
    payload: aoi
  };
};
//SELECT VIEW STATE
export const setViewState = (viewState) => {
  return {
    type: actionTypes.SET_VIEW_STATE,
    payload: viewState
  };
};
//SELECT POLYGON LAYER
export const setPolygonLayer = (polygonLayer) => {
  return {
    type: actionTypes.SET_POLYGON_LAYER,
    payload: polygonLayer
  };
};

//SET DATE RANGE APP-WIDE
export const setDateRange = (dateRange) => {
  return {
    type: actionTypes.SET_DATE_RANGE,
    payload: dateRange
  }
}

//IsDateRangeDisabled
export const setDateRangeDisabled = (isDateRangeDisabled) => {
  return {
    type: actionTypes.SET_IS_DATE_RANGE_DISABLED,
    payload: isDateRangeDisabled
  }
}
