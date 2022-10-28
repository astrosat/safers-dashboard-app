import * as actionTypes from './types';
import { updateObject } from '../utility';
import { getFilteredRec } from '../../pages/Chatbot/filter';

const initialState = {
  allMissions: [],
  pollingData: [],
  sortByDate: 'desc',
  alertSource: 'all',
  error: false,
  success: null,
  filteredMissions: null,
  missionDetail: null,
  missionCreated: null
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
  case actionTypes.CREATE_MISSION_SUCCESS: return createMissionSuccess(state, action);
  case actionTypes.CREATE_MISSION_FAIL: return createMissionsFail(state, action);
  case actionTypes.REFRESH_MISSIONS: return refreshData(state, action);
  default:
    return state;
  }
};

const createMissionSuccess = (state, action) => {
  const updatedState = {
    missionCreated: action.payload,
    error: false,
  }
  return updateObject(state, updatedState);
}

const createMissionsFail = (state) => {
  const updatedState = {
    error: true,
  }
  return updateObject(state, updatedState);
}

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

  let updatedState = {};

  if(action.payload.isPolling){
    updatedState = {
      pollingData: action.payload.alerts,
      error: false,
    }
  }
  else {
    const {order, status} = action.payload.feFilters;
    const filters = { status };
    const sort = {fieldName: 'start', order };
    const filteredMissions = getFilteredRec( action.payload.alerts, filters, sort );
    
    updatedState = {
      filteredMissions,
      allMissions: action.payload.alerts,
      error: false,
    }
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
    missionCreated: null,
    success: null
  }
  return updateObject(state, updatedState);
}

const refreshData = (state, action) => {
  const updatedState = {
    allMissions: action.payload,
    filteredMissions: null,
    error: false,
  }
  return updateObject(state, updatedState);
}

export default missionReducer;
