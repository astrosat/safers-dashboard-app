import * as actionTypes from './types';
import { updateObject } from '../utility';

const initialState = {
  dataLayers: [],
  currentLayer: {},
  featureInfo: {},
  timeSeries: '',
  error: false,
  success: null,
  metaData: null,
  isMetaDataLoading: null,
  mapRequest: {},
  allMapRequests: [],
  filteredMapRequests: [],
  params: {
    order: '-date',
    default_bbox: true,
    default_date: false
  },
  isPageActive: false,
  isNewAlert: false,
  newItemsCount: 0,
};

const dataLayerReducer = (state = initialState, action) => {
  switch (action.type) {
  case actionTypes.GET_DATA_LAYERS_SUCCESS: return getDataLayersSuccess(state, action);
  case actionTypes.GET_DATA_LAYERS_FAIL: return getDataLayersFail(state, action);
  case actionTypes.GET_META_DATA_SUCCESS: return getMetaDataSuccess(state, action);
  case actionTypes.META_DATA_LOADING: return getMetaLoading(state, action);
  case actionTypes.META_DATA_RESET: return resetMetaData(state, action);
  case actionTypes.GET_META_DATA_FAIL: return getMetaDataFail(state, action);
  case actionTypes.GET_TIME_SERIES_SUCCESS: return getTimeSeriesDataSuccess(state, action);
  case actionTypes.GET_FEATURE_INFO_SUCCESS: return getFeatureDataSuccess(state, action);
  case actionTypes.GET_TIME_SERIES_FAIL: return getTimeSeriesDataFail(state, action);
  case actionTypes.RESET_DATA_LAYER_STATE: return resetDataLayersResponseState(state, action);
  case actionTypes.POST_MAP_REQUESTS_SUCCESS: return postMapRequestSuccess(state, action);
  case actionTypes.POST_MAP_REQUESTS_FAIL: return postMapRequestFail(state, action);
  case actionTypes.DELETE_MAP_REQUESTS_FAIL: return deleteMapRequestFail(state, action);
  case actionTypes.GET_ALL_MAP_REQUESTS_SUCCESS: return getAllMapRequestsSuccess(state, action);
  case actionTypes.GET_ALL_MAP_REQUESTS_FAIL: return getAllMapRequestsFail(state, action);
  case actionTypes.SET_NEW_MAP_REQUEST_STATE: return setNewMapRequestState(state, action);
  case actionTypes.GET_ALL_FILTERED_MAP_REQUESTS_SUCCESS: return getAllFilteredMapRequestsSuccess(state, action);
  case actionTypes.GET_ALL_FILTERED_MAP_REQUESTS_FAIL: return getAllFilteredMapRequestsFail(state, action);
  case actionTypes.SET_MAP_REQUEST_PARAMS: return setMapRequestsParams(state, action)
  default:
    return state;
  }
};

const getDataLayersSuccess = (state, action) => {
  const updatedState = {
    dataLayers: action.payload,
    error: false,
  }
  return updateObject(state, updatedState);
}
const getDataLayersFail = (state) => {
  const updatedState = {
    error: true,
  }
  return updateObject(state, updatedState);
}

const resetDataLayersResponseState = (state, action) => {
  const updatedState = {
    metaData: action.payload,
    isMetaDataLoading: false,
    error: false,
    success: null
  }
  return updateObject(state, updatedState);
}

// Map requests (POST)
const postMapRequestSuccess = (state, action) => {
  const updatedState = {
    mapRequest: action.payload,
    error: false,
  }
  return updateObject(state, updatedState);
}
const postMapRequestFail = (state) => {
  const updatedState = {
    error: true,
    isMetaDataLoading: false
  }
  return updateObject(state, updatedState);
}

const deleteMapRequestFail = (state) => {
  const updatedState = {
    error: true,
    isMetaDataLoading: false
  }
  return updateObject(state, updatedState);
}

// All Map requests (GET)
const getAllMapRequestsSuccess = (state, action) => {
  const updatedState = {
    allMapRequests: action.payload,
    error: false,
  }
  return updateObject(state, updatedState);
}
const getAllMapRequestsFail = (state) => {
  const updatedState = {
    error: true,
  }
  return updateObject(state, updatedState);
}

// All Filtered Map requests (GET)
const getAllFilteredMapRequestsSuccess = (state, action) => {
  const updatedState = {
    filteredMapRequests: action.payload,
    error: false,
  }
  return updateObject(state, updatedState);
}
const getAllFilteredMapRequestsFail = (state) => {
  const updatedState = {
    error: true,
  }
  return updateObject(state, updatedState);
}

const setMapRequestsParams = (state, action) => {
  const updatedState = {
    params: action,
  }
  return updateObject(state, updatedState);
}

const setNewMapRequestState = (state, action) => {
  const updatedState = {
    isNewAlert: action.isNewAlert,
    isPageActive: action.isPageActive,
    newItemsCount: action.newItemsCount
  }
  return updateObject(state, updatedState);
}

const resetMetaData = (state) => {
  const updatedState = {
    metaData: null,
  }
  return updateObject(state, updatedState);
}
const getMetaLoading = (state) => {
  const updatedState = {
    isMetaDataLoading: true,
  }
  return updateObject(state, updatedState);
}
const getMetaDataSuccess = (state, action) => {
  const updatedState = {
    metaData: action.payload,
    isMetaDataLoading: false,
    error: false,
  }
  return updateObject(state, updatedState);
}
const getMetaDataFail = (state) => {
  const updatedState = {
    error: true,
    isMetaDataLoading: false
  }
  return updateObject(state, updatedState);
}

const getTimeSeriesDataSuccess = (state, action) => {
  const updatedState = {
    timeSeries: action.payload,
    error: false,
  }
  return updateObject(state, updatedState);
}

const getFeatureDataSuccess = (state, action) => {
  const updatedState = {
    featureInfo: action.payload,
    error: false,
  }
  return updateObject(state, updatedState);
}

const getTimeSeriesDataFail = (state) => {
  const updatedState = {
    error: true,
  }
  return updateObject(state, updatedState);
}

export default dataLayerReducer;
