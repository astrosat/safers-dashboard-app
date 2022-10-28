import * as actionTypes from './types';
import { endpoints } from '../../api/endpoints';
import * as api from '../../api/base';

export const getAllPeople = (options, feFilters=null, isPolling=false) => async (dispatch) => {
  const response = await api.get(endpoints.chatbot.people.getAll, options);
  if (response.status === 200) {
    return dispatch(getPeopleSuccess(response.data, feFilters, isPolling));
  }
  else
    return dispatch(getPeopleFail(response.error));
};
const getPeopleSuccess = (alerts, feFilters, isPolling) => {
  return {
    type: actionTypes.GET_PEOPLE_SUCCESS,
    payload: {
      alerts,
      feFilters,
      isPolling
    },
  };
};
export const setFilters = (alerts) => {
  return {
    type: actionTypes.SET_PEOPLE_FILTERS,
    payload: alerts
  };
};

export const refreshPeople = (payload) => {
  return {
    type: actionTypes.REFRESH_PEOPLE,
    payload: payload
  };
}

const getPeopleFail = (error) => {
  return {
    type: actionTypes.GET_PEOPLE_FAIL,
    payload: error
  };
};

export const resetPeopleResponseState = () => {
  return {
    type: actionTypes.RESET_PEOPLE_STATE,
  }
};
