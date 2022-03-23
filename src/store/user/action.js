import * as actionTypes from './types';
import { endpoints } from '../../api/endpoints';
import * as api from '../../api/base';



export const setDefaultAoi = (uid, aoi) => async (dispatch) => {
  const endpoint = endpoints.user.profile + uid;
  const response = await api.patch(endpoint, { default_aoi: aoi });
  if (response.status === 200) {
    return dispatch(setAoiSuccess(aoi));
  }
  else
    return dispatch(setAoiFail(response.error));
};
const setAoiSuccess = (aoi) => {
  return {
    type: actionTypes.SET_AOI_SUCCESS,
    payload: aoi
  };
};

const setAoiFail = (error) => {
  return {
    type: actionTypes.SET_AOI_FAIL,
    payload: error
  };
};




