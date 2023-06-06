import {
  createAsyncThunk,
  createSlice,
  createSelector,
} from '@reduxjs/toolkit';
import storage from 'redux-persist/lib/storage/session';

import * as api from 'api/base';
import { OK, NO_CONTENT } from 'api/constants';
import { endpoints } from 'api/endpoints';
import { deleteSession, getSession } from 'helpers/authHelper';
import { redirectAfterSignOut } from 'store/authentication.slice';

const name = 'user';

export const setUserDefaultAoi = createAsyncThunk(
  `${name}/setUserDefaultAoi`,
  async (user, { rejectWithValue }) => {
    const response = await api.put(`${endpoints.user.profile}${user.id}`, {
      ...user,
      default_aoi: user?.default_aoi.features[0].properties.id,
    });

    if (response.status === OK) {
      return {
        aoi: user?.default_aoi,
        msg: response.data,
      };
    }

    return rejectWithValue({ error: true });
  },
);

export const fetchUserProfile = createAsyncThunk(
  `${name}/fetchUserProfile`,
  async (id, { rejectWithValue }) => {
    const response = await api.get(`${endpoints.user.profile}${id}`);

    if (response.status === OK) {
      return response.data;
    }

    return rejectWithValue({ error: true });
  },
);

export const updateUserProfile = createAsyncThunk(
  `${name}/updateUserProfile`,
  async (user, { rejectWithValue }) => {
    const response = await api.put(`${endpoints.user.profile}${user.id}`, user);

    if (response.status === OK) {
      return response.data;
    }

    return rejectWithValue({ error: true });
  },
);

export const deleteUserProfile = createAsyncThunk(
  `${name}/deleteUserProfile`,
  async (id, { rejectWithValue }) => {
    const session = getSession();

    const response = await api.del(`${endpoints.user.profile}${id}`);

    if (response.status === NO_CONTENT) {
      deleteSession();
      storage.removeItem('persist:root');

      if (session.isSSOsession) {
        redirectAfterSignOut();
      }

      return;
    }

    return rejectWithValue({ error: true });
  },
);

export const resetUserPassword = createAsyncThunk(
  `${name}/resetUserPassword`,
  async (params, { rejectWithValue }) => {
    const response = await api.post(endpoints.user.resetPsw, { ...params });

    if (response.status === OK) {
      return response.data;
    }

    return rejectWithValue({ error: true });
  },
);

export const initialState = {
  defaultAoi: null,
  info: null,
  error: false,
  getAOIerror: false,
  updateStatus: null,
  setAoiSuccessMessage: null,
  resetPasswordSuccessMessage: null,
  resetPswFailRes: null,
};

const userSlice = createSlice({
  name,
  initialState,
  reducers: {
    resetStatus: state => {
      state.updateStatus = null;
    },
    setDefaultAoi: (state, { payload }) => {
      state.defaultAoi = payload;
    },
    resetSetAoiSuccessMessage: state => {
      state.setAoiSuccessMessage = null;
    },
    setUserInfo: (state, { payload }) => {
      state.info = payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(setUserDefaultAoi.fulfilled, (state, { payload }) => {
        state.defaultAoi = payload.aoi;
        state.setAoiSuccessMessage = payload.msg;
        state.error = false;
      })
      .addCase(setUserDefaultAoi.rejected, state => {
        state.error = true;
      })
      .addCase(fetchUserProfile.fulfilled, (state, { payload }) => {
        state.info = payload;
        state.error = false;
      })
      .addCase(fetchUserProfile.rejected, state => {
        state.error = true;
      })
      .addCase(updateUserProfile.fulfilled, (state, { payload }) => {
        state.info = payload;
        state.updateStatus = true;
        state.error = false;
      })
      .addCase(updateUserProfile.rejected, state => {
        state.updateStatus = false;
        state.error = true;
      })
      .addCase(deleteUserProfile.fulfilled, (state, { payload }) => {
        state.error = false;
      })
      .addCase(deleteUserProfile.rejected, (state, { payload }) => {
        state.error = true;
      })
      .addCase(resetUserPassword.fulfilled, (state, { payload }) => {
        state.resetPasswordSuccessMessage = payload;
        state.error = false;
      })
      .addCase(resetUserPassword.rejected, state => {
        state.error = true;
      });
  },
});

export const {
  resetStatus,
  setDefaultAoi,
  resetSetAoiSuccessMessage,
  setUserInfo,
} = userSlice.actions;

const baseSelector = state => state?.user;

export const defaultAoiSelector = createSelector(
  baseSelector,
  user => user?.defaultAoi,
);

export const setAoiSuccessMessageSelector = createSelector(
  baseSelector,
  user => user?.setAoiSuccessMessage,
);

export const userInfoSelector = createSelector(
  baseSelector,
  user => user?.info,
);

export const updateStatusSelector = createSelector(
  baseSelector,
  user => user?.updateStatus,
);

export const resetPswFailResSelector = createSelector(
  baseSelector,
  user => user?.resetPswFailRes,
);

export const resetPasswordSuccessMessageSelector = createSelector(
  baseSelector,
  user => user?.resetPasswordSuccessMessage,
);

export default userSlice.reducer;
