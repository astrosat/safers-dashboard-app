import * as actionTypes from './types';
import { updateObject } from '../utility';

import {getDefaultDateRange} from '../utility'

const initialState = {
  config: undefined,
  orgList: [],
  roleList: [],
  aois: [],
  selectedAoi: null,
  viewState: undefined,
  polygonLayer: undefined,
  isLoading: false,
  loadingMsg: null,
  dateRange: getDefaultDateRange(),
  isDateRangeDisabled: false
};

const commonReducer = (state = initialState, action) => {
  switch (action.type) {
  case actionTypes.GET_CONFIG_SUCCESS: return getConfigSuccess(state, action);
  case actionTypes.GET_CONFIG_FAIL: return getConfigFail(state, action);
  case actionTypes.CM_GET_ORGLIST_SUCCESS: return getOrgListSuccess(state, action);
  case actionTypes.CM_GET_ORGLIST_FAIL: return getOrgListFail(state, action);
  case actionTypes.CM_GET_ROLELIST_SUCCESS: return getRoleListSuccess(state, action);
  case actionTypes.CM_GET_ROLELIST_FAIL: return getRoleListFail(state, action);
  case actionTypes.CM_GET_TEAMLIST_SUCCESS: return getTeamListSuccess(state, action);
  case actionTypes.CM_GET_TEAMLIST_FAIL: return getTeamListFail(state, action);
  case actionTypes.GET_AOI_SUCCESS: return getAoiSuccess(state, action);
  case actionTypes.GET_AOI_FAIL: return getAoiFail(state, action);
  case actionTypes.SET_SELECTED_AOI: return selectAoi(state, action);
  case actionTypes.SET_VIEW_STATE: return setViewState(state, action);
  case actionTypes.SET_POLYGON_LAYER: return setPolygonLayer(state, action);
  case actionTypes.SET_DATE_RANGE: return setDateRange(state, action);
  case actionTypes.CM_WIP: return isSiteLoading(state, action);
  case actionTypes.SET_IS_DATE_RANGE_DISABLED: return setDateRangeDisabled(state, action);
  default:
    return state;
  }
};

const isSiteLoading = (state, action) => {
  const updatedState = {
    loadingMsg: action.payload,
    isLoading: action.isLoading,
  }
  return updateObject(state, updatedState);
}

const getConfigSuccess = (state, action) => {
  const updatedState = {
    config: action.payload,
    error: false,
  }
  return updateObject(state, updatedState);
}

const getConfigFail = (state) => {
  const updatedState = {
    error: true,
  }
  return updateObject(state, updatedState);
}
const getOrgListSuccess = (state, action) => {
  const updatedState = {
    orgList: action.payload,
    error: false,
  }
  return updateObject(state, updatedState);
}

const getOrgListFail = (state) => {
  const updatedState = {
    error: true,
  }
  return updateObject(state, updatedState);
}

const getRoleListSuccess = (state, action) => {
  const updatedState = {
    roleList: action.payload,
    error: false,
  }
  return updateObject(state, updatedState);
}

const getRoleListFail = (state) => {
  const updatedState = {
    error: true,
  }
  return updateObject(state, updatedState);
}

const getTeamListSuccess = (state, action) => {
  const updatedState = {
    teamList: action.payload,
    error: false,
  }
  return updateObject(state, updatedState);
}

const getTeamListFail = (state) => {
  const updatedState = {
    error: true,
  }
  return updateObject(state, updatedState);
}

//aois
const getAoiSuccess = (state, action) => {
  const updatedState = {
    aois: action.payload,
    error: false,
  }
  return updateObject(state, updatedState);
}

const getAoiFail = (state, action) => {
  const updatedState = {
    getAOIerror: action.payload,
  }
  return updateObject(state, updatedState);
}

const selectAoi = (state, action) => {
  const updatedState = {
    selectedAoi: action.payload,
  }
  return updateObject(state, updatedState);
}
const setViewState = (state, action) => {
  const updatedState = {
    viewState: action.payload,
  }
  return updateObject(state, updatedState);
}
const setPolygonLayer = (state, action) => {
  const updatedState = {
    polygonLayer: action.payload,
  }
  return updateObject(state, updatedState);
}
const setDateRange = (state, action) => {
  const updatedState = {
    dateRange: action.payload
  }
  return updateObject(state, updatedState);
}

//isDateRangeDisabled
const setDateRangeDisabled = (state, action) => {
  const updatedState = {
    isDateRangeDisabled: action.payload
  }
  return updateObject(state, updatedState);
}

export default commonReducer;
