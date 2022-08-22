import * as actionTypes from './types';
import { updateObject } from '../utility';
import { getFilteredRec } from '../../pages/Chatbot/filter';

const initialState = {
  allMissions: [],
  sortByDate: 'desc',
  alertSource: 'all',
  error: false,
  success: null,
  filteredMissions: null,
  missionDetail: null
};

const missionReducer = (state = initialState, action) => {
  switch (action.type) {
  case actionTypes.GET_MISSIONS_SUCCESS: return getMissionsSuccess(state, action);
  case actionTypes.GET_MISSIONS_FAIL: return getMissionsFail(state, action);
  case actionTypes.SET_FAV_MISSION_SUCCESS: return setFavoriteSuccess(state, action);
  case actionTypes.SET_FAV_MISSION_FAIL: return setFavoriteFail(state, action);
  case actionTypes.RESET_MISSION_STATE: return resetMissionResponseState(state, action);
  case actionTypes.SET_MISSION_FILTERS: return setFilters(state, action);
  case actionTypes.GET_MISSION_DETAIL_SUCCESS: return getMissionDetailSuccess(state, action);
  case actionTypes.GET_MISSION_DETAIL_FAIL: return getMissionDetailFail(state, action);
  default:
    return state;
  }
};

const getMissionDetailSuccess = (state, action) => {
  const updatedState = {
    missionDetail: action.payload,
    error: false,
  }
  return updateObject(state, updatedState);
}

const getMissionDetailFail = (state) => {
  const updatedState = {
    error: true,
  }
  return updateObject(state, updatedState);
}

const getMissionsSuccess = (state, action) => {
  const {order, status} = action.feFilters;
  const filters = { status };
  const sort = {fieldName: 'start', order };
  const filteredMissions = getFilteredRec( action.payload, filters, sort );
  
  const updatedState = {
    filteredMissions,
    allMissions: action.payload,
    error: false,
  }
  return updateObject(state, updatedState);
}

const setFilters = (state, action) => {
  const updatedState = {
    filteredMissions: action.payload,
    error: false,
  }
  return updateObject(state, updatedState);
}

const getMissionsFail = (state) => {
  const updatedState = {
    error: true,
  }
  return updateObject(state, updatedState);
}

const setFavoriteSuccess = (state, action) => {
  const updatedState = {
    success: action.msg,
    error: false,
  }
  return updateObject(state, updatedState);
}
const setFavoriteFail = (state) => {
  const updatedState = {
    error: true,
  }
  return updateObject(state, updatedState);
}

const resetMissionResponseState = (state) => {
  const updatedState = {
    error: false,
    success: null
  }
  return updateObject(state, updatedState);
}

export default missionReducer;
