import * as actionTypes from './types';
import { updateObject } from '../utility';
import _ from 'lodash';

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
  let actFiltered = [...action.payload];
  const {activity, order} = action.options;
  if(activity && activity !== ''){
    actFiltered = actFiltered.filter((person) => person.activity == activity);
  }
  actFiltered = _.orderBy(actFiltered , [(o) => new Date(o.timestamp)], [order]);
  const updatedState = {
    filteredPeople: actFiltered,
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
