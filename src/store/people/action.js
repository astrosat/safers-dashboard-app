import * as actionTypes from './types';
import { endpoints } from '../../api/endpoints';
import * as api from '../../api/base';

export const getAllPeople = (options, feFilters) => async (dispatch) => {
  const response = await api.get(endpoints.chatbot.people.getAll, options);
  if (response.status === 200) {
    return dispatch(getPeopleSuccess(response.data, feFilters));
  }
  else
    return dispatch(getPeopleFail(response.error));
};
const getPeopleSuccess = (alerts, feFilters) => {
  return {
    type: actionTypes.GET_PEOPLE_SUCCESS,
    payload: alerts,
    feFilters
  };
};
export const setFilters = (alerts) => {
  return {
    type: actionTypes.SET_PEOPLE_FILTERS,
    payload: alerts
  };
};
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
