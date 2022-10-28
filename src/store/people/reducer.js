import * as actionTypes from './types';
import { updateObject } from '../utility';
import { getFilteredRec } from '../../pages/Chatbot/filter';

const initialState = {
  allPeople: [],
  pollingData: [],
  sortByDate: 'desc',
  alertSource: 'all',
  error: false,
  success: null,
  peopleDetail: null
};

const peopleReducer = (state = initialState, action) => {
  switch (action.type) {
  case actionTypes.GET_PEOPLE_SUCCESS: return getPeopleSuccess(state, action);
  case actionTypes.GET_PEOPLE_FAIL: return getPeopleFail(state, action);
  case actionTypes.RESET_PEOPLE_STATE: return resetPeopleResponseState(state, action);
  case actionTypes.SET_PEOPLE_FILTERS: return setFilters(state, action);
  case actionTypes.REFRESH_PEOPLE: return refreshData(state, action);
  default:
    return state;
  }
};

const getPeopleSuccess = (state, action) => {

  let updatedState = {};

  if(action.payload.isPolling){
    updatedState = {
      pollingData: action.payload.alerts,
      error: false,
    }
  } else {
    const {activity, status, sortOrder} = action.payload.feFilters;
    const filters = {activity, status};
    const sort = {fieldName: 'timestamp', order: sortOrder};
    const filteredPeople = getFilteredRec(action.payload.alerts, filters, sort);
    updatedState = { filteredPeople, allPeople: action.payload.alerts };
  }

  return updateObject(state, updatedState);
}

const refreshData = (state, action) => {
  const updatedState = {
    allPeople: action.payload,
    filteredPeople: null,
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
