import * as actionTypes from './types';
import { endpoints } from '../../api/endpoints';
import * as api from '../../api/base';

export const getInfo = () => async (dispatch) => {
  const response = await api.get(endpoints.myprofile.getInfo);
  if (response.status === 200) {
    return dispatch(getInfoSuccess(response.data?.user));
  }
  else
    return dispatch(getInfoFail(response.error));
};
const getInfoSuccess = (user) => {
  return {
    type: actionTypes.MP_GET_SUCCESS,
    payload: user
  };
};
const getInfoFail = (error) => {
  return {
    type: actionTypes.MP_GET_FAIL,
    payload: error
  };
};

export const updateInfo = (userInfo) => async (dispatch) => {
  const response = await api.get(endpoints.myprofile.updateInfo, {userInfo});
  if (response.status === 200) {
    getInfo();
    return dispatch(updateInfoSuccess(response.data?.user));
  }
  else
    return dispatch(updateInfoFail(response.error));
};
const updateInfoSuccess = (user) => {
  return {
    type: actionTypes.MP_UPDATE_SUCCESS,
    payload: user
  };
};
const updateInfoFail = (error) => {
  return {
    type: actionTypes.MP_UPDATE_FAIL,
    payload: error
  };
};
