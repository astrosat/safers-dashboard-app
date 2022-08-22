import * as actionTypes from './types';
import { updateObject } from '../utility';
import { getFilteredRec } from '../../pages/Chatbot/filter';

const initialState = {
  allPeople: [],
  sortByDate: 'desc',
  alertSource: 'all',
  error: false,
  success: null,
  filteredPeople: null,
  peopleDetail: null
};

const peopleReducer = (state = initialState, action) => {
  switch (action.type) {
  case actionTypes.GET_PEOPLE_SUCCESS: return getPeopleSuccess(state, action);
  case actionTypes.GET_PEOPLE_FAIL: return getPeopleFail(state, action);
  case actionTypes.RESET_PEOPLE_STATE: return resetPeopleResponseState(state, action);
  case actionTypes.SET_PEOPLE_FILTERS: return setFilters(state, action);
  default:
    return state;
  }
};

const getPeopleSuccess = (state, action) => {
  const {activity, status, sortOrder} = action.feFilters;
  const filters = {activity, status};
  const sort = {fieldName: 'timestamp', order: sortOrder};
  const filteredPeople = getFilteredRec(action.payload, filters, sort);
  const updatedState = {
    filteredPeople,
    allPeople: action.payload,
    error: false,
  }
  return updateObject(state, updatedState);
}

const setFilters = (state, action) => {
  const updatedState = {
    filteredPeople: action.payload,
    error: false,
  }
  return updateObject(state, updatedState);
}

const getPeopleFail = (state) => {
  const updatedState = {
    error: true,
  }
  return updateObject(state, updatedState);
}

const resetPeopleResponseState = (state) => {
  const updatedState = {
    error: false,
    success: null
  }
  return updateObject(state, updatedState);
}

export default peopleReducer;
