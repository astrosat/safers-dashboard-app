import * as actionTypes from './types';
import { endpoints } from '../../api/endpoints';
import * as api from '../../api/base';

export const getAllComms = (options) => async (dispatch) => {
  const response = await api.get(endpoints.chatbot.comms.getAll, options);
  if (response.status === 200) {
    return dispatch(getCommsSuccess(response.data));
  }
  else
    return dispatch(getCommsFail(response.error));
};
const getCommsSuccess = (alerts) => {
  return {
    type: actionTypes.GET_COMMS_SUCCESS,
    payload: alerts
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

export const resetCommsResponseState = () => {
  return {
    type: actionTypes.RESET_COMMS_STATE,
  }
};


