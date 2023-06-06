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

const name = 'missions';

export const fetchMissions = createAsyncThunk(
  `${name}/fetchMissions`,
  async (
    { options, feFilters = null, isPolling = false },
    { rejectWithValue },
  ) => {
    const response = await api.get(
      endpoints.chatbot.missions.getMissions,
      options,
    );

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

export const fetchMissionDetail = createAsyncThunk(
  `${name}/fetchMissionDetail`,
  async (id, { rejectWithValue }) => {
    const response = await api.get(
      endpoints.chatbot.missions.getMissionInfo.replace(':mission_id', id),
    );

    if (response.status === OK) {
      return {
        data: response.data,
      };
    }

    return rejectWithValue({ error: true });
  },
);

export const createMission = createAsyncThunk(
  `${name}/createMission`,
  async (mission, { rejectWithValue }) => {
    const response = await api.post(
      endpoints.chatbot.missions.createMission,
      mission,
    );

    if (response.status === OK) {
      toastr.success(response.data.msg, '');
      return response.data;
    } else {
      return rejectWithValue({ error: true });
    }
  },
);

export const initialState = {
  allMissions: [],
  pollingData: [],
  sortByDate: 'desc',
  alertSource: 'all',
  error: false,
  filteredMissions: null,
  missionDetail: null,
  missionCreated: null,
};

const missionsSlice = createSlice({
  name,
  initialState,
  reducers: {
    resetMissionResponseState: state => {
      state.error = false;
      state.missionCreated = null;
    },
    refreshMissions: (state, { payload }) => {
      state.allMissions = payload;
      state.filteredMissions = null;
      state.error = false;
    },
    setFilteredMissions: (state, { payload }) => {
      state.filteredMissions = payload;
      state.error = false;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchMissions.fulfilled, (state, { payload }) => {
        if (payload.isPolling) {
          state.pollingData = payload.data;
          state.error = false;
        } else {
          const { order, status } = payload.feFilters ?? {};
          const filters = { status };
          const sort = { fieldName: 'start', order };
          const filteredMissions = getFilteredRecords(
            payload.data,
            filters,
            sort,
          );

          state.filteredMissions = filteredMissions;
          state.allMissions = payload.data;
          state.error = false;
        }
      })
      .addCase(fetchMissions.rejected, state => {
        state.error = true;
      })
      .addCase(fetchMissionDetail.fulfilled, (state, { payload }) => {
        state.missionDetail = payload.data;
        state.error = false;
      })
      .addCase(fetchMissionDetail.rejected, state => {
        state.error = true;
      })
      .addCase(createMission.fulfilled, (state, { payload }) => {
        state.missionCreated = payload;
        state.error = false;
      })
      .addCase(createMission.rejected, state => {
        state.error = true;
      });
  },
});

export const {
  resetMissionResponseState,
  refreshMissions,
  setFilteredMissions,
} = missionsSlice.actions;

const baseSelector = state => state?.missions;

export const allMissionsSelector = createSelector(
  baseSelector,
  missions => missions?.allMissions,
);

export const filteredMissionsSelector = createSelector(
  baseSelector,
  missions => missions?.filteredMissions,
);

export const missionsPollingDataSelector = createSelector(
  baseSelector,
  missions => missions?.pollingData,
);

export default missionsSlice.reducer;
