import * as actionTypes from './types';
import { endpoints } from '../../api/endpoints';
import * as api from '../../api/base';
import { setSession, deleteSession, getSession } from '../../helpers/authHelper';
import _ from 'lodash';

export const signInOauth2 = ({authCode}) => async (dispatch) => {

  const API_BASE_URL = 'http://localhost:8000'
  const response = await fetch(`${API_BASE_URL}/api/oauth2/login`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      code: authCode,
    })
  })
  const content = await response.json()
  if (response.status === 200) {
    const sessionData = {
      access_token: content.token, 
      // refresh_token: response.data.refresh_token, 
      userId: content.user.id
    };
    setSession(sessionData, false);
    if (content.user?.default_aoi) {
      dispatch(setAoiBySignInSuccess(content.user?.default_aoi));
    }
    return dispatch(signInSuccess(content.user));
  }
  return dispatch(signInFail(content.detail));
}

export const signIn = ({email, password, rememberMe}) => async (dispatch) => {
  const response = await api.post(endpoints.authentication.signIn, { email, password });//should be post with the backend
  if (response.status === 200) {
    const sessionData = {
      access_token: response.data.access_token, 
      refresh_token: response.data.refresh_token, 
      userId: response.data.user.id
    };
    setSession(sessionData, rememberMe);
    if (response.data?.user.default_aoi) {
      dispatch(setAoiBySignInSuccess(response.data?.user.default_aoi));
    }
    return dispatch(signInSuccess(response.data.user));
  }
  return dispatch(signInFail(response.data));
};

const setAoiBySignInSuccess = (aoi) => {
  return {
    type: actionTypes.SET_AOI_SUCCESS,
    payload: aoi
  };
};

export const isRemembered = () => async (dispatch) => {
  const session = getSession();
  if(session && !_.isEmpty(session)) {
    const response = await api.post(endpoints.authentication.refreshToken, {
      'refresh': session.refresh_token
    });
    if (response.status === 200) {
      const newSession = {...session, access_token: response.data.access}
      setSession(newSession, true);
      return dispatch(signInSuccess(newSession.user));
    }
    return dispatch(signInFail(response.data));
  }
}

export const signInSuccess = (user) => {
  return {
    type: actionTypes.SIGN_IN_SUCCESS,
    payload: user
  };
};
const signInFail = (error) => {
  return {
    type: actionTypes.SIGN_IN_FAIL,
    payload: error
  };
};

export const signUp = (userInfo) => async (dispatch) => {
  const response = await api.post(endpoints.authentication.signUp, { ...userInfo });
  if (api.isSuccessResp(response.status)) {
    return dispatch(signUpSuccess(response.data));
  }
  
  return dispatch(signUpFail(response.data));
};
const signUpSuccess = (user) => {
  return {
    type: actionTypes.SIGN_UP_SUCCESS,
    payload: user
  };
};
const signUpFail = (error) => {
  return {
    type: actionTypes.SIGN_UP_FAIL,
    payload: error
  };
};

export const reqResetPsw = (email) => async (dispatch) => {
  const response = await api.post(endpoints.authentication.forgotPswReset, email);// To Do: change to post when API ready
  if (response.status === 200)
    return dispatch(reqResetPswSuccess(response.data));
  else
    return dispatch(reqResetPswFail(response.error));
};
const reqResetPswSuccess = (res) => {
  return {
    type: actionTypes.FORGOT_PASSWORD_SUCCESS,
    payload: res
  };
};
const reqResetPswFail = (error) => {
  return {
    type: actionTypes.FORGOT_PASSWORD_FAIL,
    payload: error
  };
};
export const resetPsw = (data) => async (dispatch) => {
  const response = await api.post(endpoints.authentication.resetPsw, { ...data });
  if (response.status === 200)
    return dispatch(resetPswSuccess(response.data));
  
  return dispatch(resetPswFail(response.data));
};
const resetPswSuccess = (res) => {
  return {
    type: actionTypes.RESET_PASSWORD_SUCCESS,
    payload: res
  };
};
const resetPswFail = (error) => {
  return {
    type: actionTypes.RESET_PASSWORD_FAIL,
    payload: error
  };
};



export const signOut = () => async (dispatch) => {
  const response = await api.post(endpoints.authentication.signOut);
  if (response.status === 200) {
    deleteSession();
    return dispatch(signOutSuccess());
  }
};

const signOutSuccess = () => {
  return {
    type: actionTypes.SIGN_OUT,
  };
};

