import * as actionTypes from './types';
import { endpoints } from '../../api/endpoints';
import * as api from '../../api/base';


export const createMsg = (payload) => async (dispatch) => {
  const response = await api.post(endpoints.chatbot.comms.createMsg, payload);

  if (response.status === 200) {
    return dispatch(createMsgSuccess(response.data));
  }
  else
    return dispatch(createMsgFail(response.error));
};
const createMsgSuccess = (data) => {
  return {
    type: actionTypes.CREATE_MSG_SUCCESS,
    payload: data,
  };
};
const createMsgFail = (error) => {
  return {
    type: actionTypes.CREATE_MSG_FAIL,
    payload: error
  };
};
export const getAllComms = (options, feFilters=null, isPolling=false) => async (dispatch) => {
  const response = await api.get(endpoints.chatbot.comms.getAll, options);
  if (response.status === 200) {
    return dispatch(getCommsSuccess(response.data, feFilters, isPolling));
  }
  else
    return dispatch(getCommsFail(response.error));
};
const getCommsSuccess = (alerts, feFilters, isPolling) => {
  return {
    type: actionTypes.GET_COMMS_SUCCESS,
    payload: { 
      alerts,
      feFilters,
      isPolling
    }
  };
};
const getCommsFail = (error) => {
  return {
    type: actionTypes.GET_COMMS_FAIL,
    payload: error
  };
};

export const setFilterdComms = (payload) => async (dispatch) => {
  return dispatch(setFilters(payload));
};

const setFilters = (payload) => {
  return {
    type: actionTypes.SET_COMMS_FILTERS,
    payload: payload
  };
}

export const refreshData = (payload) => {
  return {
    type: actionTypes.REFRESH_MSG,
    payload: payload
  };
}

export const resetCommsResponseState = () => {
  return {
    type: actionTypes.RESET_COMMS_STATE,
  }
};


