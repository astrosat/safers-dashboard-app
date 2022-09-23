import * as actionTypes from './types';
import { endpoints } from '../../api/endpoints';
import * as api from '../../api/base';
import queryString from 'query-string';
import toastr from 'toastr';

// data layers

export const getAllDataLayers = (options) => async (dispatch) => {
  const response = await api.get(endpoints.dataLayers.getAll.concat('?', queryString.stringify(options)));
  if (response.status === 200) {
    return dispatch(getDataLayersSuccess(response.data));
  }
  else
    return dispatch(getDataLayersFail(response.error));
};
const getDataLayersSuccess = (DataLayers) => {
  return {
    type: actionTypes.GET_DATA_LAYERS_SUCCESS,
    payload: DataLayers
  };
};
const getDataLayersFail = (error) => {
  return {
    type: actionTypes.GET_DATA_LAYERS_FAIL,
    payload: error
  };
};

export const getMetaData = (endpoint) => async (dispatch) => {
  dispatch(metaDataLoading());
  const response = await api.get(endpoint);
  if (response.status === 200) {
    return dispatch(getMetaDataSuccess(response.data));
  }
  else
    return dispatch(getMetaDataFail(response.error));
};

const metaDataLoading = () => {
  return {
    type: actionTypes.META_DATA_LOADING,
  };
};

export const resetMetaData = () => {
  return {
    type: actionTypes.META_DATA_RESET,
  };
};
const getMetaDataSuccess = (DataLayers) => {
  return {
    type: actionTypes.GET_META_DATA_SUCCESS,
    payload: DataLayers
  };
};
const getMetaDataFail = (error) => {
  return {
    type: actionTypes.GET_META_DATA_FAIL,
    payload: error
  };
};

export const getDataLayerTimeSeriesData = (options, type) => async (dispatch) => {
  // const response = await api.get('https://geoserver-test.safers-project.cloud/geoserver/ermes/wms'.concat('?', queryString.stringify(options)));
  const response = await fetch(options);
  if (response.status === 200 && type == 'GetTimeSeries') {
    return dispatch(getTimeSeriesDataSuccess(await response.text()));
  } else if (response.status === 200 && type == 'GetFeatureInfo') {
    return dispatch(getFeatureInfoSuccess(await response.json()));
  }
  else
    return dispatch(getTimeSeriesDataFail(response.error));
};
const getTimeSeriesDataSuccess = (TimeSeries) => {
  return {
    type: actionTypes.GET_TIME_SERIES_SUCCESS,
    payload: TimeSeries
  };
};
const getFeatureInfoSuccess = (FeatureInfo) => {
  return {
    type: actionTypes.GET_FEATURE_INFO_SUCCESS,
    payload: FeatureInfo
  };
};
const getTimeSeriesDataFail = (error) => {
  return {
    type: actionTypes.GET_TIME_SERIES_FAIL,
    payload: error
  };
};

export const resetDataLayersResponseState = () => {
  return {
    type: actionTypes.RESET_DATA_LAYER_STATE,
  }
};

// Request a map (POST)
export const postMapRequest = (body) => async (dispatch) => {
  const response = await api.post(endpoints.dataLayers.mapRequests, body);
  if (response.status === 201) {
    toastr.success(`Successfully create a map request called ${response?.data.title}`, response.data?.category_info?.group)
    return dispatch(postMapRequestSuccess(response.data));
  }
  else {
    toastr.error(`Failure: ${response.status} - ${response.statusText}`, 'Post Map Error')
    return dispatch(postMapRequestFail(response.error));
  }
};

const postMapRequestSuccess = (mapRequest) => {
  return {
    type: actionTypes.POST_MAP_REQUESTS_SUCCESS,
    payload: mapRequest
  };
};
const postMapRequestFail = (error) => {
  return {
    type: actionTypes.POST_MAP_REQUESTS_FAIL,
    payload: error
  };
};

export const deleteMapRequest = (id) => async (dispatch) => {
  const response = await api.del(`${endpoints.dataLayers.mapRequests}${id}`);
  if (response.status === 204) {
    toastr.success(`Successfully deleted map request ${id}`, 'Delete Map Request')
  }
  else {
    toastr.error(`Failure: ${response.status} - ${response.statusText}`, 'Delete Map Request Error')
    return dispatch({
      type: actionTypes.DELETE_MAP_REQUESTS_FAIL,
      payload: response.error
    });
  }
};


// get All Map Requests (GET)
export const getAllMapRequests = (options) => async (dispatch) => {
  const response = await api.get(endpoints.dataLayers.mapRequests.concat('?', queryString.stringify(options)));
  if (response.status === 200) {
    return dispatch(getAllMapRequestsSuccess(response.data));
  }
  else
    return dispatch(getAllMapRequestsFail(response.error));
};

const getAllMapRequestsSuccess = (mapRequests) => {
  return {
    type: actionTypes.GET_ALL_MAP_REQUESTS_SUCCESS,
    payload: mapRequests
  };
};

const getAllMapRequestsFail = (error) => {
  return {
    type: actionTypes.GET_ALL_MAP_REQUESTS_FAIL,
    payload: error
  };
};

// get All Filtered Map Requests (GET)
export const getAllFilteredMapRequests = (options) => async (dispatch) => {
  const url = endpoints.dataLayers.mapRequests.concat('?', queryString.stringify(options))

  const response = await api.get(url);

  if (response.status === 200) {
    return dispatch(getAllFilteredMapRequestsSuccess(response.data));
  }
  else
    return dispatch(getAllFilteredMapRequestsFail(response.error));
};

export const setNewMapRequestState = (eventState, pageState, newItemsCount) => {
  return {
    type: actionTypes.SET_NEW_MAP_REQUEST_STATE,
    isNewAlert: eventState,
    isPageActive: pageState,
    newItemsCount
  }
};

const getAllFilteredMapRequestsSuccess = (mapRequests) => {
  return {
    type: actionTypes.GET_ALL_FILTERED_MAP_REQUESTS_SUCCESS,
    payload: mapRequests
  };
};

const getAllFilteredMapRequestsFail = (error) => {
  return {
    type: actionTypes.GET_ALL_FILTERED_MAP_REQUESTS_FAIL,
    payload: error
  };
};

export const setMapRequestParams = (payload) => {
  return {
    type: actionTypes.SET_MAP_REQUEST_PARAMS,
    payload,
  };
};
