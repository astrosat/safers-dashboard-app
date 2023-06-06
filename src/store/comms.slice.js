import {
  createAsyncThunk,
  createSlice,
  createSelector,
} from '@reduxjs/toolkit';
import toastr from 'toastr';

import * as api from 'api/base';
import { OK } from 'api/constants';
import { endpoints } from 'api/endpoints';
import { getFilteredRecords } from 'pages/Chatbot/filter';

const name = 'comms';

export const fetchComms = createAsyncThunk(
  `${name}/fetchComms`,
  async (
    { options, feFilters = null, isPolling = false },
    { rejectWithValue },
  ) => {
    const response = await api.get(endpoints.chatbot.comms.getAll, options);

    if (response.status === OK) {
      return {
        isPolling,
        feFilters,
        data: response.data,
      };
    }

    return rejectWithValue({ error: true });
  },
);

export const createComms = createAsyncThunk(
  `${name}/createComms`,
  async (comms, { rejectWithValue }) => {
    const response = await api.post(endpoints.chatbot.comms.createMsg, comms);

    if (response.status === OK) {
      toastr.success(response.data.msg, '');
      return response.data;
    } else {
      return rejectWithValue({ error: true });
    }
  },
);

export const initialState = {
  allComms: [],
  pollingData: [],
  sortByDate: 'desc',
  alertSource: 'all',
  error: false,
  filteredComms: null,
};

const commsSlice = createSlice({
  name,
  initialState,
  reducers: {
    resetCommsResponseState: state => {
      state.error = false;
    },
    refreshData: (state, { payload }) => {
      state.allComms = payload;
      state.filteredComms = null;
      state.error = false;
    },
    setFilteredComms: (state, { payload }) => {
      state.filteredComms = payload;
      state.error = false;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchComms.fulfilled, (state, { payload }) => {
        if (payload.isPolling) {
          state.pollingData = payload.data;
          state.error = false;
        } else {
          const { target, status, sortOrder } = payload.feFilters ?? {};
          const filters = { target, status };
          const sort = { fieldName: 'start', order: sortOrder };
          const filteredComms = getFilteredRecords(payload.data, filters, sort);

          state.filteredComms = filteredComms;
          state.allComms = payload.data;
          state.error = false;
        }
      })
      .addCase(fetchComms.rejected, state => {
        state.error = true;
      })
      .addCase(createComms.fulfilled, state => {
        state.error = false;
      })
      .addCase(createComms.rejected, state => {
        state.error = true;
      });
  },
});

export const { resetCommsResponseState, refreshData, setFilteredComms } =
  commsSlice.actions;

const baseSelector = state => state?.comms;

export const allCommsSelector = createSelector(
  baseSelector,
  comms => comms?.allComms,
);

export const filteredCommsSelector = createSelector(
  baseSelector,
  comms => comms?.filteredComms,
);

export const commsPollingDataSelector = createSelector(
  baseSelector,
  comms => comms?.pollingData,
);

export default commsSlice.reducer;
