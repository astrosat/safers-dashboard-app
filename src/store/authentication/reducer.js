import * as actionTypes from './types';
import { updateObject } from '../utility';

const initialState = {
  user: {},
  isLoggedIn: false,
  error: false,
  //loading: false
};

const ingredientsReducer = (state = initialState, action) => {
  switch (action.type) {
  case actionTypes.SIGN_IN_SUCCESS: return signInSuccess(state, action);
  case actionTypes.SIGN_IN_FAIL: return signInFail(state, action);
  case actionTypes.SIGN_UP_SUCCESS: return signUpSuccess(state, action);
  case actionTypes.SIGN_UP_FAIL: return signUpFail(state, action);
  case actionTypes.SIGN_OUT: return signOut(state, action);
  default:
    return state;
  }
};

const signInSuccess = (state, action) => {
  const updatedState = {
    user: action.payload,
    isLoggedIn: true,
    error: false,
  }
  return updateObject(state, updatedState);
}

const signInFail = (state) => {
  const updatedState = {
    error: true,
  }
  return updateObject(state, updatedState);
}

const signUpSuccess = (state, action) => {
  const updatedState = {
    user: action.payload,
    isLoggedIn: true,
    error: false,
  }
  return updateObject(state, updatedState);
}

const signUpFail = (state) => {
  return updateObject(state, { error: true });
};

const signOut = (state) => {
  const updatedState = initialState;
  return updateObject(state, updatedState);
}


export default ingredientsReducer;